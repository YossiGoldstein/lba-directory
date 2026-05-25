import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function generateToken(businessId: string, email: string): string {
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

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: businessId });
    const business = businesses[0];

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    if (!business.email) {
      return Response.json({ error: 'Business has no email address' }, { status: 400 });
    }

    const token = generateToken(businessId, business.email);
    const claimUrl = `https://lbadirectory.com/SetPassword?token=${token}&bid=${businessId}`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: business.email,
      subject: `Your Business is Live - ${business.business_name}`,
      body: `<!DOCTYPE html>
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
<p style="color:#374151;font-size:15px;line-height:1.7;">Congratulations! <strong style="color:#0e4f6e;">${business.business_name}</strong> has been approved and is now listed on LBA Directory.</p>
<p style="color:#374151;font-size:15px;">Click the button below to set your password and manage your listing:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
<tr><td align="center">
<a href="${claimUrl}" style="display:inline-block;background:#27C666;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Claim My Business</a>
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

    return Response.json({ success: true, message: `Email sent to ${business.email}`, business: business.business_name });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});