import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // The business record was created up-front by createCheckoutSession;
        // metadata carries only its id. Guard against missing data so a malformed
        // event doesn't throw (which would make Stripe retry forever).
        const businessId = session.metadata?.business_id;
        const listingTier = session.metadata?.listing_tier;
        if (!businessId) {
          console.warn('checkout.session.completed without business_id metadata; skipping');
          break;
        }

        const existing = await base44.asServiceRole.entities.Business.filter({ id: businessId });
        const business = existing[0];
        if (!business) {
          console.warn(`Business ${businessId} not found for completed checkout; skipping`);
          break;
        }

        const mode = session.metadata?.mode || 'new';
        const subscriptionId = session.subscription
          ? (await stripe.subscriptions.retrieve(session.subscription)).id
          : null;

        // Idempotency: Stripe redelivers events. Skip if THIS session's
        // subscription was already recorded. (Can't use payment_status alone:
        // an upgrade targets a business that is already 'paid'.)
        if (subscriptionId && business.stripe_subscription_id === subscriptionId) {
          console.log('Session already processed, skipping duplicate event:', businessId);
          break;
        }
        if (mode !== 'upgrade' && business.payment_status === 'paid') {
          console.log('Business already marked paid, skipping duplicate event:', businessId);
          break;
        }

        const oldSubscriptionId = business.stripe_subscription_id;

        await base44.asServiceRole.entities.Business.update(businessId, {
          payment_status: 'paid',
          stripe_customer_id: session.customer || business.stripe_customer_id || null,
          stripe_subscription_id: subscriptionId,
          listing_tier: listingTier || business.listing_tier,
          listing_rank: listingTier === 'premium' ? 10 : listingTier === 'pro' ? 5 : 1,
        });

        // An upgrade creates a NEW subscription; cancel the old one so the
        // customer isn't billed for both plans.
        if (oldSubscriptionId && subscriptionId && oldSubscriptionId !== subscriptionId) {
          try {
            await stripe.subscriptions.cancel(oldSubscriptionId);
            console.log('Cancelled superseded subscription:', oldSubscriptionId);
          } catch (cancelError) {
            console.error('Failed to cancel old subscription', oldSubscriptionId, cancelError);
          }
        }

        // Confirmation email is best-effort: a send failure must not 400 the
        // event (the idempotency guard would block the retry's email anyway).
        try {
          const toEmail = session.customer_details?.email || session.customer_email;
          if (toEmail) {
            const emailBody = mode === 'upgrade'
              ? `Hello,\n\nThank you for your payment! Your listing "${business.business_name}" has been upgraded to the ${listingTier} plan.\n\nBest regards,\nLBA Directory Team`
              : `Hello,\n\nThank you for your payment! Your ${listingTier} business listing "${business.business_name}" has been received and is pending admin approval.\n\nYou will receive another email once your listing is approved and live on the site.\n\nBest regards,\nLBA Directory Team`;
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: toEmail,
              subject: mode === 'upgrade'
                ? 'Payment Received - Listing Upgraded'
                : 'Payment Received - Business Listing Pending Approval',
              body: emailBody
            });
          } else {
            console.warn('No email available for confirmation on session', session.id);
          }
        } catch (emailError) {
          console.error('Confirmation email failed (non-fatal):', emailError);
        }

        console.log('Business marked paid:', businessId);
        break;
      }

      case 'checkout.session.expired': {
        // Buyer abandoned checkout (Stripe fires this ~24h later). Delete the
        // pre-created pending business so orphans don't accumulate and squat
        // the canonical slug. Upgrades created nothing, so nothing to clean.
        const session = event.data.object;
        const businessId = session.metadata?.business_id;
        const mode = session.metadata?.mode || 'new';
        if (!businessId || mode === 'upgrade') break;

        const existing = await base44.asServiceRole.entities.Business.filter({ id: businessId });
        const business = existing[0];
        if (business && business.payment_status === 'unpaid' && business.status === 'pending') {
          const orphanDeals = await base44.asServiceRole.entities.Deal.filter({ business_id: businessId });
          await Promise.all(orphanDeals.map(d => base44.asServiceRole.entities.Deal.delete(d.id)));
          await base44.asServiceRole.entities.Business.delete(businessId);
          console.log('Deleted abandoned-checkout business:', businessId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Find business by subscription ID
        const businesses = await base44.asServiceRole.entities.Business.filter({
          stripe_subscription_id: subscription.id
        });

        if (businesses.length > 0) {
          const business = businesses[0];
          
          // Downgrade to free tier
          await base44.asServiceRole.entities.Business.update(business.id, {
            listing_tier: 'free',
            listing_rank: 1,
            payment_status: 'unpaid',
            stripe_subscription_id: null
          });

          console.log('Business downgraded to free:', business.id);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Find business by subscription ID
        const businesses = await base44.asServiceRole.entities.Business.filter({
          stripe_subscription_id: subscription.id
        });

        if (businesses.length > 0) {
          const business = businesses[0];
          
          // Update payment status based on subscription status
          if (subscription.status === 'active') {
            await base44.asServiceRole.entities.Business.update(business.id, {
              payment_status: 'paid'
            });
          } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
            await base44.asServiceRole.entities.Business.update(business.id, {
              payment_status: 'failed'
            });
          }

          console.log('Business payment status updated:', business.id);
        }
        break;
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});