import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { full_name, business_name, phone, email, services } = await req.json();

    if (!full_name || !business_name || !phone || !email || !services?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save to database using service role (no auth required)
    const inquiry = await base44.asServiceRole.entities.ServiceInquiry.create({
      full_name,
      business_name,
      phone,
      email,
      services,
      status: 'new'
    });

    const servicesList = services.join(', ');

    // Send email to admin using fetch directly via Resend-compatible endpoint
    // We'll build a simple email body and log it, then notify via a stored record
    // Notify admin by sending email to admin user via service role
    try {
      const adminUsers = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      if (adminUsers && adminUsers.length > 0) {
        for (const adminUser of adminUsers) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: adminUser.email,
            subject: `New Service Inquiry from ${business_name}`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">New Service Inquiry</h2>
                <div style="background: #f0f9ff; border: 1px solid #0891b2; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p><strong>Name:</strong> ${full_name}</p>
                  <p><strong>Business:</strong> ${business_name}</p>
                  <p><strong>Phone:</strong> ${phone}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Services Requested:</strong> ${servicesList}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Submitted via the LBA Directory service inquiry form.</p>
              </div>
            `
          });
        }
      }
    } catch (emailErr) {
      // Log email error but don't fail the whole request
      console.error('Failed to send admin email:', emailErr.message);
    }

    return Response.json({ success: true, inquiry_id: inquiry.id });

  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});