import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = 'https://www.lbadirectory.com';

// Encode the full MIME string to base64url for Gmail API
function mimeToBase64Url(mimeStr) {
  const bytes = new TextEncoder().encode(mimeStr);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendGmail(accessToken, { to, subject, htmlBody, plainText }) {
  const boundary = `boundary_${Date.now()}`;

  // Build MIME with 8bit transfer - NO per-part base64 encoding
  // Only the final MIME string gets base64url encoded for the API
  const mime = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  const raw = mimeToBase64Url(mime);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
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
    const body = await req.json();
    // Support both direct call and entity automation payload
    const business_id = body.business_id || body.event?.entity_id || body.data?.id;

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
    const inquiryUrl = `https://lbadirectory.com/ServiceInquiry`;
    const address = [business.address_line1, business.city, business.state].filter(Boolean).join(', ');

    const plainText = [
      `Your Business "${business.business_name}" is Now Live on LBA Directory!`,
      '',
      'Dear Business Owner,',
      `We are pleased to inform you that your business listing for "${business.business_name}" has been approved and is now live and visible to thousands of local customers.`,
      '',
      'Listing Details:',
      `Business: ${business.business_name}`,
      business.phone ? `Phone: ${business.phone}` : null,
      business.email ? `Email: ${business.email}` : null,
      'Status: Approved ✅',
      '',
      `View My Listing: ${businessUrl}`,
      `Go to My Dashboard: ${dashboardUrl}`,
      '',
      "What's Next?",
      '- Log in to your dashboard to manage your listing and keep it up to date, add photos, post deals, check your stats, and more.',
      '- Collect reviews to build your reputation.',
      '- Share your listing on social media to reach more customers.',
      '',
      'Want to promote your business even more? The LBA Directory offers many services:',
      '- Upgrade your listing package - get featured and ranked higher in search results, get free advertising, discounts on services, and more.',
      '- More leads - professional website, logo, and promotional video that convert.',
      '- Better automation - WhatsApp AI chat that handles inquiries 24/7, and automate many daily tasks, and more.',
      '- Stronger reputation - CRM tools to follow up and retain customers.',
      '',
      `Boost your business Now: ${inquiryUrl}`,
      '',
      'Have questions? We are here to help:',
      'Email: office@lbadirectory.com',
      'Phone: 732-600-1260',
      'WhatsApp: https://wa.me/17326001260',
      '',
      'Best regards,',
      'The LBA Directory Team',
    ].filter(l => l !== null).join('\n');

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
<tr><td style="background:#0e4f6e;padding:32px 40px;text-align:center;border-radius:8px 8px 0 0;">
<img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png" alt="LBA Directory" height="40" style="display:block;margin:0 auto 14px;">
<h1 style="margin:0;color:#ffffff;font-size:22px;">Your Business is Now Live!</h1>
<p style="margin:6px 0 0;color:#bae6fd;font-size:14px;">Congratulations! You are now part of the LBA Directory</p>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="margin:0 0 16px;color:#374151;font-size:15px;">Dear Business Owner,</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">We are pleased to inform you that your business listing for <strong style="color:#0e4f6e;">${business.business_name}</strong> has been <strong>approved</strong> and is now live and visible to thousands of local customers.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:24px;">
<tr><td style="padding:18px 22px;">
<p style="margin:0 0 10px;color:#0e4f6e;font-size:12px;font-weight:bold;text-transform:uppercase;">Listing Details</p>
<table cellpadding="5">
<tr><td style="color:#6b7280;font-size:14px;">Business:</td><td style="color:#111827;font-size:14px;font-weight:bold;">${business.business_name}</td></tr>
${business.phone ? `<tr><td style="color:#6b7280;font-size:14px;">Phone:</td><td style="color:#111827;font-size:14px;">${business.phone}</td></tr>` : ''}
${business.email ? `<tr><td style="color:#6b7280;font-size:14px;">Email:</td><td style="color:#111827;font-size:14px;">${business.email}</td></tr>` : ''}
<tr><td style="color:#6b7280;font-size:14px;">Status:</td><td><span style="background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:20px;font-size:13px;font-weight:bold;">Approved ✅</span></td></tr>
</table>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr><td align="center" style="padding-bottom:10px;">
<a href="${businessUrl}" style="display:inline-block;background:#0e4f6e;color:#ffffff;padding:13px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">View My Listing</a>
</td></tr>
<tr><td align="center">
<a href="${dashboardUrl}" style="display:inline-block;border:2px solid #0e4f6e;color:#0e4f6e;background:#ffffff;padding:11px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Go to My Dashboard</a>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-left:4px solid #0891b2;margin-bottom:24px;">
<tr><td style="padding:18px 22px;">
<p style="margin:0 0 8px;color:#0c4a6e;font-size:14px;font-weight:bold;">What&#39;s Next?</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">&#8226; Log in to your dashboard to manage your listing and keep it up to date, add photos, post deals, check your stats, and more.</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">&#8226; Collect reviews to build your reputation.</p>
<p style="margin:0;color:#374151;font-size:14px;">&#8226; Share your listing on social media to reach more customers.</p>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;margin-bottom:24px;">
<tr><td style="padding:18px 22px;">
<p style="margin:0 0 8px;color:#78350f;font-size:15px;font-weight:bold;">Want to promote your business even more?</p>
<p style="margin:0 0 6px;color:#92400e;font-size:14px;line-height:1.7;">The LBA Directory offers many services to help you boost your business:</p>
<p style="margin:0 0 4px;color:#92400e;font-size:14px;">&#8226; <strong>Upgrade your listing package</strong> - get featured and ranked higher in search results, get free advertising, discounts on services, and more.</p>
<p style="margin:0 0 4px;color:#92400e;font-size:14px;">&#8226; <strong>More leads</strong> - professional website, logo, and promotional video that convert.</p>
<p style="margin:0 0 4px;color:#92400e;font-size:14px;">&#8226; <strong>Better automation</strong> - WhatsApp AI chat that handles inquiries 24/7, and automate many daily tasks, and more.</p>
<p style="margin:0 0 14px;color:#92400e;font-size:14px;">&#8226; <strong>Stronger reputation</strong> - CRM tools to follow up and retain customers.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<a href="${inquiryUrl}" style="display:inline-block;background:#d97706;color:#ffffff;padding:11px 26px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">Boost your business Now</a>
</td></tr></table>
</td></tr>
</table>
<p style="margin:0 0 6px;color:#6b7280;font-size:14px;">Have questions? We are here to help:</p>
<p style="margin:0 0 4px;font-size:14px;color:#374151;">Email: <a href="mailto:office@lbadirectory.com" style="color:#0891b2;text-decoration:none;">office@lbadirectory.com</a></p>
<p style="margin:0 0 4px;font-size:14px;color:#374151;">Phone: <a href="tel:7326001260" style="color:#0891b2;text-decoration:none;">732-600-1260</a></p>
<p style="margin:0 0 20px;font-size:14px;color:#374151;">WhatsApp: <a href="https://wa.me/17326001260" style="color:#0891b2;text-decoration:none;">Message us on WhatsApp</a></p>
<p style="margin:0;color:#374151;font-size:14px;"><strong>The LBA Directory Team</strong></p>
</td></tr>
<tr><td style="background:#1e293b;padding:16px 40px;text-align:center;border-radius:0 0 8px 8px;">
<p style="margin:0;color:#94a3b8;font-size:12px;">LBA Directory &#8226; Serving Lakewood, Toms River, Jackson, Brick, Howell and Manchester</p>
<p style="margin:4px 0 0;font-size:12px;"><a href="${BASE_URL}" style="color:#64748b;text-decoration:none;">www.lbadirectory.com</a></p>
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