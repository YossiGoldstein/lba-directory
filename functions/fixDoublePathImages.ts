import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const businesses = await base44.asServiceRole.entities.Business.list();
    
    const results = {
      total: businesses.length,
      updated: 0,
      details: []
    };

    for (const business of businesses) {
      let needsUpdate = false;
      const updates = {};

      if (business.logo_url?.includes('/69160f6f331f1b03b4ecdf77/69160f6f331f1b03b4ecdf77/')) {
        updates.logo_url = business.logo_url.replace('/69160f6f331f1b03b4ecdf77/69160f6f331f1b03b4ecdf77/', '/69160f6f331f1b03b4ecdf77/');
        needsUpdate = true;
        results.details.push({ business: business.business_name, type: 'logo', fixed: updates.logo_url });
      }

      if (business.gallery_images?.length) {
        const newGallery = business.gallery_images.map(url => 
          url?.includes('/69160f6f331f1b03b4ecdf77/69160f6f331f1b03b4ecdf77/') 
            ? url.replace('/69160f6f331f1b03b4ecdf77/69160f6f331f1b03b4ecdf77/', '/69160f6f331f1b03b4ecdf77/')
            : url
        );
        if (JSON.stringify(newGallery) !== JSON.stringify(business.gallery_images)) {
          updates.gallery_images = newGallery;
          needsUpdate = true;
          results.details.push({ business: business.business_name, type: 'gallery', count: newGallery.length });
        }
      }

      if (needsUpdate) {
        await base44.asServiceRole.entities.Business.update(business.id, updates);
        results.updated++;
      }
    }

    return Response.json({ success: true, results });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});