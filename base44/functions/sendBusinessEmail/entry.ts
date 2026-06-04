import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const escapeHtml = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

function mimeToBase64Url(mimeStr) {
  const bytes = new TextEncoder().encode(mimeStr);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendGmail(base44, { to, subject, htmlBody }) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

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
    'Please view this email in an HTML-capable email client.',
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: mimeToBase64Url(mime) }),
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

    const { type, businessId, data } = await req.json();

    // Get email settings
    const settings = await base44.asServiceRole.entities.EmailSettings.filter({ notification_type: type });
    const setting = settings[0];

    if (!setting || !setting.is_enabled) {
      return Response.json({ success: false, message: 'Notification disabled' });
    }

    // Get business info
    const businesses = await base44.asServiceRole.entities.Business.filter({ id: businessId });
    if (!businesses || businesses.length === 0) {
      return Response.json({ success: false, message: 'Business not found' });
    }

    const biz = businesses[0];
    const ownerEmail = biz.email || biz.created_by;

    if (!ownerEmail) {
      return Response.json({ success: false, message: 'Owner email not found' });
    }

    // Replace placeholders in templates
    let subject = setting.subject_template || '';
    let body = setting.body_template || '';

    const replacements = {
      '[Name]': escapeHtml(biz.business_name || 'Business Owner'),
      '[BusinessName]': escapeHtml(biz.business_name || ''),
      '[RejectionReason]': escapeHtml(data?.rejectionReason || ''),
      '[Stars]': escapeHtml(data?.stars || ''),
      '[ReviewText]': escapeHtml(data?.reviewText || ''),
      '[DealTitle]': escapeHtml(data?.dealTitle || ''),
      '[StartDate]': escapeHtml(data?.startDate || ''),
      '[EndDate]': escapeHtml(data?.endDate || ''),
      '[ReportType]': escapeHtml(data?.reportType || ''),
      '[ReportMessage]': escapeHtml(data?.reportMessage || ''),
      '[TopSearches]': escapeHtml(data?.topSearches || ''),
      '[AISuggestions]': escapeHtml(data?.aiSuggestions || '')
    };

    for (const [key, value] of Object.entries(replacements)) {
      subject = subject.replace(new RegExp(key.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g'), value);
      body = body.replace(new RegExp(key.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g'), value);
    }

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
<tr><td style="background:#0e4f6e;padding:28px 40px;text-align:center;border-radius:8px 8px 0 0;">
<img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png" alt="LBA Directory" height="36" style="display:block;margin:0 auto 12px;">
<h1 style="margin:0;color:#ffffff;font-size:20px;">${escapeHtml(subject)}</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
<div style="color:#374151;font-size:15px;line-height:1.7;">${body.replace(/\n/g, '<br>')}</div>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
<p style="margin:0;color:#6b7280;font-size:13px;">Questions? <a href="mailto:office@lbadirectory.com" style="color:#0891b2;">office@lbadirectory.com</a> | 732-600-1260</p>
</td></tr>
<tr><td style="background:#1e293b;padding:14px 40px;text-align:center;border-radius:0 0 8px 8px;">
<p style="margin:0;color:#94a3b8;font-size:12px;">LBA Directory &bull; www.lbadirectory.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    await sendGmail(base44, { to: ownerEmail, subject, htmlBody });

    return Response.json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('sendBusinessEmail error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});