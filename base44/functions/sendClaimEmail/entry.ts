import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = 'https://www.lbadirectory.com';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function generateToken(businessId: string, email: string): string {
  const payload = `${businessId}:${email}:${Date.now() + TOKEN_TTL_MS}`;
  return btoa(unescape(encodeURIComponent(payload))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { businessId, userId, userEmail, userName, targetEmail, adminSent } = body;

    if (!businessId) {
      return Response.json({ error: 'businessId is required' }, { status: 400 });
    }

    const recipientEmail = (adminSent && targetEmail) ? targetEmail : userEmail;
    const recipientName = userName || 'Business Owner';

    if (!recipientEmail) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: businessId });
    if (!businesses || businesses.length === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }
    const business = businesses[0];

    if (business.owner_id && business.owner_id !== 'lba_directory') {
      return Response.json({ error: 'This business has already been claimed' }, { status: 400 });
    }

    const token = generateToken(businessId, recipientEmail);
    const claimUrl = `${BASE_URL}/ClaimBusiness?token=${token}`;
    const businessName = (business.business_name || '').replace(/&amp;/g, '&');

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `Claim Your Business: ${businessName}`,
      body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
<tr><td style="background:#0e4f6e;padding:32px 40px;text-align:center;border-radius:8px 8px 0 0;">
<img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png" alt="LBA Directory" height="48" style="display:block;margin:0 auto 14px;">
<h1 style="margin:0;color:#ffffff;font-size:22px;">Claim Your Business</h1>
<p style="margin:6px 0 0;color:#bae6fd;font-size:14px;">Take control of your listing on LBA Directory</p>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="margin:0 0 16px;color:#374151;font-size:15px;">Hi ${recipientName},</p>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
  You have been invited to claim <strong style="color:#0e4f6e;">${businessName}</strong> on LBA Directory.<br>
  Click the button below to verify your ownership and take control of this listing.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
<tr><td align="center">
<a href="${claimUrl}" style="display:inline-block;background:#27C666;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Claim Your Business</a>
</td></tr>
</table>
<p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-align:center;">This link expires in <strong>24 hours</strong>.</p>
<p style="margin:0 0 24px;color:#9ca3af;font-size:13px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;">
<p style="margin:0 0 4px;font-size:13px;color:#374151;">Questions? Contact us:</p>
<p style="margin:0 0 4px;font-size:13px;color:#374151;">Email: <a href="mailto:office@lbadirectory.com" style="color:#0891b2;">office@lbadirectory.com</a></p>
<p style="margin:0;font-size:13px;color:#374151;">Phone: <a href="tel:7326001260" style="color:#0891b2;">732-600-1260</a></p>
</td></tr>
<tr><td style="background:#1e293b;padding:16px 40px;text-align:center;border-radius:0 0 8px 8px;">
<p style="margin:0;color:#94a3b8;font-size:12px;">LBA Directory &bull; Serving Lakewood, Toms River, Jackson, Brick, Howell and Manchester</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
    });

    return Response.json({ success: true, message: `Claim email sent to ${recipientEmail}` });

  } catch (error) {
    console.error('Error sending claim email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});