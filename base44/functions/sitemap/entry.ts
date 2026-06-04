import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch categories and approved businesses
    const [categories, businesses] = await Promise.all([
      base44.asServiceRole.entities.Category.filter({ is_active: true }),
      base44.asServiceRole.entities.Business.filter({ status: "approved" })
    ]);

    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Static Pages -->
  <url>
    <loc>https://lbadirectory.com/</loc>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://lbadirectory.com/about</loc>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://lbadirectory.com/contact</loc>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://lbadirectory.com/faq</loc>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://lbadirectory.com/business-join</loc>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://lbadirectory.com/for-shoppers</loc>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://lbadirectory.com/terms</loc>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://lbadirectory.com/privacy</loc>
    <priority>0.5</priority>
  </url>

  <!-- Dynamic Category Pages -->`;

    // Add categories
    for (const category of categories) {
      if (category.slug) {
        xml += `
  <url>
    <loc>https://lbadirectory.com/category/${category.slug}</loc>
    <priority>0.7</priority>
  </url>`;
      }
    }

    xml += `

  <!-- Dynamic Business Pages -->`;

    // Add approved businesses
    for (const business of businesses) {
      if (business.slug) {
        const lastmod = business.updated_date 
          ? new Date(business.updated_date).toISOString().split('T')[0]
          : new Date(business.created_date).toISOString().split('T')[0];
        
        xml += `
  <url>
    <loc>https://lbadirectory.com/business/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.8</priority>
  </url>`;
      }
    }

    xml += `
  
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
      }
    });

  } catch (error) {
    return new Response(`Error generating sitemap: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
});