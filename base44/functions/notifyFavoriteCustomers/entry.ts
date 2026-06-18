import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const escapeHtml = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

// Parse a date for display without treating a date-only "YYYY-MM-DD" string as
// UTC midnight (which renders the previous day in US timezones). Returns null on
// missing/invalid input.
function parseLocalDate(value){ if(!value) return null; const s=String(value); if(s.includes('T')){const d=new Date(s); return isNaN(d.getTime())?null:d;} const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/); if(m) return new Date(Number(m[1]),Number(m[2])-1,Number(m[3])); const d=new Date(s); return isNaN(d.getTime())?null:d; }

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();
        const deal_id = payload.deal_id || payload.event?.entity_id;

        if (!deal_id) {
            return Response.json({ error: 'Missing deal_id' }, { status: 400 });
        }

        // Get deal details
        const deals = await base44.asServiceRole.entities.Deal.filter({ id: deal_id });
        const deal = deals[0];

        if (!deal) {
            return Response.json({ error: 'Deal not found' }, { status: 404 });
        }

        // Get business details
        const businesses = await base44.asServiceRole.entities.Business.filter({ id: deal.business_id });
        const business = businesses[0];

        if (!business) {
            return Response.json({ error: 'Business not found' }, { status: 404 });
        }

        // Get all favorites for this business
        const businessFavorites = await base44.asServiceRole.entities.Favorite.filter({ business_id: deal.business_id });

        if (businessFavorites.length === 0) {
            return Response.json({
                message: 'No customers have favorited this business',
                notified: 0
            });
        }

        // Get customers who favorited this business
        const customerIds = businessFavorites.map(f => f.user_id).filter(Boolean);
        const customers = customerIds.length > 0
            ? await base44.asServiceRole.entities.Customer.filter({ id: { $in: customerIds } })
            : [];
        
        let notifiedCount = 0;
        const notificationTitle = `New Deal at ${business.business_name}!`;
        const notificationMessage = `${business.business_name} has a new deal: ${deal.title}`;
        const businessUrl = `https://lbadirectory.com/businesslisting/${business.slug || business.id}`;

        // Create notifications and send emails
        for (const favorite of businessFavorites) {
            const customer = customers.find(c => c.id === favorite.user_id);
            
            if (!customer || !customer.is_active) continue;

            // Create notification (email_sent stays false until the email actually sends)
            const notification = await base44.asServiceRole.entities.Notification.create({
                customer_id: customer.id,
                business_id: business.id,
                deal_id: deal.id,
                type: 'new_deal',
                title: notificationTitle,
                message: notificationMessage,
                is_read: false,
                email_sent: false
            });

            // Send email
            const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .deal-box { background: white; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; background: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Deal Alert!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${escapeHtml(customer.full_name)}</strong>,</p>

            <p>Great news! <strong>${escapeHtml(business.business_name)}</strong>, one of your favorite businesses, has a new deal:</p>

            <div class="deal-box">
                <h2 style="color: #f59e0b; margin-top: 0;">${escapeHtml(deal.title)}</h2>
                ${deal.description ? `<p>${escapeHtml(deal.description)}</p>` : ''}
                ${deal.badge_text ? `<p><strong>Special:</strong> ${escapeHtml(deal.badge_text)}</p>` : ''}
                <p style="color: #6b7280; font-size: 14px;">
                    ${(() => { const d = parseLocalDate(deal.end_date); return d ? `Valid until: ${d.toLocaleDateString()}` : ''; })()}
                </p>
            </div>
            
            <p style="text-align: center;">
                <a href="${businessUrl}" class="button">View Deal Details</a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
                You're receiving this email because ${escapeHtml(business.business_name)} is in your favorites.
                You can manage your favorites in your dashboard.
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} LBA Directory. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `;

            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: customer.email,
                    subject: `New Deal at ${business.business_name}!`,
                    body: emailBody,
                    from_name: "LBA Directory"
                });
                // Email sent successfully — mark the notification accordingly
                await base44.asServiceRole.entities.Notification.update(notification.id, { email_sent: true });
                notifiedCount++;
            } catch (emailError) {
                console.error(`Failed to send email to ${customer.email}:`, emailError);
                // Leave email_sent: false on send failure
            }
        }

        return Response.json({ 
            success: true,
            message: `Notified ${notifiedCount} customers`,
            notified: notifiedCount
        });

    } catch (error) {
        console.error('Error notifying customers:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});