import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// UI plan ids that bill as another tier ("LBA Sponsor" bills as pro)
const TIER_ALIASES = { 'lba-sponsor': 'pro' };

const priceIds = {
  pro: 'price_1SoncPI5Qw91YGJt6LsXpbm7',
  premium: 'price_1SoncPI5Qw91YGJtsV9xwc2U'
};

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
    const { listing_tier, business_data, customerId, customerEmail, deals } = await req.json();

    if (!listing_tier || !business_data) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tier = TIER_ALIASES[listing_tier] || listing_tier;
    if (!priceIds[tier]) {
      return Response.json({ error: 'Invalid listing tier' }, { status: 400 });
    }

    if (!customerId && !customerEmail) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const origin = req.headers.get('origin') || 'https://lbadirectory.com';
    const baseMetadata = {
      base44_app_id: Deno.env.get("BASE44_APP_ID"),
      user_id: customerId || '',
      listing_tier: tier
    };

    // ── Upgrade mode: an EXISTING business changes plan. Do not create anything;
    // the webhook updates the existing record on payment. ──
    if (business_data.business_id) {
      const existing = await base44.asServiceRole.entities.Business.filter({ id: business_data.business_id });
      const business = existing[0];
      if (!business) {
        return Response.json({ error: 'Business not found' }, { status: 404 });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceIds[tier], quantity: 1 }],
        customer_email: customerEmail || undefined,
        metadata: { ...baseMetadata, business_id: business.id, mode: 'upgrade' },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/BusinessDashboard?edit=${business.id}`
      });

      return Response.json({ sessionId: session.id, url: session.url });
    }

    // ── New-listing mode: create the record up-front as pending/unpaid, then
    // store ONLY its id in Stripe metadata (Stripe caps metadata values at 500
    // chars, so the full business_data JSON cannot ride along). ──
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
      email: business_data.email ? String(business_data.email).toLowerCase().trim() : business_data.email,
      slug,
      // Preserve an owner_id the caller set explicitly (admins submit on behalf
      // of businesses with owner_id: null); otherwise bind to the customer.
      owner_id: business_data.owner_id !== undefined ? business_data.owner_id : (customerId || ''),
      listing_tier: tier,
      // Real rank is granted by the webhook only AFTER payment, so an
      // abandoned checkout can't be approved into free premium placement.
      listing_rank: 1,
      payment_status: 'unpaid',
      status: 'pending'
    });

    // Deals typed in the wizard ride along with the paid submission; they only
    // surface publicly once the listing is approved.
    let dealIds = [];
    if (Array.isArray(deals) && deals.length > 0) {
      const createdDeals = await Promise.all(deals.map(d =>
        base44.asServiceRole.entities.Deal.create({ ...d, business_id: business.id, is_active: true })
      ));
      dealIds = createdDeals.map(d => d.id);
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceIds[tier], quantity: 1 }],
        customer_email: customerEmail || undefined,
        metadata: { ...baseMetadata, business_id: business.id, mode: 'new' },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/AddBusiness?payment=cancelled`
      });
    } catch (stripeError) {
      // Roll back so a failed session-create doesn't leave an orphan squatting the slug
      try {
        await Promise.all(dealIds.map(id => base44.asServiceRole.entities.Deal.delete(id)));
        await base44.asServiceRole.entities.Business.delete(business.id);
      } catch (rollbackError) {
        console.error('Rollback after Stripe failure also failed:', rollbackError);
      }
      throw stripeError;
    }

    return Response.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
