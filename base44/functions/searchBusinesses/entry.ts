import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const STOP_WORDS = new Set([
  'im','i','a','an','the','to','for','and','or','is','are','am','be','been',
  'being','have','has','had','do','does','did','will','would','could','should',
  'may','might','can','in','on','at','by','with','from','of','as','about',
  'into','through','during','looking','buy','find','search','need','want','get',
  'help','show','me','you','he','she','it','we','they','what','where','when',
  'why','how','please','any','some','there','here','this','that','my','your'
]);

function extractKeywords(query) {
  return query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function getDeliveryOptions(b) {
  const options = [];
  if (b.doordash_url) options.push('DoorDash');
  if (b.uber_eats_url) options.push('Uber Eats');
  if (b.grubhub_url) options.push('Grubhub');
  if (b.postmates_url) options.push('Postmates');
  if (b.instacart_url) options.push('Instacart');
  if (b.toast_url) options.push('Toast');
  if (b.k1_url) options.push('K1');
  return options;
}

function serializeBusiness(b) {
  return {
    id: b.id,
    business_name: b.business_name,
    short_description: b.short_description,
    long_description: b.long_description,
    address_line1: b.address_line1,
    address_line2: b.address_line2,
    city: b.city,
    state: b.state,
    zip_code: b.zip_code,
    phone: b.phone,
    whatsapp_number: b.whatsapp_number,
    email: b.email,
    website_url: b.website_url,
    opening_hours_text: b.opening_hours_text,
    opening_hours_json: b.opening_hours_json,
    by_appointment_only: b.by_appointment_only,
    general_rating: b.general_rating,
    reviews_count: b.reviews_count,
    is_vip: b.is_vip,
    is_featured: b.is_featured,
    logo_url: b.logo_url,
    tags: b.tags,
    ai_tags: b.ai_tags,
    delivery_options: getDeliveryOptions(b),
    doordash_url: b.doordash_url,
    uber_eats_url: b.uber_eats_url,
    grubhub_url: b.grubhub_url,
    instacart_url: b.instacart_url,
    postmates_url: b.postmates_url,
    toast_url: b.toast_url,
    k1_url: b.k1_url,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    const allBusinesses = await base44.asServiceRole.entities.Business.list();
    const approved = allBusinesses.filter(b => b.status === 'approved');

    // Strip "open now" phrases for keyword matching
    const cleanedQuery = query.toLowerCase()
      .replace(/open now|open today|currently open|open right now/g, '')
      .trim();
    const keywords = extractKeywords(cleanedQuery);

    let matchedBusinesses = [];

    if (keywords.length > 0) {
      matchedBusinesses = approved.filter(b => {
        const searchText = [
          b.business_name,
          b.short_description,
          b.long_description,
          b.ai_summary,
          b.ai_highlights,
          ...(b.tags || []),
          ...(b.ai_tags || []),
          b.city,
          b.state,
          b.category_id,
          b.doordash_url ? 'doordash delivery' : '',
          b.uber_eats_url ? 'uber eats delivery' : '',
          b.grubhub_url ? 'grubhub delivery' : '',
          b.instacart_url ? 'instacart delivery' : '',
          b.by_appointment_only ? 'appointment' : '',
        ].filter(Boolean).join(' ').toLowerCase();

        return keywords.some(kw => searchText.includes(kw));
      });

      // Sort: VIP → featured → rank → rating
      matchedBusinesses.sort((a, b) => {
        if (a.is_vip !== b.is_vip) return (b.is_vip ? 1 : 0) - (a.is_vip ? 1 : 0);
        if (a.is_featured !== b.is_featured) return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        if ((b.listing_rank || 0) !== (a.listing_rank || 0)) return (b.listing_rank || 0) - (a.listing_rank || 0);
        return (b.general_rating || 0) - (a.general_rating || 0);
      });
    }

    const topBusinesses = matchedBusinesses.slice(0, 10);

    return Response.json({
      query,
      businesses: topBusinesses.map(serializeBusiness),
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});