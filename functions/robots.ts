Deno.serve(async (req) => {
  const robotsTxt = `User-agent: *
Allow: /

# Block private admin areas
Disallow: /admin
Disallow: /dashboard
Disallow: /account

Sitemap: https://lakewoodlba.com/sitemap.xml`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    }
  });
});