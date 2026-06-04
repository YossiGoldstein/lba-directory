import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

function generateSlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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

    // Create the business record up-front as pending/unpaid, then store ONLY its
    // id in Stripe metadata. Stripe caps metadata values at 500 chars, so cramming
    // the full business_data JSON in there silently broke checkout for real listings.
    // The webhook later looks this record up by id and marks it paid.
    const baseSlug = generateSlug(business_data.business_name);
    let slug = baseSlug;
    let counter = 2;
    let slugExists = await base44.asServiceRole.entities.Business.filter({ slug });
    while (slugExists.length > 0) {
      slug = `${baseSlug}-${counter++}`;
      slugExists = await base44.asServiceRole.entities.Business.filter({ slug });
    }

    const business = await base44.asServiceRole.entities.Business.create({
      ...business_data,
      slug,
      owner_id: customerId || '',
      listing_tier,
      listing_rank: listing_tier === 'premium' ? 10 : listing_tier === 'pro' ? 5 : 1,
      payment_status: 'unpaid',
      status: 'pending'
    });

    // Store only small identifiers in metadata (well under the 500-char limit)
    const sessionMetadata = {
      base44_app_id: Deno.env.get("BASE44_APP_ID"),
      user_id: customerId || '',
      listing_tier: listing_tier,
      business_id: business.id
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
