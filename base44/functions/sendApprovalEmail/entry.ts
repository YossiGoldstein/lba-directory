import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = 'https://www.lbadirectory.com';

function encodeBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendGmail(accessToken, { to, subject, htmlBody, plainText }) {
  const boundary = `b${Date.now()}`;

  // Encode each part in base64 separately
  const plainB64 = encodeBase64Url(plainText);
  const htmlB64 = encodeBase64Url(htmlBody);

  // Build MIME - note: each encoded part on its own line, no wrapping
  const mimeParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    plainB64,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    htmlB64,
    '',
    `--${boundary}--`,
  ];

  const mimeString = mimeParts.join('\r\n');
  const rawEncoded = encodeBase64Url(mimeString);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawEncoded }),
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

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const businessUrl = `${BASE_URL}/BusinessListing?id=${business.id}`;
    const dashboardUrl = `${BASE_URL}/BusinessDashboard`;
    const inquiryUrl = `${BASE_URL}/ServiceInquiry`;
    const address = [business.address_line1, business.city, business.state].filter(Boolean).join(', ') || '';

    const plainText = [
      `Your Business "${business.business_name}" is Now Live on LBA Directory!`,
      '',
      `Business: ${business.business_name}`,
      business.phone ? `Phone: ${business.phone}` : '',
      address ? `Address: ${address}` : '',
      'Status: Approved',
      '',
      `View Your Live Listing: ${businessUrl}`,
      `Go to My Dashboard: ${dashboardUrl}`,
      '',
      "What's Next?",
      '- Customers can now find and contact you directly',
      '- Log in to your dashboard to manage your listing, add photos, and post deals',
      '- Collect reviews to build your reputation',
      '- Share your listing on social media to reach more customers',
      '',
      'Want to Grow Even Faster?',
      `Contact Us to Learn More: ${inquiryUrl}`,
      '',
      'Have questions? We are here to help:',
      'Email: office@lbadirectory.com',
      'Phone: 732-600-1260',
      'WhatsApp: https://wa.me/17326001260',
      '',
      'Best regards,',
      'The LBA Directory Team',
      `${BASE_URL}`,
    ].filter(l => l !== null).join('\n');

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Your Business is Approved</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="background:#0e4f6e;padding:36px 40px;text-align:center;">
<img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png" alt="LBA Directory" style="height:44px;display:block;margin:0 auto 16px;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Your Business is Now Live!</h1>
<p style="margin:8px 0 0;color:#bae6fd;font-size:15px;">Congratulations - you are now part of the LBA Directory</p>
</td></tr>
<tr><td style="padding:36px 40px 0;">
<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Dear Business Owner,</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">We are pleased to inform you that your business listing for <strong style="color:#0e4f6e;">${business.business_name}</strong> has been reviewed and <strong>approved</strong>. Your listing is now live and visible to thousands of local customers.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:24px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 10px;color:#0e4f6e;font-size:13px;font-weight:700;text-transform:uppercase;">Listing Details</p>
<table role="presentation" width="100%" cellpadding="4">
<tr><td style="color:#6b7280;font-size:14px;width:100px;">Business:</td><td style="color:#111827;font-size:14px;font-weight:600;">${business.business_name}</td></tr>
${business.phone ? `<tr><td style="color:#6b7280;font-size:14px;">Phone:</td><td style="color:#111827;font-size:14px;">${business.phone}</td></tr>` : ''}
${address ? `<tr><td style="color:#6b7280;font-size:14px;">Address:</td><td style="color:#111827;font-size:14px;">${address}</td></tr>` : ''}
<tr><td style="color:#6b7280;font-size:14px;">Status:</td><td><span style="background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:20px;font-weight:600;font-size:13px;">Approved</span></td></tr>
</table>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr><td align="center" style="padding-bottom:12px;">
<a href="${businessUrl}" style="display:inline-block;background:#0e4f6e;color:#ffffff;padding:13px 30px;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">View Your Live Listing</a>
</td></tr>
<tr><td align="center">
<a href="${dashboardUrl}" style="display:inline-block;border:2px solid #0e4f6e;color:#0e4f6e;padding:11px 30px;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">Go to My Dashboard</a>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-left:4px solid #0891b2;margin-bottom:24px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 8px;color:#0c4a6e;font-size:14px;font-weight:700;">What's Next?</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">- Customers can now find and contact you directly</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">- Log in to your dashboard to manage your listing, add photos, and post deals</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">- Collect reviews to build your reputation</p>
<p style="margin:0;color:#374151;font-size:14px;">- Share your listing on social media to reach more customers</p>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;margin-bottom:24px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 8px;color:#78350f;font-size:15px;font-weight:700;">Want to Grow Even Faster?</p>
<p style="margin:0 0 14px;color:#92400e;font-size:14px;">We offer professional services - Logo Design, Website Development, CRM Systems, Promotional Videos, WhatsApp AI Chat, and more.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
<a href="${inquiryUrl}" style="display:inline-block;background:#d97706;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">Contact Us to Learn More</a>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:0 40px 28px;">
<p style="margin:0 0 6px;color:#6b7280;font-size:14px;">Have questions? We are here to help:</p>
<p style="margin:0 0 4px;font-size:14px;color:#374151;">Email: <a href="mailto:office@lbadirectory.com" style="color:#0891b2;">office@lbadirectory.com</a></p>
<p style="margin:0 0 4px;font-size:14px;color:#374151;">Phone: <a href="tel:7326001260" style="color:#0891b2;">732-600-1260</a></p>
<p style="margin:0 0 4px;font-size:14px;color:#374151;">WhatsApp: <a href="https://wa.me/17326001260" style="color:#0891b2;">Message us on WhatsApp</a></p>
<p style="margin:20px 0 0;color:#374151;font-size:14px;">Best regards,<br><strong>The LBA Directory Team</strong></p>
</td></tr>
<tr><td style="background:#1e293b;padding:18px 40px;text-align:center;">
<p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">LBA Directory - Serving Lakewood, Toms River, Jackson, Brick, Howell and Manchester</p>
<p style="margin:0;font-size:12px;"><a href="${BASE_URL}" style="color:#64748b;text-decoration:none;">Visit Directory</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    await sendGmail(accessToken, {
      to: ownerEmail,
      subject: `Your Business "${business.business_name}" is Now Live on LBA Directory`,
      htmlBody,
      plainText,
    });

    return Response.json({ success: true, message: `Approval email sent to ${ownerEmail}` });

  } catch (error) {
    console.error('Error sending approval email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});