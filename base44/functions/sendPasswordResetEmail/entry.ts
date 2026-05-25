import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const appUrl = "https://lbadirectory.com";

    // Check Customer entity first (use filter instead of list)
    const customers = await base44.asServiceRole.entities.Customer.filter({ email });
    const customer = customers[0];

    if (customer) {
      const resetUrl = `${appUrl}/SetPassword?email=${encodeURIComponent(email)}&t=${Date.now()}`;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "Reset Your LBA Directory Password",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Reset Your Password</h2>
            <p>Hello ${customer.full_name}!</p>
            <p>We received a request to reset your password for your LBA Directory account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #0891b2; color: white; padding: 15px 35px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 12px; color: #6b7280;">Or copy this link: ${resetUrl}</p>
            <p style="color: #dc2626; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br><strong>LBA Directory Team</strong></p>
          </div>
        `
      });
      return Response.json({ success: true, type: 'customer' });
    }

    // Check Business entity
    const businesses = await base44.asServiceRole.entities.Business.filter({ email });
    const business = businesses[0];

    if (business) {
      const resetUrl = `${appUrl}/SetPassword?email=${encodeURIComponent(email)}&t=${Date.now()}`;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "Reset Your LBA Directory Password",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Reset Your Password</h2>
            <p>Hello ${business.business_name}!</p>
            <p>We received a request to reset your password for your LBA Directory business account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #0891b2; color: white; padding: 15px 35px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 12px; color: #6b7280;">Or copy this link: ${resetUrl}</p>
            <p style="color: #dc2626; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br><strong>LBA Directory Team</strong></p>
          </div>
        `
      });
      return Response.json({ success: true, type: 'business' });
    }

    return Response.json({ success: false, error: 'Email not found' }, { status: 404 });

  } catch (error) {
    console.error("Error sending password reset email:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});