import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

Deno.serve(async (req) => {
    const __ADMIN_SECRET = Deno.env.get("ADMIN_TASK_SECRET");
    if (!__ADMIN_SECRET || req.headers.get("x-admin-secret") !== __ADMIN_SECRET) {
      return Response.json({ error: "This migration endpoint is disabled. Set the ADMIN_TASK_SECRET env var and pass it as the 'x-admin-secret' request header to run it." }, { status: 403 });
    }
  try {
    const base44 = createClientFromRequest(req);

    const allBusinesses = await base44.asServiceRole.entities.Business.list();
    const usedSlugs = new Map(); // slug -> business.id

    // Index existing slugs
    for (const b of allBusinesses) {
      if (b.slug) usedSlugs.set(b.slug, b.id);
    }

    const updated = [];
    const skipped = [];

    for (const b of allBusinesses) {
      if (b.slug) {
        skipped.push({ id: b.id, name: b.business_name, slug: b.slug });
        continue;
      }

      const baseSlug = generateSlug(b.business_name);
      let slug = baseSlug;
      let counter = 2;
      while (usedSlugs.has(slug) && usedSlugs.get(slug) !== b.id) {
        slug = `${baseSlug}-${counter++}`;
      }

      await base44.asServiceRole.entities.Business.update(b.id, { slug });
      usedSlugs.set(slug, b.id);
      updated.push({ id: b.id, name: b.business_name, slug });
    }

    return Response.json({
      updated: updated.length,
      skipped: skipped.length,
      updatedRecords: updated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
