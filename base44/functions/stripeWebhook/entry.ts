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

        // Idempotency: Stripe redelivers events. If already marked paid, do nothing.
        if (business.payment_status === 'paid') {
          console.log('Business already marked paid, skipping duplicate event:', businessId);
          break;
        }

        const subscriptionId = session.subscription
          ? (await stripe.subscriptions.retrieve(session.subscription)).id
          : null;

        await base44.asServiceRole.entities.Business.update(businessId, {
          payment_status: 'paid',
          stripe_customer_id: session.customer || business.stripe_customer_id || null,
          stripe_subscription_id: subscriptionId,
          listing_rank: listingTier === 'premium' ? 10 : listingTier === 'pro' ? 5 : 1,
        });

        // Send confirmation email. customer_email is usually null on subscription
        // checkouts; the populated field is customer_details.email.
        const toEmail = session.customer_details?.email || session.customer_email;
        if (toEmail) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: toEmail,
            subject: 'Payment Received - Business Listing Pending Approval',
            body: `Hello,\n\nThank you for your payment! Your ${listingTier} business listing "${business.business_name}" has been received and is pending admin approval.\n\nYou will receive another email once your listing is approved and live on the site.\n\nBest regards,\nLBA Directory Team`
          });
        } else {
          console.warn('No email available for confirmation on session', session.id);
        }

        console.log('Business marked paid:', businessId);
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