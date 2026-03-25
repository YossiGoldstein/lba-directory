import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function sendGmail(base44, { to, subject, html }) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

  const boundary = 'boundary_' + Date.now();
  const htmlBase64 = btoa(unescape(encodeURIComponent(html)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const mime = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    htmlBase64,
    `--${boundary}--`
  ].join('\r\n');

  const encoded = btoa(unescape(encodeURIComponent(mime)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encoded })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail send error: ${err}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { business_id } = await req.json();

    if (!business_id) {
      return Response.json({ error: 'Missing business_id' }, { status: 400 });
    }

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: business_id });
    const business = businesses[0];

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const ownerEmail = business.email || business.created_by;
    if (!ownerEmail) {
      return Response.json({ error: 'No email address found for business' }, { status: 404 });
    }

    const appId = Deno.env.get("BASE44_APP_ID");
    const baseUrl = `https://${appId}.base44.app`;
    const dashboardUrl = `${baseUrl}/BusinessDashboard`;
    const businessUrl = `${baseUrl}/BusinessListing?id=${business.id}`;
    const adminUrl = `${baseUrl}/AdminDashboard`;
    const inquiryUrl = `${baseUrl}/ServiceInquiry?business=${encodeURIComponent(business.business_name)}&phone=${encodeURIComponent(business.phone || '')}&email=${encodeURIComponent(ownerEmail)}&name=${encodeURIComponent(business.business_name)}`;

    const phoneLink = business.phone ? `<a href="tel:${business.phone}" style="color:#0891b2;text-decoration:none;">${business.phone}</a>` : '—';
    const emailLink = ownerEmail ? `<a href="mailto:${ownerEmail}" style="color:#0891b2;text-decoration:none;">${ownerEmail}</a>` : '—';
    const websiteLink = business.website_url ? `<a href="${business.website_url}" style="color:#0891b2;text-decoration:none;">${business.website_url}</a>` : '—';
    const address = [business.address_line1, business.city, business.state].filter(Boolean).join(', ') || '—';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Business is Approved!</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0891b2 0%,#0e4f6e 100%);padding:40px 30px;text-align:center;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png" alt="LBA Directory" style="height:48px;margin-bottom:20px;filter:brightness(0) invert(1);" />
              <div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:36px;">🎉</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Your Business is Now Live!</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:16px;">Congratulations — you're now part of the LBA Directory</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 0;">
              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
                Great news! Your business <strong style="color:#0891b2;">"${business.business_name}"</strong> has been reviewed and approved. Your listing is now live and visible to thousands of local customers.
              </p>

              <!-- Business Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <h3 style="margin:0 0 16px;color:#15803d;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">📋 Your Business Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;width:130px;font-weight:600;">Business:</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:700;">${business.business_name}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;font-weight:600;">Phone:</td>
                        <td style="padding:6px 0;font-size:14px;">${phoneLink}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;font-weight:600;">Email:</td>
                        <td style="padding:6px 0;font-size:14px;">${emailLink}</td>
                      </tr>
                      ${business.website_url ? `
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;font-weight:600;">Website:</td>
                        <td style="padding:6px 0;font-size:14px;">${websiteLink}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;font-weight:600;">Address:</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;">${address}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center" style="padding:0 8px;">
                    <a href="${businessUrl}" style="display:inline-block;background:linear-gradient(135deg,#22c55e,#16a34a);color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;margin:6px;">
                      🌐 View Your Live Listing
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 8px;">
                    <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#0891b2,#0e7490);color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;margin:6px;">
                      📊 Go to My Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What's next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <h3 style="margin:0 0 14px;color:#1e40af;font-size:16px;font-weight:700;">✅ What's Next?</h3>
                    <ul style="margin:0;padding:0 0 0 20px;color:#374151;font-size:14px;line-height:2;">
                      <li>Customers can now find and contact you directly</li>
                      <li>Log in to manage your listing, add photos &amp; deals</li>
                      <li>Collect reviews and boost your reputation</li>
                      <li>Share your listing on social media</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Service Inquiry CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <h3 style="margin:0 0 10px;color:#92400e;font-size:17px;font-weight:700;">🚀 Want to Grow Even Faster?</h3>
                    <p style="margin:0 0 16px;color:#78350f;font-size:14px;line-height:1.6;">We offer professional services to help your business stand out:</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td width="50%" style="padding:4px 0;color:#92400e;font-size:13px;">✔ Logo Design</td>
                        <td width="50%" style="padding:4px 0;color:#92400e;font-size:13px;">✔ Full Website</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#92400e;font-size:13px;">✔ CRM System</td>
                        <td style="padding:4px 0;color:#92400e;font-size:13px;">✔ Promotional Video</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#92400e;font-size:13px;">✔ WhatsApp AI Chat</td>
                        <td style="padding:4px 0;color:#92400e;font-size:13px;">✔ AI Solutions</td>
                      </tr>
                    </table>
                    <div style="text-align:center;">
                      <a href="${inquiryUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
                        📋 Fill Out the Inquiry Form
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Contact & Footer -->
          <tr>
            <td style="padding:20px 36px 36px;">
              <p style="margin:0 0 6px;color:#6b7280;font-size:14px;">Questions? We're here to help:</p>
              <p style="margin:0 0 6px;font-size:14px;">
                📧 <a href="mailto:office@lbadirectory.com" style="color:#0891b2;text-decoration:none;">office@lbadirectory.com</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                📞 <a href="tel:7326001260" style="color:#0891b2;text-decoration:none;">732-600-1260</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                💬 <a href="https://wa.me/17326001260" style="color:#0891b2;text-decoration:none;">WhatsApp</a>
              </p>
              <p style="margin:16px 0 0;color:#374151;font-size:14px;">
                Best regards,<br/>
                <strong>The LBA Directory Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="background:#1f2937;padding:20px 36px;text-align:center;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">
                LBA Directory — Serving Lakewood, Toms River, Jackson, Brick, Howell &amp; Manchester
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="${adminUrl}" style="color:#6b7280;text-decoration:none;">Admin Panel</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="${baseUrl}" style="color:#6b7280;text-decoration:none;">Visit Directory</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendGmail(base44, {
      to: ownerEmail,
      subject: `"${business.business_name}" is Now Live on LBA Directory!`,
      html
    });

    return Response.json({ success: true, message: `Approval email sent to ${ownerEmail}` });

  } catch (error) {
    console.error("Error sending approval email:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});