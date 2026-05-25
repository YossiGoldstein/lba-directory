import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Token TTL: 48 hours in milliseconds
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function generateToken(businessId, email) {
  const payload = `${businessId}:${email}:${Date.now() + TOKEN_TTL_MS}`;
  return btoa(payload).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function mimeToBase64Url(mimeStr) {
  const bytes = new TextEncoder().encode(mimeStr);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { businessId } = await req.json();

    if (!businessId) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: businessId });
    const business = businesses[0];

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

    // Build email body HTML
    const htmlBody = `<!DOCTYPE html>
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
          <tr>
            <td style="background:linear-gradient(135deg,#003D5C 0%,#0E8DAA 100%);padding:32px 40px;text-align:center;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png"
                   alt="LBA Directory" height="48" style="display:block;margin:0 auto;filter:brightness(0) invert(1);" />
              <p style="color:rgba(255,255,255,0.8);margin:12px 0 0;font-size:14px;letter-spacing:0.5px;">Lakewood Business Alliance</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="color:#111827;font-size:24px;margin:0 0 8px;font-weight:700;">Your listing is live!</h1>
              <p style="color:#6b7280;font-size:15px;margin:0 0 24px;line-height:1.6;">
                Congratulations! <strong style="color:#111827;">${business.business_name}</strong> has been approved and is now listed on LBA Directory.
              </p>
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
              <p style="color:#6b7280;font-size:13px;margin:0 0 28px;">This link is valid for <strong>48 hours</strong>.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${claimUrl}" style="display:inline-block;background:linear-gradient(135deg,#27C666,#1FAF5A);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;letter-spacing:0.3px;">
                      Claim My Business &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#166534;">Once you're in, you can:</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;">Update business information &amp; photos</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;">Create deals and promotions</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;">View analytics &amp; customer insights</p>
                    <p style="margin:0;font-size:14px;color:#374151;">Respond to reviews</p>
                  </td>
                </tr>
              </table>
              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                Can't click the button? Copy and paste this link into your browser:<br>
                <span style="color:#0E8DAA;word-break:break-all;">${claimUrl}</span>
              </p>
            </td>
          </tr>
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
</html>`;

    // Send via Gmail connector (supports external email addresses)
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const subject = `Claim Your Business Listing - ${business.business_name}`;

    const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const boundary = `boundary_${Date.now()}`;

    const plainText = `Hi,\n\nYour business "${business.business_name}" has been approved and is now listed on LBA Directory.\n\nClick the link below to set your password and claim your listing:\n${claimUrl}\n\nThis link is valid for 48 hours.\n\nQuestions? Contact us at office@lbadirectory.com or call 732-600-1260\n\nLBA Directory Team`;

    const mimeMessage = [
      `To: ${business.email}`,
      `Subject: ${encodedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      plainText,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      htmlBody,
      ``,
      `--${boundary}--`,
    ].join('\r\n');

    const encodedMessage = mimeToBase64Url(mimeMessage);

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!gmailRes.ok) {
      const errText = await gmailRes.text();
      throw new Error(`Gmail API error: ${gmailRes.status} ${errText}`);
    }

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