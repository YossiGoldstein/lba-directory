import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function decodeToken(token: string): { businessId: string; email: string; expiry: number } | null {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (base64.length % 4)) % 4;
    const payload = atob(base64 + '='.repeat(padding));
    const parts = payload.split(':');
    if (parts.length < 3) return null;
    const businessId = parts[0];
    const expiryStr = parts[parts.length - 1];
    const email = parts.slice(1, -1).join(':');
    const expiry = parseInt(expiryStr, 10);
    if (!businessId || !email || isNaN(expiry)) return null;
    return { businessId, email, expiry };
  } catch {
    return null;
  }
}

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

    const decoded = decodeToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid or expired claim link.' }, { status: 400 });
    }

    const { businessId, email, expiry } = decoded;

    if (Date.now() > expiry) {
      return Response.json({ error: 'This claim link has expired. Please request a new one.' }, { status: 400 });
    }

    if (email !== user.email) {
      return Response.json({ error: 'This claim link does not belong to your account.' }, { status: 403 });
    }

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: businessId });
    if (!businesses || businesses.length === 0) {
      return Response.json({ error: 'Business not found.' }, { status: 404 });
    }
    const business = businesses[0];

    if (business.owner_id) {
      return Response.json({ error: 'This business has already been claimed.' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Business.update(businessId, {
      owner_id: user.id
    });

    return Response.json({
      success: true,
      message: 'Business claimed successfully!',
      businessId,
      businessName: business.business_name
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
