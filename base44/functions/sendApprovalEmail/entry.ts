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
    const { business_id } = await req.json();

    if (!business_id) {
      return Response.json({ error: 'Missing business_id' }, { status: 400 });
    }

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: business_id });
    const business = businesses[0];

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    const ownerEmail = business.email || business.created_by;
    if (!ownerEmail) {
      return Response.json({ error: 'No email address found for business' }, { status: 404 });
    }

    const appId = Deno.env.get("BASE44_APP_ID");
    const baseUrl = `https://${appId}.base44.app`;
    const dashboardUrl = `${baseUrl}/#/business-dashboard`;
    const businessUrl = `${baseUrl}/#/business-listing?id=${business.id}`;
    const inquiryUrl = `${baseUrl}/#/ServiceInquiry?business=${encodeURIComponent(business.business_name)}&phone=${encodeURIComponent(business.phone || '')}&email=${encodeURIComponent(ownerEmail)}`;

    await sendGmail(base44, {
      to: ownerEmail,
      subject: "Your Business Has Been Approved - LBA Directory",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 26px;">Your Business is Now Live!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
            <p>Congratulations! Your business <strong>"${business.business_name}"</strong> has been approved and is now live on LBA Directory.</p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
              <h3 style="margin-top: 0; color: #047857;">Your Business Details:</h3>
              <p><strong>Business Name:</strong> ${business.business_name}</p>
              <p><strong>Phone:</strong> ${business.phone}</p>
              <p><strong>Address:</strong> ${business.address_line1 || ''}, ${business.city || ''}</p>
              <p><a href="${businessUrl}" style="color: #0891b2;">View Your Live Listing</a></p>
            </div>

            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Customers can now find you in the directory</li>
              <li>Manage your business through your dashboard</li>
              <li>Create deals and promotions</li>
              <li>Customers can leave reviews and ratings</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Go to My Dashboard
              </a>
            </div>

            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #92400e;">Want More Visibility?</h3>
              <p>We offer additional services: Logo Design, Landing Page, Full Website, CRM System, Promotional Video, WhatsApp AI Chat.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${inquiryUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  I'm Interested - Tell Me More
                </a>
              </div>
            </div>

            <p>Questions? Contact us: <a href="mailto:office@lbadirectory.com">office@lbadirectory.com</a> | 732-600-1260</p>
            <p>Best regards,<br><strong>LBA Directory Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 13px;">
            LBA Directory - Lakewood's Business Directory
          </div>
        </div>
      `
    });

    return Response.json({ success: true, message: `Approval email sent to ${ownerEmail}` });

  } catch (error) {
    console.error("Error sending approval email:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});