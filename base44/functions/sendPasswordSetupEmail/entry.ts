import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Token TTL: 48 hours in milliseconds
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function generateToken(businessId, email) {
  const payload = `${businessId}:${email}:${Date.now() + TOKEN_TTL_MS}`;
  return btoa(payload).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { businessId } = await req.json();

    if (!businessId) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const businesses = await base44.asServiceRole.entities.Business.list();
    const business = businesses.find(b => b.id === businessId);

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    if (!business.email) {
      return Response.json({ error: 'Business has no email address' }, { status: 400 });
    }

    const token = generateToken(businessId, business.email);
    const appUrl = "https://lbadirectory.com";
    const claimUrl = `${appUrl}/SetPassword?token=${token}&bid=${businessId}`;

    console.log(`📧 Sending claim email to ${business.email} for business: ${business.business_name}`);
    console.log(`🔗 Claim URL: ${claimUrl}`);

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'LBA Directory',
      to: business.email,
      subject: `Claim Your Business Listing – ${business.business_name}`,
      body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claim Your Business</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#003D5C 0%,#0E8DAA 100%);padding:32px 40px;text-align:center;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png"
                   alt="LBA Directory" height="48" style="display:block;margin:0 auto;filter:brightness(0) invert(1);" />
              <p style="color:rgba(255,255,255,0.8);margin:12px 0 0;font-size:14px;letter-spacing:0.5px;">Lakewood Business Alliance</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              
              <h1 style="color:#111827;font-size:24px;margin:0 0 8px;font-weight:700;">
                Your listing is live! 🎉
              </h1>
              <p style="color:#6b7280;font-size:15px;margin:0 0 24px;line-height:1.6;">
                Congratulations! <strong style="color:#111827;">${business.business_name}</strong> has been approved and is now listed on LBA Directory.
              </p>

              <!-- Business Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-left:4px solid #0E8DAA;border-radius:0 8px 8px 0;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#374151;font-size:14px;"><strong>Business:</strong> ${business.business_name}</p>
                    <p style="margin:0 0 6px;color:#374151;font-size:14px;"><strong>Email:</strong> ${business.email}</p>
                    ${business.phone ? `<p style="margin:0;color:#374151;font-size:14px;"><strong>Phone:</strong> ${business.phone}</p>` : ''}
                  </td>
                </tr>
              </table>

              <p style="color:#374151;font-size:15px;margin:0 0 8px;line-height:1.6;">
                To access and manage your listing, click the button below to set your password and claim your account:
              </p>
              <p style="color:#6b7280;font-size:13px;margin:0 0 28px;">
                This link is valid for <strong>48 hours</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${claimUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#27C666,#1FAF5A);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;letter-spacing:0.3px;">
                      Claim My Business &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What you can do -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#166534;">Once you're in, you can:</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;">✅ Update business information &amp; photos</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;">✅ Create deals and promotions</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;">✅ View analytics &amp; customer insights</p>
                    <p style="margin:0;font-size:14px;color:#374151;">✅ Respond to reviews</p>
                  </td>
                </tr>
              </table>

              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                Can't click the button? Copy and paste this link into your browser:<br>
                <span style="color:#0E8DAA;word-break:break-all;">${claimUrl}</span>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Questions? Contact us at <a href="mailto:office@lbadirectory.com" style="color:#0E8DAA;">office@lbadirectory.com</a> or call <a href="tel:7326001260" style="color:#0E8DAA;">732-600-1260</a></p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} LBA Directory. Serving Lakewood &amp; surrounding communities.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    });

    console.log(`✅ Claim email sent successfully to ${business.email}`);

    return Response.json({
      success: true,
      message: `Claim email sent to ${business.email}`,
      business: business.business_name
    });
  } catch (error) {
    console.error("❌ Error sending claim email:", error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});