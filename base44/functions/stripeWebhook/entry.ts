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
        
        // Extract metadata
        const userId = session.metadata.user_id;
        const listingTier = session.metadata.listing_tier;
        const businessData = JSON.parse(session.metadata.business_data);

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const customerId = session.customer;

        // Create business record
        const business = await base44.asServiceRole.entities.Business.create({
          ...businessData,
          owner_id: userId,
          listing_tier: listingTier,
          listing_rank: listingTier === 'premium' ? 10 : listingTier === 'pro' ? 5 : 1,
          payment_status: 'paid',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: 'pending'
        });

        // Send confirmation email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: session.customer_email,
          subject: 'Payment Received - Business Listing Pending Approval',
          body: `Hello,\n\nThank you for your payment! Your ${listingTier} business listing "${businessData.business_name}" has been received and is pending admin approval.\n\nYou will receive another email once your listing is approved and live on the site.\n\nBest regards,\nLBA Directory Team`
        });

        console.log('Business created:', business.id);
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