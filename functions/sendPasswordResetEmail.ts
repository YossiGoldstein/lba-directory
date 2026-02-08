import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user is a business owner
    const businesses = await base44.asServiceRole.entities.Business.list();
    const business = businesses.find(b => b.email === email);

    if (business) {
      // Send password reset email to business owner
      const resetUrl = `${new URL(req.url).origin}/SetPassword?email=${encodeURIComponent(business.email)}`;
      
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: business.email,
        subject: "Reset Your LBA Directory Password",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Password Reset Request 🔐</h2>
            
            <p>Hello ${business.business_name}!</p>
            
            <p>We received a request to reset the password for your business account on LBA Directory.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0891b2;">📋 Your Business:</h3>
              <p><strong>Business Name:</strong> ${business.business_name}</p>
              <p><strong>Email:</strong> ${business.email}</p>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e;">🔑 Reset Your Password</h3>
              <p>Click the button below to set a new password for your account:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #0891b2; color: white; padding: 15px 35px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset My Password
                </a>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
                Or copy this link: ${resetUrl}
              </p>
            </div>
            
            <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                ⚠️ If you didn't request this password reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
            <p>Best regards,<br><strong>LBA Directory Team</strong></p>
            
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
        userType: 'business'
      });
    }

    // Check if user is a regular customer
    const customers = await base44.asServiceRole.entities.Customer.list();
    const customer = customers.find(c => c.email === email);

    if (customer) {
      // Send password reset email to customer
      const resetUrl = `${new URL(req.url).origin}/SetPassword?email=${encodeURIComponent(customer.email)}`;
      
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customer.email,
        subject: "Reset Your LBA Directory Password",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Password Reset Request 🔐</h2>
            
            <p>Hello ${customer.full_name}!</p>
            
            <p>We received a request to reset the password for your account on LBA Directory.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0891b2;">👤 Your Account:</h3>
              <p><strong>Name:</strong> ${customer.full_name}</p>
              <p><strong>Email:</strong> ${customer.email}</p>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e;">🔑 Reset Your Password</h3>
              <p>Click the button below to set a new password for your account:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #0891b2; color: white; padding: 15px 35px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset My Password
                </a>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
                Or copy this link: ${resetUrl}
              </p>
            </div>
            
            <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                ⚠️ If you didn't request this password reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
            <p>Best regards,<br><strong>LBA Directory Team</strong></p>
            
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
        userType: 'customer'
      });
    }

    // User not found - but don't reveal this for security
    return Response.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });

  } catch (error) {
    console.error("Error sending password reset email:", error);
    return Response.json({ 
      success: false,
      error: 'Failed to send reset email' 
    }, { status: 500 });
  }
});