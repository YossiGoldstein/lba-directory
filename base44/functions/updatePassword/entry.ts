import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const normalizedEmail = String(email).toLowerCase().trim();
    // UTF-8-safe hash, same encoding as registerCustomer
    const passwordHash = btoa(unescape(encodeURIComponent(password)));

    // Check if this is a business owner
    const businesses = await base44.asServiceRole.entities.Business.filter({ email: normalizedEmail });
    const business = businesses[0];

    if (business) {
      await base44.asServiceRole.entities.Business.update(business.id, {
        password_hash: passwordHash
      });

      return Response.json({
        success: true,
        message: 'Password updated successfully',
        type: 'business'
      });
    }

    // Check if this is a regular customer
    const customers = await base44.asServiceRole.entities.Customer.filter({ email: normalizedEmail });
    const customer = customers[0];

    if (customer) {
      await base44.asServiceRole.entities.Customer.update(customer.id, {
        password_hash: passwordHash
      });

      return Response.json({
        success: true,
        message: 'Password updated successfully',
        type: 'customer'
      });
    }

    // Email not found
    return Response.json({
      success: false,
      error: 'Email not found'
    }, { status: 404 });

  } catch (error) {
    console.error("Error updating password:", error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});