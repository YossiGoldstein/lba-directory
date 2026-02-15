import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // Fetch all businesses
    const businesses = await base44.asServiceRole.entities.Business.list();
    
    let updatedCount = 0;
    const errors = [];
    
    for (const business of businesses) {
      try {
        let needsUpdate = false;
        const updates = {};
        
        // Access data from business object
        const data = business.data || business;
        
        console.log(`Checking business: ${data.business_name}, logo: ${data.logo_url?.substring(0, 50)}`);
        
        // Fix logo_url
        if (data.logo_url && data.logo_url.includes('base44.app/api/apps/')) {
          const newUrl = data.logo_url
            .replace('https://base44.app/api/apps/', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/')
            .replace('/files/public/', '/');
          updates.logo_url = newUrl;
          needsUpdate = true;
        }
        
        // Fix gallery_images
        if (data.gallery_images && Array.isArray(data.gallery_images)) {
          const fixedGallery = data.gallery_images.map(url => {
            if (url && url.includes('base44.app/api/apps/')) {
              return url
                .replace('https://base44.app/api/apps/', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/')
                .replace('/files/public/', '/');
            }
            return url;
          });
          
          // Check if any URL was changed
          if (JSON.stringify(fixedGallery) !== JSON.stringify(data.gallery_images)) {
            updates.gallery_images = fixedGallery;
            needsUpdate = true;
          }
        }
        
        // Update if needed
        if (needsUpdate) {
          await base44.asServiceRole.entities.Business.update(business.id, updates);
          updatedCount++;
          console.log(`Updated business: ${data.business_name}`);
        }
      } catch (error) {
        const data = business.data || business;
        errors.push({
          businessId: business.id,
          businessName: data.business_name,
          error: error.message
        });
        console.error(`Error updating business ${data.business_name}:`, error);
      }
    }
    
    return Response.json({ 
      success: true,
      totalBusinesses: businesses.length,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error in fixBusinessImages:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});