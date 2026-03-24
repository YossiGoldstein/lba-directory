import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { fullName, email, phone, password } = await req.json();

    if (!fullName || !email || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await base44.asServiceRole.entities.Customer.filter({ email });
    if (existing && existing.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Create customer
    const passwordHash = btoa(password);
    const customer = await base44.asServiceRole.entities.Customer.create({
      full_name: fullName,
      email,
      phone: phone || '',
      password_hash: passwordHash,
      is_active: true
    });

    // Send welcome email (non-blocking)
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'Welcome to LBA Directory!',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Welcome to LBA Directory, ${fullName}!</h2>
            <p>Your account has been created successfully.</p>
            <p>You can now sign in and start exploring local businesses in your community.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://${Deno.env.get('BASE44_APP_ID')}.base44.app/#/SignIn"
                 style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Sign In Now
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">LBA Directory Team</p>
          </div>
        `
      });
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    return Response.json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});