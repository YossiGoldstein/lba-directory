import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get admin user to verify
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { business_id } = await req.json();

    if (!business_id) {
      return Response.json({ error: 'Missing business_id' }, { status: 400 });
    }

    // Get business and owner details
    const businesses = await base44.entities.Business.list();
    const business = businesses.find(b => b.id === business_id);

    if (!business) {
      return Response.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get owner email from created_by
    const users = await base44.entities.User.list();
    const owner = users.find(u => u.email === business.created_by);

    if (!owner) {
      return Response.json({ error: 'Owner not found' }, { status: 404 });
    }

    const dashboardUrl = `${Deno.env.get("BASE44_APP_ID") ? `https://${Deno.env.get("BASE44_APP_ID")}.lakewoodlba.com` : 'https://lakewoodlba.com'}/business-dashboard`;

    // Send approval email to owner
    await base44.integrations.Core.SendEmail({
      to: owner.email,
      subject: "🎉 העסק שלכם אושר! - LBA Directory",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
          <h2 style="color: #10b981;">ברכות! 🎉 ${owner.full_name}</h2>
          
          <p>אנחנו שמחים להודיע שהעסק שלכם <strong>"${business.business_name}"</strong> אושר ועכשיו חי בדיקטוריון!</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
            <h3 style="margin-top: 0; color: #047857;">✅ פרטי העסק שלכם:</h3>
            <p><strong>שם העסק:</strong> ${business.business_name}</p>
            <p><strong>קטגוריה:</strong> ${business.category_id}</p>
            <p><strong>טלפון:</strong> ${business.phone}</p>
            <p><strong>כתובת:</strong> ${business.address_line1}, ${business.city}</p>
            <p><strong>אתר שלי:</strong> <a href="https://lakewoodlba.com/business/${business.slug}" target="_blank" style="color: #0891b2; text-decoration: none;">לחץ כאן כדי לצפות בדף שלך</a></p>
          </div>
          
          <p><strong>🚀 מה עכשיו?</strong></p>
          <ul style="margin: 10px 0; padding-right: 20px;">
            <li>הלקוחות יכולים למצוא אתכם בדיקטוריון</li>
            <li>אתם יכולים לנהל את העסק שלכם דרך לוח הבקרה</li>
            <li>תוכלו ליצור עסקאות וקופונים</li>
            <li>הלקוחות יוכלו להשאיר ביקורות ודירוגים</li>
          </ul>
          
          <div style="background: #ede9fe; border: 2px solid #a78bfa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #5b21b6;">💼 ניהול העסק שלכם</h3>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${dashboardUrl}" 
                 style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; 
                         text-decoration: none; border-radius: 8px; font-weight: bold;">
                לוח הבקרה שלי
              </a>
            </div>
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #92400e;">🌟 כיצד להשיג עוד תאים אור?</h3>
            <p>רוצים להצליח יותר? אנחנו מציעים:</p>
            <ul style="margin: 10px 0; padding-right: 20px;">
              <li>📱 שדרוג ל-<strong>Pro</strong> - לדירוג עדיפי ותמונות ללא הגבלה</li>
              <li>🎨 <strong>בניית לוגו ועיצוב</strong> - עיצוב מקצועי לעסק</li>
              <li>💻 <strong>בניית אתר</strong> - אתר משלכם עם הזמנות אונליין</li>
              <li>🎥 <strong>סרטון תדמית</strong> - סרטון מקצועי לעסק</li>
              <li>📊 <strong>ייעוץ שיווקי</strong> - עזרה בקידום העסק</li>
            </ul>
            <p><strong>צרו איתנו קשר!</strong></p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; text-align: center; color: #6b7280;">
              <strong>📞 צור קשר:</strong><br>
              📧 office@lbadirectory.com<br>
              📱 732-600-1260 (וואטסאפ וטלפון)<br>
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            תודה שבחרתם ב-LBA Directory! אנחנו שמחים לעזור לעסק שלכם לגדול.
          </p>
          
          <p style="margin-top: 30px;">בברכה,<br><strong>צוות LBA Directory</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="text-align: center; font-size: 12px; color: #6b7280;">
            LBA Directory - דיקטוריון העסקים של לייקווד
          </p>
        </div>
      `
    });

    return Response.json({ 
      success: true, 
      message: "Approval email sent successfully" 
    });

  } catch (error) {
    console.error("Error sending approval email:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});