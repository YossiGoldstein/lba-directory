import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Get all businesses
    const businesses = await base44.asServiceRole.entities.Business.list();
    
    const results = {
      total: businesses.length,
      processed: 0,
      updated: 0,
      errors: [],
      details: []
    };

    for (const business of businesses) {
      results.processed++;
      let needsUpdate = false;
      const updates = {};

      try {
        // Fix logo_url if it has double path
        if (business.logo_url && business.logo_url.includes('/69160f6f331f1b03b4ecdf77/69160f6f331f1b03b4ecdf77/')) {
          const fixed = business.logo_url.replace(
            '/69160f6f331f1b03b4ecdf77/69160f6f331f1b03b4ecdf77/',
            '/69160f6f331f1b03b4ecdf77/'
          );
          updates.logo_url = fixed;
          needsUpdate = true;
          results.details.push({
            business: business.business_name,
            type: 'logo',
            old: business.logo_url,
            new: fixed
          });
        }

        // Fix gallery_images if they have double path
        if (business.gallery_images && Array.isArray(business.gallery_images)) {
          const newGallery = [];
          let galleryChanged = false;

          for (const imgUrl of business.gallery_images) {
            if (imgUrl && imgUrl.includes('/69160f6f331f1b03b4ecdf77/69160f6f331f1b03b4ecdf77/')) {
              const fixed = imgUrl.replace(
                '/69160f6f331f1b03b4ecdf77/69160f6f331f1b03b4ecdf77/',
                '/69160f6f331f1b03b4ecdf77/'
              );
              newGallery.push(fixed);
              galleryChanged = true;
              results.details.push({
                business: business.business_name,
                type: 'gallery',
                old: imgUrl,
                new: fixed
              });
            } else {
              newGallery.push(imgUrl);
            }
          }

          if (galleryChanged) {
            updates.gallery_images = newGallery;
            needsUpdate = true;
          }
        }

        // Update business if needed
        if (needsUpdate) {
          await base44.asServiceRole.entities.Business.update(business.id, updates);
          results.updated++;
        }

      } catch (error) {
        results.errors.push({
          business: business.business_name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Fix paths error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
