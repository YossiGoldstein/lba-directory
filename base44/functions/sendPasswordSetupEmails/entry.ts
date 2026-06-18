import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function newResetToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function mimeToBase64Url(mimeStr: string): string {
  const bytes = new TextEncoder().encode(mimeStr);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendGmail(accessToken: string, { to, subject, htmlBody }: { to: string; subject: string; htmlBody: string }) {
  const boundary = `boundary_${Date.now()}`;
  const mime = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
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
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: mimeToBase64Url(mime) }),
  });
  if (!res.ok) throw new Error(`Gmail send error: ${await res.text()}`);
  return res.json();
}

function setupEmailHtml(businessName: string, claimUrl: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
<tr><td style="background:#0e4f6e;padding:32px 40px;text-align:center;border-radius:8px 8px 0 0;">
<h1 style="margin:0;color:#ffffff;font-size:22px;">Your Listing is Live!</h1></td></tr>
<tr><td style="padding:32px 40px;">
<p style="color:#374151;font-size:15px;">Hi,</p>
<p style="color:#374151;font-size:15px;line-height:1.7;">Congratulations! <strong style="color:#0e4f6e;">${businessName}</strong> is now listed on LBA Directory.</p>
<p style="color:#374151;font-size:15px;">Click the button below to set your password and manage your listing:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td align="center">
<a href="${claimUrl}" style="display:inline-block;background:#27C666;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Set My Password</a>
</td></tr></table>
<p style="color:#6b7280;font-size:13px;text-align:center;">This link expires in <strong>48 hours</strong>.</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
<p style="font-size:13px;color:#374151;">Questions? Email: <a href="mailto:office@lbadirectory.com" style="color:#0891b2;">office@lbadirectory.com</a> | Phone: 732-600-1260</p>
</td></tr>
<tr><td style="background:#1e293b;padding:16px 40px;text-align:center;border-radius:0 0 8px 8px;">
<p style="margin:0;color:#94a3b8;font-size:12px;">LBA Directory &bull; Lakewood, NJ</p></td></tr>
</table></td></tr></table></body></html>`;
}

// Bulk version of sendPasswordSetupEmail: emails every approved business that has
// a valid email and no password yet. Each gets a single-use stored token. Returns
// a summary so the admin sees how many were sent / skipped / failed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const approved = await base44.asServiceRole.entities.Business.filter({ status: 'approved' });
    const targets = approved.filter((b) => !b.password_hash && EMAIL_RE.test(String(b.email || '').trim().toLowerCase()));

    let accessToken: string;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('gmail');
      accessToken = conn.accessToken;
    } catch (e) {
      return Response.json({ success: false, error: `Gmail connection failed: ${e.message}` }, { status: 500 });
    }

    const result = {
      success: true,
      total: targets.length,
      skippedNoEmail: approved.filter((b) => !b.password_hash && !EMAIL_RE.test(String(b.email || '').trim().toLowerCase())).length,
      successCount: 0,
      failCount: 0,
      results: [] as Array<{ business: string; email: string; status: string; error?: string }>,
    };

    for (const business of targets) {
      const email = String(business.email).trim().toLowerCase();
      try {
        const token = newResetToken();
        await base44.asServiceRole.entities.Business.update(business.id, {
          reset_token: token,
          reset_token_expiry: Date.now() + TOKEN_TTL_MS,
        });
        const claimUrl = `https://lbadirectory.com/SetPassword?token=${token}&bid=${business.id}&email=${encodeURIComponent(email)}`;
        const businessName = (business.business_name || 'Your Business').replace(/&amp;/g, '&');
        await sendGmail(accessToken, {
          to: email,
          subject: `Your Business Listing is Live - ${businessName}`,
          htmlBody: setupEmailHtml(businessName, claimUrl),
        });
        result.successCount++;
        result.results.push({ business: business.business_name, email, status: 'sent' });
      } catch (e) {
        result.failCount++;
        result.results.push({ business: business.business_name, email, status: 'failed', error: String(e?.message || e) });
      }
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ success: false, error: `Unexpected error: ${error.message}` }, { status: 500 });
  }
});
