import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function generateToken(businessId: string, email: string): string {
  try {
    const payload = `${businessId}:${email}:${Date.now() + TOKEN_TTL_MS}`;
    return btoa(unescape(encodeURIComponent(payload))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  } catch(e) {
    throw new Error(`Token generation failed: ${e.message}`);
  }
}

function mimeToBase64Url(mimeStr: string): string {
  const bytes = new TextEncoder().encode(mimeStr);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
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
    const { businessId } = body;

    if (!businessId) {
      return Response.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // Step 1: Find business
    let business;
    try {
      const businesses = await base44.asServiceRole.entities.Business.filter({ id: businessId });
      business = businesses[0];
    } catch(e) {
      return Response.json({ error: `DB lookup failed: ${e.message}` }, { status: 500 });
    }

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    if (!business.email || !business.email.trim()) {
      return Response.json({ error: 'Business has no email address' }, { status: 400 });
    }

    // Step 2: Generate token
    let token: string;
    let claimUrl: string;
    try {
      token = generateToken(businessId, business.email.trim());
      claimUrl = `https://lbadirectory.com/SetPassword?token=${token}&bid=${businessId}`;
    } catch(e) {
      return Response.json({ error: `Token error: ${e.message}` }, { status: 500 });
    }

    // Step 3: Get Gmail access token
    let accessToken: string;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('gmail');
      accessToken = conn.accessToken;
    } catch(e) {
      return Response.json({ error: `Gmail connection failed: ${e.message}` }, { status: 500 });
    }

    // Step 4: Send email
    const businessName = (business.business_name || 'Your Business').replace(/&amp;/g, '&');

    try {
      await sendGmail(accessToken, {
        to: business.email.trim(),
        subject: `Your Business Listing is Live - ${businessName}`,
        htmlBody: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
<tr><td style="background:#0e4f6e;padding:32px 40px;text-align:center;border-radius:8px 8px 0 0;">
<img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png" alt="LBA Directory" height="48" style="display:block;margin:0 auto 14px;">
<h1 style="margin:0;color:#ffffff;font-size:22px;">Your Listing is Live!</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="color:#374151;font-size:15px;">Hi,</p>
<p style="color:#374151;font-size:15px;line-height:1.7;">Congratulations! <strong style="color:#0e4f6e;">${businessName}</strong> has been approved and is now listed on LBA Directory.</p>
<p style="color:#374151;font-size:15px;">Click the button below to set your password and manage your listing:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
<tr><td align="center">
<a href="${claimUrl}" style="display:inline-block;background:#27C666;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Set My Password</a>
</td></tr>
</table>
<p style="color:#6b7280;font-size:13px;text-align:center;">This link expires in <strong>48 hours</strong>.</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
<p style="font-size:13px;color:#374151;">Questions? Email: <a href="mailto:office@lbadirectory.com" style="color:#0891b2;">office@lbadirectory.com</a> | Phone: 732-600-1260</p>
</td></tr>
<tr><td style="background:#1e293b;padding:16px 40px;text-align:center;border-radius:0 0 8px 8px;">
<p style="margin:0;color:#94a3b8;font-size:12px;">LBA Directory &bull; Lakewood, NJ</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
      });
    } catch(e) {
      return Response.json({ error: `Email send failed: ${e.message}` }, { status: 500 });
    }

    return Response.json({ success: true, message: `Email sent to ${business.email}`, business: businessName });

  } catch (error) {
    return Response.json({ error: `Unexpected error: ${error.message}` }, { status: 500 });
  }
});
