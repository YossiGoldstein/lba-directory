import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ADMIN_EMAIL = 'office@lbadirectory.com';

const escapeHtml = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { full_name, business_name, phone, email, services } = await req.json();

    if (!full_name || !business_name || !phone || !email || !services?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const servicesList = services.join(', ');

    // Save to database
    const inquiry = await base44.asServiceRole.entities.ServiceInquiry.create({
      full_name,
      business_name,
      phone,
      email,
      services,
      status: 'new'
    });

    // Send email notification via the service-role SDK (do not forward the public caller's Authorization)
    const emailBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">New Service Inquiry</h2>
          <div style="background: #f0f9ff; border: 1px solid #0891b2; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapeHtml(full_name)}</p>
            <p><strong>Business:</strong> ${escapeHtml(business_name)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Services Requested:</strong> ${escapeHtml(servicesList)}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Submitted via the LBA Directory service inquiry form.</p>
        </div>`;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `New Service Inquiry from ${business_name}`,
        body: emailBody,
        from_name: "LBA Directory"
      });
    } catch (emailError) {
      console.error('Failed to send service inquiry notification email:', emailError);
      // Don't fail the request — the inquiry record was already created
    }

    return Response.json({ success: true, inquiry_id: inquiry.id });

  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});