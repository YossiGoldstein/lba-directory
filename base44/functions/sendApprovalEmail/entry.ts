import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get admin user to verify
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { business_id } = await req.json();

    if (!business_id) {
      return Response.json({ error: 'Missing business_id' }, { status: 400 });
    }

    // Get business and owner details
    const businesses = await base44.entities.Business.list();
    const business = businesses.find(b => b.id === business_id);

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    // Use business email address
    const ownerEmail = business.email || business.created_by;
    
    if (!ownerEmail) {
      return Response.json({ error: 'No email address found for business' }, { status: 404 });
    }

    const appId = Deno.env.get("BASE44_APP_ID");
    const baseUrl = `https://${appId}.base44.app`;
    const dashboardUrl = `${baseUrl}/#/business-dashboard`;
    const businessUrl = `${baseUrl}/#/business-listing?id=${business.id}`;
    const inquiryUrl = `${baseUrl}/#/ServiceInquiry?business=${encodeURIComponent(business.business_name)}&phone=${encodeURIComponent(business.phone || '')}&email=${encodeURIComponent(ownerEmail)}`;

    // Send approval email to business email
    await base44.integrations.Core.SendEmail({
      to: ownerEmail,
      subject: "Your Business Has Been Approved! - LBA Directory",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Your Business Has Been Approved</h2>
          
          <p>Your business <strong>"${business.business_name}"</strong> has been approved and is now live on LBA Directory.</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
            <h3 style="margin-top: 0; color: #047857;">Your Business Details:</h3>
            <p><strong>Business Name:</strong> ${business.business_name}</p>
            <p><strong>Phone:</strong> ${business.phone}</p>
            <p><strong>Address:</strong> ${business.address_line1}, ${business.city}</p>
            <p><strong>View Your Page:</strong> <a href="${businessUrl}" target="_blank" style="color: #0891b2; text-decoration: none;">Click here to see your listing</a></p>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Customers can now find you in the directory</li>
            <li>You can manage your business through the dashboard</li>
            <li>You can create deals and promotions</li>
            <li>Customers can leave reviews and ratings</li>
          </ul>
          
          <div style="background: #ede9fe; border: 2px solid #a78bfa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #5b21b6;">Manage Your Business</h3>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${dashboardUrl}" 
                 style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; 
                         text-decoration: none; border-radius: 8px; font-weight: bold;">
                Go to My Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Want More Visibility?</h3>
            <p>We offer additional services to help your business grow:</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Logo Design - Professional design for your business</li>
              <li>Landing Page - A dedicated page for your business</li>
              <li>Full Website - Your own website with online ordering</li>
              <li>CRM System - Manage your customers efficiently</li>
              <li>Promotional Video - Professional video for your business</li>
              <li>WhatsApp AI Chat - Automated customer support on WhatsApp</li>
            </ul>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${inquiryUrl}" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; 
                         text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                I'm Interested - Tell Me More
              </a>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; text-align: center; color: #6b7280;">
              <strong>Contact Us:</strong><br>
              Email: office@lbadirectory.com<br>
              Phone: 732-600-1260<br>
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Thank you for choosing LBA Directory! We're happy to help your business grow.
          </p>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>LBA Directory Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="text-align: center; font-size: 12px; color: #6b7280;">
            LBA Directory - Lakewood's Business Directory
          </p>
        </div>
      `
    });

    return Response.json({ 
      success: true, 
      message: "Approval email sent successfully" 
    });

  } catch (error) {
    console.error("Error sending approval email:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});