import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email, fullName, password } = await req.json();

        if (!email || !fullName) {
            return Response.json({ 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        const dashboardUrl = `https://${req.headers.get('host')}/UserDashboard`;

        const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 26px; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #0891b2; color: white !important; padding: 13px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; font-size: 15px; }
        .info-box { background: white; padding: 16px 20px; border-left: 4px solid #0891b2; margin: 20px 0; border-radius: 0 6px 6px 0; }
        .info-box p { margin: 6px 0; }
        .features { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
        .features li { margin: 8px 0; }
        .notice { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 14px 18px; margin: 20px 0; color: #92400e; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to LBA Directory!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>

            <p>Thank you for joining the LBA Directory! Your account has been successfully created.</p>

            <div class="info-box">
                <h3 style="margin: 0 0 10px 0;">Your Account Details:</h3>
                <p><strong>Email:</strong> ${email}</p>
                ${password ? `<p><strong>Password:</strong> ${password}</p>` : ''}
                <p><strong>Dashboard:</strong> <a href="${dashboardUrl}" style="color: #0891b2;">${dashboardUrl}</a></p>
            </div>

            <p style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Go to Your Dashboard</a>
            </p>

            <div class="features">
                <p style="margin: 0 0 10px 0;"><strong>You can now:</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Browse and search local businesses</li>
                    <li>Save your favorite businesses</li>
                    <li>Submit reviews</li>
                    <li>Get notified about deals and promotions</li>
                    <li>Add your business</li>
                </ul>
            </div>

            <div class="notice">
                <strong>Added a business already?</strong> Wait for the approval email. In the meantime, you can keep editing and updating your listing.
            </div>

            <p>If you have any questions, feel free to contact us at <a href="mailto:office@lbadirectory.com" style="color: #0891b2;">office@lbadirectory.com</a> or at <a href="tel:7326001260" style="color: #0891b2;">(732) 600-1260</a>.</p>

            <p>Welcome aboard!<br><strong>The LBA Directory Team</strong></p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} LBA Directory. All rights reserved.</p>
            <p>Serving Lakewood, Toms River, Jackson, Brick, Howell, Manchester</p>
        </div>
    </div>
</body>
</html>
        `;

        // Use service role to send email
        const response = await fetch('https://api.base44.com/integrations/core/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY')}`,
                'X-App-Id': Deno.env.get('BASE44_APP_ID')
            },
            body: JSON.stringify({
                to: email,
                subject: "Welcome to LBA Directory - Your Account is Ready!",
                body: emailBody,
                from_name: "LBA Directory"
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to send email: ${error}`);
        }

        return Response.json({ 
            success: true,
            message: 'Welcome email sent successfully' 
        });

    } catch (error) {
        console.error('Error sending welcome email:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});