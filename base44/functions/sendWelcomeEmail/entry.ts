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
    const { email, full_name } = await req.json();

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const dashboardUrl = `${BASE_URL}/UserDashboard`;
    const name = full_name || 'there';

    const plainText = [
      `Hello ${name},`,
      '',
      'Thank you for joining the LBA Directory! Your account has been successfully created.',
      '',
      'Your Account Details:',
      `Email: ${email}`,
      `Dashboard: ${dashboardUrl}`,
      '',
      'You can now:',
      '- Browse and search local businesses',
      '- Save your favorite businesses',
      '- Submit reviews',
      '- Get notified about deals and promotions',
      '- Add your business',
      '',
      'If you added your business already, wait for the approval email.',
      'In the meantime you can keep editing and updating it.',
      '',
      'If you have any questions, feel free to contact us at office@lbadirectory.com or at (732) 600-1260.',
      '',
      'Welcome aboard!',
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
<h1 style="margin:0;color:#ffffff;font-size:22px;">Welcome to LBA Directory!</h1>
<p style="margin:6px 0 0;color:#bae6fd;font-size:14px;">Your account has been successfully created</p>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="margin:0 0 16px;color:#374151;font-size:15px;">Hello <strong>${name}</strong>,</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">Thank you for joining the LBA Directory! Your account has been successfully created.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:24px;">
<tr><td style="padding:18px 22px;">
<p style="margin:0 0 10px;color:#0e4f6e;font-size:12px;font-weight:bold;text-transform:uppercase;">Your Account Details</p>
<table cellpadding="5">
<tr><td style="color:#6b7280;font-size:14px;">Email:</td><td style="color:#111827;font-size:14px;font-weight:bold;">${email}</td></tr>
</table>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr><td align="center">
<a href="${dashboardUrl}" style="display:inline-block;background:#0e4f6e;color:#ffffff;padding:13px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Go to Your Dashboard</a>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-left:4px solid #0891b2;margin-bottom:24px;">
<tr><td style="padding:18px 22px;">
<p style="margin:0 0 8px;color:#0c4a6e;font-size:14px;font-weight:bold;">You can now:</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">&#8226; Browse and search local businesses</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">&#8226; Save your favorite businesses</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">&#8226; Submit reviews</p>
<p style="margin:0 0 4px;color:#374151;font-size:14px;">&#8226; Get notified about deals and promotions</p>
<p style="margin:0;color:#374151;font-size:14px;">&#8226; Add your business</p>
</td></tr>
</table>
<p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.7;">If you added your business already, wait for the approval email. In the meantime you can keep editing and updating it.</p>
<p style="margin:0 0 6px;color:#6b7280;font-size:14px;">If you have any questions:</p>
<p style="margin:0 0 4px;font-size:14px;color:#374151;">Email: <a href="mailto:office@lbadirectory.com" style="color:#0891b2;text-decoration:none;">office@lbadirectory.com</a></p>
<p style="margin:0 0 20px;font-size:14px;color:#374151;">Phone: <a href="tel:7326001260" style="color:#0891b2;text-decoration:none;">(732) 600-1260</a></p>
<p style="margin:0;color:#374151;font-size:14px;">Welcome aboard!<br><strong>The LBA Directory Team</strong></p>
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
      to: email,
      subject: 'Welcome to LBA Directory - Your Account is Ready!',
      htmlBody,
      plainText,
    });

    return Response.json({ success: true, message: `Welcome email sent to ${email}` });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});