import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function sendEmail({ to, subject, html }) {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'LBA Directory <office@lbadirectory.com>',
      to,
      subject,
      html
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const { email, fullName } = await req.json();

    if (!email || !fullName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const appId = Deno.env.get('BASE44_APP_ID');
    const dashboardUrl = `https://${appId}.base44.app/#/UserDashboard`;

    await sendEmail({
      to: email,
      subject: "Welcome to LBA Directory - Your Account is Ready!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 26px;">Welcome to LBA Directory!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Thank you for joining the LBA Directory! Your account has been successfully created.</p>

            <div style="background: white; padding: 16px 20px; border-left: 4px solid #0891b2; margin: 20px 0; border-radius: 0 6px 6px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Dashboard:</strong> <a href="${dashboardUrl}" style="color: #0891b2;">${dashboardUrl}</a></p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${dashboardUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Go to Your Dashboard
              </a>
            </div>

            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>You can now:</strong></p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Browse and search local businesses</li>
                <li>Save your favorite businesses</li>
                <li>Submit reviews</li>
                <li>Get notified about deals and promotions</li>
                <li>Add your business</li>
              </ul>
            </div>

            <p>Questions? Contact us: <a href="mailto:office@lbadirectory.com" style="color: #0891b2;">office@lbadirectory.com</a> | (732) 600-1260</p>
            <p>Welcome aboard!<br><strong>The LBA Directory Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 13px;">
            LBA Directory - Serving Lakewood, Toms River, Jackson, Brick, Howell, Manchester
          </div>
        </div>
      `
    });

    return Response.json({ success: true, message: 'Welcome email sent successfully' });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});