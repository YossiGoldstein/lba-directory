import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { businessId } = await req.json();

    if (!businessId) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // Get the business
    const businesses = await base44.asServiceRole.entities.Business.list();
    const business = businesses.find(b => b.id === businessId);

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    if (!business.email) {
      return Response.json({ error: 'Business has no email address' }, { status: 400 });
    }

    // Get the app's published URL from environment or construct it
    const appUrl = Deno.env.get("BASE44_APP_URL") || "https://lbadirectory.com";
    const setPasswordUrl = `${appUrl}/#/SetPassword?email=${encodeURIComponent(business.email)}&t=${Date.now()}`;
    
    console.log("🔗 Password setup URL:", setPasswordUrl);
    
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: business.email,
      subject: "Complete Your LBA Directory Business Setup",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">Complete Your Business Setup 🚀</h2>
          
          <p>Hello ${business.business_name}!</p>
          
          <p>Your business has been <strong>approved</strong> and is now listed on LBA Directory! 🎉</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0891b2;">📋 Your Business:</h3>
            <p><strong>Business Name:</strong> ${business.business_name}</p>
            <p><strong>Email:</strong> ${business.email}</p>
            ${business.phone ? `<p><strong>Phone:</strong> ${business.phone}</p>` : ''}
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">🔐 Set Your Password</h3>
            <p>To manage your business listing, you need to set a password for your account.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${setPasswordUrl}" 
                 style="display: inline-block; background: #0891b2; color: white; padding: 15px 35px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Set My Password
              </a>
            </div>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
              Or copy this link: ${setPasswordUrl}
            </p>
          </div>
          
          <div style="background: #ecfccb; border: 2px solid #84cc16; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #365314;">✨ What You Can Do:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>✅ Update business information</li>
              <li>✅ Upload photos and manage gallery</li>
              <li>✅ Create deals and promotions</li>
              <li>✅ Respond to reviews</li>
              <li>✅ View analytics and insights</li>
              <li>✅ Use AI assistant to improve your listing</li>
            </ul>
          </div>
          
          <p>Once you set your password, you can sign in anytime using your email (${business.email}) and manage your business.</p>
          
          <p>If you have any questions, we're here to help!</p>
          
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
      message: `Password setup email sent to ${business.email}`,
      business: business.business_name
    });
  } catch (error) {
    console.error("Error sending password setup email:", error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});