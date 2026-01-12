import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listing_tier, business_data } = await req.json();

    if (!listing_tier || !business_data) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Define pricing
    const prices = {
      pro: { amount: 5000, name: "Pro Listing" }, // $50/month
      premium: { amount: 10000, name: "Premium Listing" } // $100/month
    };

    if (!prices[listing_tier]) {
      return Response.json({ error: 'Invalid listing tier' }, { status: 400 });
    }

    const price = prices[listing_tier];

    // Store business data temporarily in session metadata
    const sessionMetadata = {
      user_id: user.id,
      listing_tier: listing_tier,
      business_data: JSON.stringify(business_data)
    };

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: price.name,
              description: `Monthly ${listing_tier} business listing on LBA Directory`
            },
            recurring: {
              interval: 'month'
            },
            unit_amount: price.amount
          },
          quantity: 1
        }
      ],
      customer_email: user.email,
      metadata: sessionMetadata,
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/add-business?payment=cancelled`
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});