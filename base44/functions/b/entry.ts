import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const DEFAULT_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png";
const SITE_NAME = "LBA Directory";
const BASE_URL = "https://www.lbadirectory.com";

async function resolveFinalUrl(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
      });
      clearTimeout(timer);
      if ([301, 302, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (location) return location.startsWith("http") ? location : url;
      }
      return url;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return url;
  }
}

function convertBase44ImageUrl(url) {
  if (!url) return url;
  const match = url.match(
    /https:\/\/base44\.app\/api\/apps\/([^/]+)\/files\/mp\/public\/([^/]+)\/(.+)/
  );
  if (!match) return url; // not a base44.app URL, return as-is
  const [, , appId, filename] = match;
  return `https://media.base44.com/images/public/${appId}/${filename}`;
}

function getResizedImageUrl(originalUrl, width = 1200) {
  if (!originalUrl) return originalUrl;
  return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=${width}&h=630&fit=cover&a=attention&q=85&output=jpg`;
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function notFoundHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${SITE_NAME}</title>
  <meta property="og:title" content="${SITE_NAME} — Local Businesses in Lakewood, NJ">
  <meta property="og:description" content="Find and connect with local businesses in Lakewood, Toms River, Jackson, Brick, Howell, and Manchester.">
  <meta property="og:image" content="${DEFAULT_IMAGE}">
  <meta property="og:url" content="${BASE_URL}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${SITE_NAME}">
  <meta name="twitter:description" content="Find and connect with local businesses in Lakewood, NJ.">
  <meta name="twitter:image" content="${DEFAULT_IMAGE}">
  <meta http-equiv="refresh" content="0; url=${BASE_URL}">
</head>
<body>
  <script>window.location.replace("${BASE_URL}");</script>
</body>
</html>`;
}

function businessHtml(business, ogImage) {
  const title = `${business.business_name} | ${SITE_NAME}`;
  const rawDesc = business.short_description || business.long_description || `Find ${business.business_name} on LBA Directory`;
  const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "..." : rawDesc;
  const targetUrl = `${BASE_URL}/BusinessListing?id=${business.id}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:secure_url" content="${ogImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${targetUrl}">
  <meta property="og:type" content="business.business">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  <meta http-equiv="refresh" content="0; url=${targetUrl}">
</head>
<body>
  <script>window.location.replace("${targetUrl}");</script>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const slugParam = url.searchParams.get("slug");
  const idParam = url.searchParams.get("id");

  if (!slugParam && !idParam) {
    return new Response(notFoundHtml(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const allBusinesses = await base44.asServiceRole.entities.Business.list();

    let business = null;

    if (slugParam) {
      business = allBusinesses.find(b => b.slug === slugParam && b.status === "approved");
    }

    if (!business && idParam) {
      business = allBusinesses.find(b => b.id === idParam && b.status === "approved");
    }

    if (!business) {
      return new Response(notFoundHtml(), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (!business.slug) {
      const baseSlug = generateSlug(business.business_name);
      let slug = baseSlug;
      let counter = 2;
      while (allBusinesses.some(b => b.id !== business.id && b.slug === slug)) {
        slug = `${baseSlug}-${counter++}`;
      }
      await base44.asServiceRole.entities.Business.update(business.id, { slug });
      business = { ...business, slug };
    }

    const rawImage = business.cover_photo_url || (business.gallery_images && business.gallery_images[0]) || business.logo_url || DEFAULT_IMAGE;
    const convertedImage = convertBase44ImageUrl(rawImage);
    const resolvedImage = await resolveFinalUrl(convertedImage);
    const ogImage = convertedImage === DEFAULT_IMAGE ? DEFAULT_IMAGE : getResizedImageUrl(resolvedImage);

    return new Response(businessHtml(business, ogImage), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    return new Response(notFoundHtml(), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
});