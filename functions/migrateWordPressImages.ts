import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Detect WordPress / broken external image URLs that need migration
function needsMigration(url) {
  if (!url || typeof url !== 'string') return false;
  // WordPress domains or old LBA WordPress site
  if (url.includes('lbadirectory.com/wp-content/uploads')) return true;
  if (url.includes('lbadirectory.com/wp-content')) return true;
  // Old base44.app API URLs
  if (url.includes('base44.app/api/apps/')) return true;
  return false;
}

function isAlreadyMigrated(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/');
}

async function downloadAndUpload(url, base44) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LBA-Migrator/1.0)' },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      return { success: false, reason: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return { success: false, reason: `Not an image: ${contentType}` };
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      return { success: false, reason: 'Empty file' };
    }

    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });

    if (uploadResult?.file_url) {
      return { success: true, newUrl: uploadResult.file_url };
    }

    return { success: false, reason: 'Upload returned no URL' };

  } catch (err) {
    return { success: false, reason: err.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;

    console.log(`🚀 Starting WordPress image migration. dry_run=${dryRun}`);

    const businesses = await base44.asServiceRole.entities.Business.list();
    console.log(`📋 Total businesses: ${businesses.length}`);

    const report = {
      dry_run: dryRun,
      total_businesses: businesses.length,
      businesses_with_wp_images: 0,
      images_migrated: 0,
      images_failed: 0,
      images_skipped_already_migrated: 0,
      businesses_updated: 0,
      details: [],
      errors: []
    };

    for (const business of businesses) {
      const businessReport = {
        id: business.id,
        name: business.business_name,
        logo: null,
        gallery: []
      };

      let hasWpImages = false;
      const updates = {};

      // --- Logo ---
      if (business.logo_url) {
        if (isAlreadyMigrated(business.logo_url)) {
          report.images_skipped_already_migrated++;
        } else if (needsMigration(business.logo_url)) {
          hasWpImages = true;
          console.log(`🖼️  [${business.business_name}] Migrating logo: ${business.logo_url}`);

          if (!dryRun) {
            const result = await downloadAndUpload(business.logo_url, base44);
            if (result.success) {
              updates.logo_url = result.newUrl;
              report.images_migrated++;
              businessReport.logo = { status: 'migrated', old: business.logo_url, new: result.newUrl };
              console.log(`  ✅ Logo migrated -> ${result.newUrl}`);
            } else {
              report.images_failed++;
              businessReport.logo = { status: 'failed', old: business.logo_url, reason: result.reason };
              console.warn(`  ❌ Logo failed: ${result.reason}`);
            }
          } else {
            businessReport.logo = { status: 'would_migrate', old: business.logo_url };
          }
        }
      }

      // --- Gallery ---
      if (Array.isArray(business.gallery_images) && business.gallery_images.length > 0) {
        const newGallery = [];
        let galleryChanged = false;

        for (const imgUrl of business.gallery_images) {
          if (isAlreadyMigrated(imgUrl)) {
            newGallery.push(imgUrl);
            report.images_skipped_already_migrated++;
          } else if (needsMigration(imgUrl)) {
            hasWpImages = true;
            console.log(`🖼️  [${business.business_name}] Migrating gallery image: ${imgUrl}`);

            if (!dryRun) {
              const result = await downloadAndUpload(imgUrl, base44);
              if (result.success) {
                newGallery.push(result.newUrl);
                galleryChanged = true;
                report.images_migrated++;
                businessReport.gallery.push({ status: 'migrated', old: imgUrl, new: result.newUrl });
                console.log(`  ✅ Gallery migrated -> ${result.newUrl}`);
              } else {
                newGallery.push(imgUrl); // keep old URL on failure
                report.images_failed++;
                businessReport.gallery.push({ status: 'failed', old: imgUrl, reason: result.reason });
                console.warn(`  ❌ Gallery failed: ${result.reason}`);
              }
            } else {
              newGallery.push(imgUrl);
              businessReport.gallery.push({ status: 'would_migrate', old: imgUrl });
            }
          } else {
            newGallery.push(imgUrl);
          }
        }

        if (!dryRun && galleryChanged) {
          updates.gallery_images = newGallery;
        }
      }

      // --- Save updates ---
      if (hasWpImages) {
        report.businesses_with_wp_images++;
        report.details.push(businessReport);

        if (!dryRun && Object.keys(updates).length > 0) {
          try {
            await base44.asServiceRole.entities.Business.update(business.id, updates);
            report.businesses_updated++;
            console.log(`💾 Saved updates for: ${business.business_name}`);
          } catch (err) {
            report.errors.push({ business: business.business_name, error: err.message });
            console.error(`❌ Failed to save ${business.business_name}: ${err.message}`);
          }
        }
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`  Businesses with WP images: ${report.businesses_with_wp_images}`);
    console.log(`  Images migrated: ${report.images_migrated}`);
    console.log(`  Images failed: ${report.images_failed}`);
    console.log(`  Already migrated (skipped): ${report.images_skipped_already_migrated}`);
    console.log(`  Businesses updated: ${report.businesses_updated}`);

    return Response.json({ success: true, report });

  } catch (error) {
    console.error('❌ Fatal migration error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});