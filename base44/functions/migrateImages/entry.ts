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
        // Check logo_url
        if (business.logo_url) {
          const logoResult = await checkAndMigrateImage(business.logo_url, base44);
          if (logoResult.newUrl && logoResult.newUrl !== business.logo_url) {
            updates.logo_url = logoResult.newUrl;
            needsUpdate = true;
            results.details.push({
              business: business.business_name,
              type: 'logo',
              old: business.logo_url,
              new: logoResult.newUrl,
              status: logoResult.status
            });
          }
        }

        // Check gallery_images
        if (business.gallery_images && Array.isArray(business.gallery_images)) {
          const newGallery = [];
          let galleryChanged = false;

          for (const imgUrl of business.gallery_images) {
            const imgResult = await checkAndMigrateImage(imgUrl, base44);
            if (imgResult.newUrl) {
              newGallery.push(imgResult.newUrl);
              if (imgResult.newUrl !== imgUrl) {
                galleryChanged = true;
                results.details.push({
                  business: business.business_name,
                  type: 'gallery',
                  old: imgUrl,
                  new: imgResult.newUrl,
                  status: imgResult.status
                });
              }
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
    console.error('Migration error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});

async function checkAndMigrateImage(url, base44) {
  if (!url || typeof url !== 'string') {
    return { status: 'invalid', newUrl: null };
  }

  // If already a valid Supabase URL, check if it exists
  if (url.startsWith('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/')) {
    const exists = await checkImageExists(url);
    if (exists) {
      return { status: 'exists', newUrl: url };
    }
    // Image doesn't exist, try to find original
    return { status: 'missing', newUrl: null };
  }

  // Check if it's a base44.app URL that needs migration
  if (url.includes('base44.app/api/apps/')) {
    try {
      // Download image from old URL
      const response = await fetch(url);
      if (!response.ok) {
        return { status: 'download_failed', newUrl: null };
      }

      const blob = await response.blob();
      const fileName = url.split('/').pop() || `migrated_${Date.now()}.jpg`;

      // Upload to Base44 storage
      const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
        file: blob
      });

      if (uploadResult.file_url) {
        return { status: 'migrated', newUrl: uploadResult.file_url };
      }

      return { status: 'upload_failed', newUrl: null };

    } catch (error) {
      console.error('Migration error for URL:', url, error);
      return { status: 'error', newUrl: null };
    }
  }

  // Return as-is for external URLs
  return { status: 'external', newUrl: url };
}

async function checkImageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
