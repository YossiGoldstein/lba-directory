import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { listing_tier, business_data, customerId, customerEmail } = await req.json();

    if (!listing_tier || !business_data) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!customerId && !customerEmail) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Define pricing with Stripe price IDs
    const priceIds = {
      pro: 'price_1SoncPI5Qw91YGJt6LsXpbm7',
      premium: 'price_1SoncPI5Qw91YGJtsV9xwc2U'
    };

    if (!priceIds[listing_tier]) {
      return Response.json({ error: 'Invalid listing tier' }, { status: 400 });
    }

    // Store business data temporarily in session metadata
    const sessionMetadata = {
      base44_app_id: Deno.env.get("BASE44_APP_ID"),
      user_id: customerId || '',
      listing_tier: listing_tier,
      business_data: JSON.stringify(business_data)
    };

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceIds[listing_tier],
          quantity: 1
        }
      ],
      customer_email: customerEmail || undefined,
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
