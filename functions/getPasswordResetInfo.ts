import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Check if this is a business owner
    const businesses = await base44.asServiceRole.entities.Business.list();
    const business = businesses.find(b => b.email === email);

    if (business) {
      return Response.json({
        success: true,
        type: 'business',
        data: {
          id: business.id,
          name: business.business_name,
          email: business.email,
          hasPassword: !!business.password_hash
        }
      });
    }

    // Check if this is a regular customer
    const customers = await base44.asServiceRole.entities.Customer.list();
    const customer = customers.find(c => c.email === email);

    if (customer) {
      return Response.json({
        success: true,
        type: 'customer',
        data: {
          id: customer.id,
          name: customer.full_name,
          email: customer.email,
          hasPassword: !!customer.password_hash
        }
      });
    }

    // Email not found
    return Response.json({
      success: false,
      error: 'Email not found'
    }, { status: 404 });

  } catch (error) {
    console.error("Error getting password reset info:", error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});