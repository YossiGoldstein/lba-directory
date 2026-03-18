import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find claim request by token
    const claims = await base44.asServiceRole.entities.ClaimRequest.filter({ token });

    if (!claims || claims.length === 0) {
      return Response.json({ error: 'Invalid or expired claim link.' }, { status: 404 });
    }

    const claim = claims[0];

    // Check status
    if (claim.status !== 'pending') {
      return Response.json({ error: 'This claim link has already been used or expired.' }, { status: 400 });
    }

    // Check expiry
    if (new Date(claim.expires_at) < new Date()) {
      await base44.asServiceRole.entities.ClaimRequest.update(claim.id, { status: 'expired' });
      return Response.json({ error: 'This claim link has expired. Please request a new one.' }, { status: 400 });
    }

    // Verify the email matches the logged-in user
    if (claim.claimant_email !== user.email) {
      return Response.json({ error: 'This claim link does not belong to your account.' }, { status: 403 });
    }

    // Get business
    const businesses = await base44.asServiceRole.entities.Business.filter({ id: claim.business_id });
    if (!businesses || businesses.length === 0) {
      return Response.json({ error: 'Business not found.' }, { status: 404 });
    }
    const business = businesses[0];

    if (business.owner_id) {
      return Response.json({ error: 'This business has already been claimed.' }, { status: 400 });
    }

    // Claim the business — set owner_id to the user's ID
    await base44.asServiceRole.entities.Business.update(claim.business_id, {
      owner_id: user.id
    });

    // Mark claim as used
    await base44.asServiceRole.entities.ClaimRequest.update(claim.id, { status: 'used' });

    return Response.json({
      success: true,
      message: 'Business claimed successfully!',
      businessId: claim.business_id,
      businessName: business.business_name
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});