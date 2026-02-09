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
      // Business owner password reset
      const appUrl = Deno.env.get("BASE44_APP_URL") || "https://lbadirectory.com";
      const resetUrl = `${appUrl}/SetPassword?email=${encodeURIComponent(email)}&t=${Date.now()}`;
      
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "Reset Your LBA Directory Password",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Reset Your Password 🔐</h2>
            
            <p>Hello ${business.business_name}!</p>
            
            <p>We received a request to reset your password for your LBA Directory business account.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0891b2;">📋 Your Account:</h3>
              <p><strong>Business:</strong> ${business.business_name}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e;">🔑 Reset Your Password</h3>
              <p>Click the button below to set a new password for your account:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #0891b2; color: white; padding: 15px 35px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
                Or copy this link: ${resetUrl}
              </p>
            </div>
            
            <p style="color: #dc2626; font-size: 14px;">
              ⚠️ If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>LBA Directory Team</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="text-align: center; font-size: 12px; color: #6b7280;">
              <p>📞 <strong>Contact:</strong> office@lbadirectory.com | 732-600-1260</p>
              <p style="margin-bottom: 0;">LBA Directory - Lakewood's Business Directory</p>
            </div>
          </div>
        `
      });

      return Response.json({
        success: true,
        message: 'Password reset email sent',
        type: 'business'
      });
    }

    // Check if this is a regular customer
    const customers = await base44.asServiceRole.entities.Customer.list();
    const customer = customers.find(c => c.email === email);

    if (customer) {
      // Customer password reset
      const appUrl = Deno.env.get("BASE44_APP_URL") || "https://lbadirectory.com";
      const resetUrl = `${appUrl}/SetPassword?email=${encodeURIComponent(email)}&t=${Date.now()}`;
      
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "Reset Your LBA Directory Password",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Reset Your Password 🔐</h2>
            
            <p>Hello ${customer.full_name}!</p>
            
            <p>We received a request to reset your password for your LBA Directory account.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0891b2;">📋 Your Account:</h3>
              <p><strong>Name:</strong> ${customer.full_name}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e;">🔑 Reset Your Password</h3>
              <p>Click the button below to set a new password for your account:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #0891b2; color: white; padding: 15px 35px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
                Or copy this link: ${resetUrl}
              </p>
            </div>
            
            <p style="color: #dc2626; font-size: 14px;">
              ⚠️ If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>LBA Directory Team</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="text-align: center; font-size: 12px; color: #6b7280;">
              <p>📞 <strong>Contact:</strong> office@lbadirectory.com | 732-600-1260</p>
              <p style="margin-bottom: 0;">LBA Directory - Lakewood's Business Directory</p>
            </div>
          </div>
        `
      });

      return Response.json({
        success: true,
        message: 'Password reset email sent',
        type: 'customer'
      });
    }

    // Email not found
    return Response.json({
      success: false,
      error: 'Email not found'
    }, { status: 404 });

  } catch (error) {
    console.error("Error sending password reset email:", error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});