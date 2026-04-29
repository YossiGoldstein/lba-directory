import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

// In-memory cache — survives across requests within the same isolate
let cachedBusinesses = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const STOP_WORDS = new Set(['a','an','the','in','on','at','for','to','of','and','or','is','are','with','near','me','i','my']);

function extractQueryWords(query) {
  return query.toLowerCase().split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function businessMatchesKeywords(b, queryWords) {
  const haystack = [
    b.business_name,
    b.short_description,
    b.long_description,
    ...(b.tags || []),
    ...(b.ai_tags || []),
    b.category_id,
    b.city,
  ].join(' ').toLowerCase();
  return queryWords.some(w => haystack.includes(w));
}

async function getApprovedBusinesses(base44) {
  const now = Date.now();
  if (cachedBusinesses && now < cacheExpiry) {
    return cachedBusinesses;
  }
  const all = await base44.asServiceRole.entities.Business.list();
  cachedBusinesses = all.filter(b => b.status === 'approved');
  cacheExpiry = now + CACHE_TTL_MS;
  return cachedBusinesses;
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
    slug: b.slug,
    business_name: b.business_name,
    latitude: b.latitude,
    longitude: b.longitude,
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
    listing_rank: b.listing_rank,
    logo_url: b.logo_url,
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

    // Fetch approved businesses (cached for 5 min)
    const approved = await getApprovedBusinesses(base44);

    // Keyword pre-filter
    const queryWords = extractQueryWords(query);
    const preFiltered = approved.filter(b => businessMatchesKeywords(b, queryWords));
    const candidatePool = preFiltered.length > 0 ? preFiltered : approved;

    // Build minimal payload for Claude — only what it needs to match
    const minimalList = candidatePool.map(b => ({
      id: b.id,
      name: b.business_name,
      category: b.category_id,
      tags: [...(b.tags || []), ...(b.ai_tags || [])].join(', '),
      hours: b.by_appointment_only ? 'By appointment only' : (b.opening_hours_text || ''),
      description: b.short_description || '',
    }));

    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    const prompt = `Current time: ${now} Eastern Time.
User query: "${query}"

Below is a list of businesses. Return ONLY a JSON array of matching business IDs, ranked by relevance (best match first). No explanation, no markdown — just the raw JSON array.

Rules:
- Include only businesses that genuinely match the query
- If query mentions "open now", use hours field + current time to filter
- If nothing matches, return []

Businesses:
${JSON.stringify(minimalList)}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = response.content[0].text.trim();

    // Extract JSON array robustly
    const start = rawText.indexOf('[');
    const end = rawText.lastIndexOf(']');
    let rankedIds = [];
    if (start !== -1 && end !== -1) {
      rankedIds = JSON.parse(rawText.slice(start, end + 1));
    }

    // Build a map for fast lookup
    const businessMap = Object.fromEntries(candidatePool.map(b => [b.id, b]));

    // Return businesses in Claude's ranked order, preserving VIP/featured at top
    const matched = rankedIds
      .filter(id => businessMap[id])
      .map(id => businessMap[id]);

    // Re-sort to ensure VIP/featured always bubble up within ranked results
    matched.sort((a, b) => {
      if (a.is_vip !== b.is_vip) return (b.is_vip ? 1 : 0) - (a.is_vip ? 1 : 0);
      if (a.is_featured !== b.is_featured) return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      return rankedIds.indexOf(a.id) - rankedIds.indexOf(b.id);
    });

    return Response.json({
      query,
      businesses: matched.map(serializeBusiness),
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});