import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function sendGmail(base44, { to, subject, html }) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

  const boundary = 'boundary_' + Date.now();
  const mime = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    html,
    `--${boundary}--`
  ].join('\r\n');

  const encoded = btoa(unescape(encodeURIComponent(mime)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encoded })
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
    const { fullName, email, phone, password } = await req.json();

    if (!fullName || !email || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.Customer.filter({ email });
    if (existing && existing.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = btoa(password);
    const customer = await base44.asServiceRole.entities.Customer.create({
      full_name: fullName,
      email,
      phone: phone || '',
      password_hash: passwordHash,
      is_active: true
    });

    const appId = Deno.env.get('BASE44_APP_ID');
    const dashboardUrl = `https://${appId}.base44.app/#/UserDashboard`;

    try {
      await sendGmail(base44, {
        to: email,
        subject: "Welcome to LBA Directory - Your Account is Ready!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 26px;">Welcome to LBA Directory!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
              <p>Hello <strong>${fullName}</strong>,</p>
              <p>Your account has been successfully created.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Go to Your Dashboard
                </a>
              </div>
              <p>Questions? <a href="mailto:office@lbadirectory.com" style="color: #0891b2;">office@lbadirectory.com</a> | (732) 600-1260</p>
              <p>The LBA Directory Team</p>
            </div>
          </div>
        `
      });
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    return Response.json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});