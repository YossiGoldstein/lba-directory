import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ADMIN_EMAIL = 'office@lbadirectory.com';

const escapeHtml = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { fullName, email, phone, subject, message } = await req.json();

    if (!fullName || !email || !subject || !message) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Send email notification via the service-role SDK (do not forward the public caller's Authorization)
    const emailBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">New Contact Message</h2>
          <div style="background: #f0f9ff; border: 1px solid #0891b2; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Submitted via the LBA Directory contact form.</p>
        </div>`;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `New Contact Message: ${subject}`,
        body: emailBody,
        from_name: "LBA Directory"
      });
    } catch (emailError) {
      console.error('Failed to send contact message notification email:', emailError);
      return Response.json({ success: false, error: emailError.message }, { status: 500 });
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error submitting contact message:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
