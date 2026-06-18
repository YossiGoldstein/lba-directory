import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// SECURITY: claims are verified against a single-use token STORED on the business
// (set by sendClaimEmail). The old scheme decoded a reversible/forgeable base64
// `businessId:email:expiry` token and trusted a body-supplied email, which let
// anyone claim any unclaimed business. Now the token is random + server-stored.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { token, bid, userId, userEmail } = body;

    if (!token || !bid) {
      return Response.json({ error: 'Invalid claim link. Please use the link from your email.' }, { status: 400 });
    }
    if (!userEmail) {
      return Response.json({ error: 'User email is required. Please sign in first.' }, { status: 400 });
    }

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: bid });
    if (!businesses || businesses.length === 0) {
      return Response.json({ error: 'Business not found.' }, { status: 404 });
    }
    const business = businesses[0];

    // Verify the stored single-use token + expiry.
    const tokenOk =
      !!business.claim_token &&
      business.claim_token === token &&
      typeof business.claim_token_expiry === 'number' &&
      Date.now() < business.claim_token_expiry;
    if (!tokenOk) {
      return Response.json({ error: 'This claim link is invalid or has expired. Please request a new one.' }, { status: 403 });
    }

    // The signed-in user's email must match the address the link was sent to.
    if (business.claim_email && String(userEmail).toLowerCase().trim() !== business.claim_email) {
      return Response.json({ error: 'This claim link does not belong to your account.' }, { status: 403 });
    }

    // Allow claiming only if unowned or owned by the import placeholder.
    if (business.owner_id && business.owner_id !== 'lba_directory') {
      return Response.json({ error: 'This business has already been claimed.' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Business.update(bid, {
      owner_id: userId || userEmail,
      claim_token: null,        // single-use: consume it
      claim_token_expiry: null,
      claim_email: null,
    });

    return Response.json({
      success: true,
      message: 'Business claimed successfully!',
      businessId: bid,
      businessName: business.business_name,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
