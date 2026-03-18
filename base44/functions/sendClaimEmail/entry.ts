import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await req.json();

    if (!businessId) {
      return Response.json({ error: 'businessId is required' }, { status: 400 });
    }

    // Get business
    const businesses = await base44.asServiceRole.entities.Business.filter({ id: businessId });
    if (!businesses || businesses.length === 0) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }
    const business = businesses[0];

    // Check if already claimed (has owner_id)
    if (business.owner_id) {
      return Response.json({ error: 'This business has already been claimed' }, { status: 400 });
    }

    // Check for existing pending claim by this user
    const existingClaims = await base44.asServiceRole.entities.ClaimRequest.filter({
      business_id: businessId,
      claimant_email: user.email,
      status: 'pending'
    });

    // Invalidate any old pending claims for this business+user
    for (const old of existingClaims) {
      await base44.asServiceRole.entities.ClaimRequest.update(old.id, { status: 'expired' });
    }

    // Generate secure token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Save claim request
    await base44.asServiceRole.entities.ClaimRequest.create({
      business_id: businessId,
      claimant_email: user.email,
      claimant_name: user.full_name || user.email,
      token,
      expires_at: expiresAt,
      status: 'pending'
    });

    // Build claim URL
    const appUrl = req.headers.get('origin') || 'https://lbadirectory.com';
    const claimUrl = `${appUrl}/ClaimBusiness?token=${token}`;

    // Send HTML email
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Claim Your Business</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#003D5C 0%,#0E8DAA 100%);padding:32px 40px;text-align:center;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png" alt="LBA Directory" style="height:50px;width:auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#111827;">Claim Your Business</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">Hi ${user.full_name || 'there'},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                You requested to claim <strong style="color:#003D5C;">${business.business_name}</strong> on LBA Directory.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.6;">
                Click the button below to verify your ownership and take control of this listing.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${claimUrl}" style="display:inline-block;background:linear-gradient(135deg,#27C666 0%,#1FAF5A 100%);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;letter-spacing:0.5px;">
                      ✅ Claim Your Business
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
                This link expires in <strong>24 hours</strong>. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">© ${new Date().getFullYear()} LBA Directory. All rights reserved.</p>
              <p style="margin:0;font-size:12px;color:#d1d5db;">Powered by LBA Leagues & TIG Solutions</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'LBA Directory',
      to: user.email,
      subject: `Claim Your Business: ${business.business_name}`,
      body: emailHtml
    });

    if (!emailResult) {
      throw new Error('Failed to send email');
    }

    return Response.json({ success: true, message: 'Claim email sent successfully' });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});