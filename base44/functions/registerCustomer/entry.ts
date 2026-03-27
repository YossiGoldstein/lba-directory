import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function mimeToBase64Url(mimeStr) {
  return toBase64(mimeStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendGmail(base44, { to, subject, html }) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

  const boundary = 'boundary_' + Date.now();
  const plainText = 'Please view this email in an HTML-capable email client.';
  const mime = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${toBase64(subject)}?=`,
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
    html,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  const encoded = mimeToBase64Url(mime);

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

    const passwordHash = btoa(unescape(encodeURIComponent(password)));
    const customer = await base44.asServiceRole.entities.Customer.create({
      full_name: fullName,
      email,
      phone: phone || '',
      password_hash: passwordHash,
      is_active: true
    });

    const dashboardUrl = 'https://www.lbadirectory.com/UserDashboard';

    try {
      await base44.functions.invoke('sendWelcomeEmail', { email, full_name: fullName });
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    return Response.json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});