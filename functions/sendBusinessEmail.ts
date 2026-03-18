import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { type, businessId, data } = await req.json();
    
    // Get email settings
    const settings = await base44.asServiceRole.entities.EmailSettings.filter({
      notification_type: type
    });
    
    const setting = settings[0];
    
    if (!setting || !setting.is_enabled) {
      return Response.json({ 
        success: false, 
        message: 'Notification disabled' 
      });
    }
    
    // Get business and owner info
    const business = await base44.asServiceRole.entities.Business.filter({
      id: businessId
    });
    
    if (!business || business.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'Business not found' 
      });
    }
    
    const biz = business[0];
    const ownerEmail = biz.created_by;
    
    // Get owner details
    const users = await base44.asServiceRole.entities.User.list();
    const owner = users.find(u => u.email === ownerEmail);
    
    if (!owner) {
      return Response.json({ 
        success: false, 
        message: 'Owner not found' 
      });
    }
    
    // Replace placeholders in templates
    let subject = setting.subject_template || '';
    let body = setting.body_template || '';
    
    const replacements = {
      '[Name]': owner.full_name || 'Business Owner',
      '[BusinessName]': biz.business_name || '',
      '[RejectionReason]': data?.rejectionReason || '',
      '[Stars]': data?.stars || '',
      '[ReviewText]': data?.reviewText || '',
      '[DealTitle]': data?.dealTitle || '',
      '[StartDate]': data?.startDate || '',
      '[EndDate]': data?.endDate || '',
      '[ReportType]': data?.reportType || '',
      '[ReportMessage]': data?.reportMessage || '',
      '[TopSearches]': data?.topSearches || '',
      '[AISuggestions]': data?.aiSuggestions || ''
    };
    
    for (const [key, value] of Object.entries(replacements)) {
      subject = subject.replace(new RegExp(key, 'g'), value);
      body = body.replace(new RegExp(key, 'g'), value);
    }
    
    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'LBA Directory Team',
      to: ownerEmail,
      subject: subject,
      body: body.replace(/\n/g, '<br>')
    });
    
    return Response.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
    
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});