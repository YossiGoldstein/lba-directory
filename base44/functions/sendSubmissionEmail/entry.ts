import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = 'https://www.lbadirectory.com';

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

    const dashboardUrl = `${BASE_URL}/BusinessDashboard`;

    const plainText = [
      'Submission Successful!',
      '',
      `Thank you! Your business "${business.business_name}" has been submitted to our directory.`,
      '',
      'What Happens Next?',
      '1. Review & Approval - Our team will review your submission within 1-2 business days.',
      "2. Email Notification - You'll receive an email confirmation with all your details.",
      "3. You're Live! - Your business will be live on the directory and searchable by customers.",
      '',
      'In the meantime, you can log in to your dashboard to keep editing and updating your listing.',
      '',
      `My Dashboard: ${dashboardUrl}`,
      '',
      'Have questions?',
      'Email: office@lbadirectory.com',
      'WhatsApp: 732-600-1260',
      'Phone: 732-600-1260',
      '',
      'Best regards,',
      'The LBA Directory Team',
    ].join('\n');

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
<tr><td style="background:#0e4f6e;padding:32px 40px;text-align:center;border-radius:8px 8px 0 0;">
<img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png" alt="LBA Directory" height="40" style="display:block;margin:0 auto 14px;">
<h1 style="margin:0;color:#ffffff;font-size:22px;">Submission Successful!</h1>
<p style="margin:6px 0 0;color:#bae6fd;font-size:14px;">We received your business listing</p>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">Thank you! Your business <strong style="color:#0e4f6e;">${business.business_name}</strong> has been submitted to our directory.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-left:4px solid #0891b2;margin-bottom:24px;">
<tr><td style="padding:18px 22px;">
<p style="margin:0 0 14px;color:#0c4a6e;font-size:14px;font-weight:bold;">What Happens Next?</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
  <td valign="top" style="padding-right:14px;padding-bottom:14px;">
    <div style="background:#0e4f6e;color:#fff;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;font-weight:bold;font-size:14px;">1</div>
  </td>
  <td style="padding-bottom:14px;">
    <p style="margin:0 0 2px;color:#111827;font-size:14px;font-weight:bold;">Review &amp; Approval</p>
    <p style="margin:0;color:#374151;font-size:14px;">Our team will review your submission within 1-2 business days.</p>
  </td>
</tr>
<tr>
  <td valign="top" style="padding-right:14px;padding-bottom:14px;">
    <div style="background:#0e4f6e;color:#fff;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;font-weight:bold;font-size:14px;">2</div>
  </td>
  <td style="padding-bottom:14px;">
    <p style="margin:0 0 2px;color:#111827;font-size:14px;font-weight:bold;">Email Notification</p>
    <p style="margin:0;color:#374151;font-size:14px;">You'll receive an email confirmation with all your details.</p>
  </td>
</tr>
<tr>
  <td valign="top" style="padding-right:14px;">
    <div style="background:#0e4f6e;color:#fff;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;font-weight:bold;font-size:14px;">3</div>
  </td>
  <td>
    <p style="margin:0 0 2px;color:#111827;font-size:14px;font-weight:bold;">You're Live!</p>
    <p style="margin:0;color:#374151;font-size:14px;">Your business will be live on the directory and searchable by customers.</p>
  </td>
</tr>
</table>
</td></tr>
</table>
<p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.7;">In the meantime, you can log in to your dashboard to keep editing and updating your listing.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr><td align="center">
<a href="${dashboardUrl}" style="display:inline-block;background:#0e4f6e;color:#ffffff;padding:13px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">My Dashboard</a>
</td></tr>
</table>
<p style="margin:0 0 6px;color:#6b7280;font-size:14px;">Have questions?</p>
<p style="margin:0 0 4px;font-size:14px;color:#374151;">Email: <a href="mailto:office@lbadirectory.com" style="color:#0891b2;text-decoration:none;">office@lbadirectory.com</a></p>
<p style="margin:0 0 4px;font-size:14px;color:#374151;">WhatsApp: <a href="https://wa.me/17326001260" style="color:#0891b2;text-decoration:none;">732-600-1260</a></p>
<p style="margin:0 0 20px;font-size:14px;color:#374151;">Phone: <a href="tel:7326001260" style="color:#0891b2;text-decoration:none;">732-600-1260</a></p>
<p style="margin:0;color:#374151;font-size:14px;">Best regards,<br><strong>The LBA Directory Team</strong></p>
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
      subject: `Your Business "${business.business_name}" Has Been Submitted Successfully`,
      htmlBody,
      plainText,
    });

    return Response.json({ success: true, message: `Submission email sent to ${ownerEmail}` });

  } catch (error) {
    console.error('Error sending submission email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});