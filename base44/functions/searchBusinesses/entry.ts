import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Anthropic from 'npm:@anthropic-ai/sdk@0.65.0';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

// In-memory cache — survives across requests within the same isolate
let cachedBusinesses = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const STOP_WORDS = new Set([
  'a','an','the','in','on','at','for','to','of','and','or','is','are','with',
  'near','me','i','my','that','this','these','those','it','its','we','our',
  'you','your','they','their','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','shall','can',
  'am','was','were','about','from','by','but','not','so','if','then','than',
  'there','here','when','where','which','who','how','what','right','just',
  'some','any','all','very','really','please','help','show','find','want',
  'need','looking','searching','trying','good','great','best','local','nearby',
  'place','places','shop','shops','store','stores','business','businesses',
]);

// Filler phrases stripped from natural language before keyword extraction
const FILLER_PATTERNS = [
  /\b(i'm|i am|im)\s+(looking for|searching for|trying to find|searching)\b/gi,
  /\b(i need|i want|i'd like|i would like|i wanna)\b/gi,
  /\bwhere (can i|do i|to|can you|could i)\s+(find|get|buy|order|go for|eat)\b/gi,
  /\b(can you|could you|do you|would you)\s+(help me\s+)?(find|show|recommend|suggest|tell me about)\b/gi,
  /\b(show me|find me|help me find|get me|bring me)\b/gi,
  /\b(is there|are there|do you have|is there a|are there any)\b/gi,
  /\bthat (is|are|has|have|was|were)\b/gi,
  /\b(which is|which are)\b/gi,
  /\ba\s+(good|great|nice|decent|nearby|local)\b/gi,
  /\b(some|any)\s+(good|great|nice|local)\b/gi,
];

/**
 * Strip filler phrases and detect intent filters from a natural language query.
 * Returns a cleaned keyword string and any detected filters.
 */
function extractIntent(rawQuery: string): { cleaned: string; wantsOpenNow: boolean } {
  // Detect "open now" before stripping (patterns that would be removed)
  const wantsOpenNow = /\bopen\b.{0,20}\b(now|right now|currently|at this hour|today)\b|\bopen right now\b|\bcurrently open\b/i.test(rawQuery)
    || /\bright now\b/i.test(rawQuery);

  let cleaned = rawQuery;
  for (const pattern of FILLER_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ');
  }

  // Remove "open now / right now / currently open" from cleaned text
  // (we handle it separately as a filter)
  cleaned = cleaned.replace(/\b(open\s+)?(right\s+now|currently|at this hour)\b/gi, ' ');
  cleaned = cleaned.replace(/\bthat\s+is\s+open\b/gi, ' ');
  cleaned = cleaned.replace(/\bopen\s+now\b/gi, ' ');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return { cleaned, wantsOpenNow };
}

function extractQueryWords(query: string): string[] {
  return query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function businessMatchesKeywords(b: any, queryWords: string[]): boolean {
  if (queryWords.length === 0) return true;
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

/**
 * Check if a business is currently open using opening_hours_json.
 * Returns true when hours data is missing (don't exclude for lack of data).
 */
function isCurrentlyOpen(b: any, nowNY: Date): boolean {
  if (b.by_appointment_only) return true;
  if (!b.opening_hours_json) return true; // no data → include

  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const currentDay = dayNames[nowNY.getDay()];
  const hours = b.opening_hours_json[currentDay];

  if (!hours) return true; // no entry for today → include
  if (hours.closed) return false;
  if (!hours.open || !hours.close) return true; // malformed → include

  const currentMins = nowNY.getHours() * 60 + nowNY.getMinutes();
  const [openH, openM] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  if (closeMins < openMins) {
    // Overnight hours (close past midnight) — open if before close OR after open
    return currentMins >= openMins || currentMins <= closeMins;
  }
  return currentMins >= openMins && currentMins <= closeMins;
}

async function getApprovedBusinesses(base44: any) {
  const now = Date.now();
  if (cachedBusinesses && now < cacheExpiry) return cachedBusinesses;
  const all = await base44.asServiceRole.entities.Business.list();
  const approved = all.filter((b: any) => b.status === 'approved');
  // Don't cache an empty result — avoids serving stale/empty data on a transient fetch miss
  if (approved.length > 0) {
    cachedBusinesses = approved;
    cacheExpiry = now + CACHE_TTL_MS;
  }
  return approved;
}

function getDeliveryOptions(b: any): string[] {
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

function serializeBusiness(b: any) {
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
    cover_photo_url: b.cover_photo_url,
    gallery_images: b.gallery_images,
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

    // Step 1: Extract intent — strip filler phrases, detect filters
    const { cleaned: cleanedQuery, wantsOpenNow } = extractIntent(query);
    const effectiveQuery = cleanedQuery || query; // fallback to original if stripping removed everything

    // Current time in Eastern timezone
    const nowNY = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const nowStr = nowNY.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

    // Step 2: Fetch approved businesses (cached 5 min)
    const approved = await getApprovedBusinesses(base44);

    // Step 3: If "open now" was requested, pre-filter by actual hours data
    const timeFiltered = wantsOpenNow
      ? approved.filter((b: any) => isCurrentlyOpen(b, nowNY))
      : approved;

    // Step 4: Keyword pre-filter on cleaned query
    const queryWords = extractQueryWords(effectiveQuery);
    const preFiltered = queryWords.length > 0
      ? timeFiltered.filter((b: any) => businessMatchesKeywords(b, queryWords))
      : timeFiltered;

    // Fall back to time-filtered pool if keyword pre-filter returned nothing
    const candidatePool = preFiltered.length > 0 ? preFiltered : timeFiltered;

    // Step 5: Ask Claude to rank candidates by relevance to the cleaned query
    const minimalList = candidatePool.map((b: any) => ({
      id: b.id,
      name: b.business_name,
      category: b.category_id,
      tags: [...(b.tags || []), ...(b.ai_tags || [])].join(', '),
      description: b.short_description || '',
    }));

    const prompt = `Current time: ${nowStr} Eastern Time.
User is searching for: "${effectiveQuery}"
${wantsOpenNow ? '(Businesses are already pre-filtered to those currently open — focus only on relevance.)\n' : ''}
Below is a list of businesses. Return ONLY a JSON array of matching business IDs, ranked by relevance (best match first). No explanation, no markdown — just the raw JSON array.

Rules:
- Include businesses that match the type/category the user wants
- Rank by how well the business name, category, and description match the search intent
- If nothing is relevant at all, return []

Businesses:
${JSON.stringify(minimalList)}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content?.[0]?.type === "text" ? response.content[0].text : "";
    const rawText = text.trim();

    // Extract JSON array robustly
    const start = rawText.indexOf('[');
    const end = rawText.lastIndexOf(']');
    let rankedIds: string[] = [];
    if (start !== -1 && end !== -1) {
      rankedIds = JSON.parse(rawText.slice(start, end + 1));
    }

    // Build map for fast lookup
    const businessMap = Object.fromEntries(candidatePool.map((b: any) => [b.id, b]));

    // Return in Claude's ranked order, with VIP/featured bubbled up
    const matched = rankedIds
      .filter((id: string) => businessMap[id])
      .map((id: string) => businessMap[id]);

    matched.sort((a: any, b: any) => {
      if (a.is_vip !== b.is_vip) return (b.is_vip ? 1 : 0) - (a.is_vip ? 1 : 0);
      if (a.is_featured !== b.is_featured) return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      return rankedIds.indexOf(a.id) - rankedIds.indexOf(b.id);
    });

    return Response.json({
      query,
      cleanedQuery: effectiveQuery,
      wantsOpenNow,
      businesses: matched.map(serializeBusiness),
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});