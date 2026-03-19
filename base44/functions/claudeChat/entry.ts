import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

// Map of intent keywords -> category name fragments to match against
const INTENT_MAP = [
  { keywords: ['food','eat','restaurant','pizza','sushi','meat','chicken','burger','falafel','salad','sandwich','deli','cafe','coffee','bagel','bakery','bread','pastry','cake','catering','dinner','lunch','breakfast','brunch','takeout','delivery','dairy','fleishig','milchig'], topics: ['food','restaurant','pizza','bakery','cafe','catering','deli','sushi','meat','dairy'] },
  { keywords: ['plumber','plumbing','pipe','leak','drain','water','faucet'], topics: ['plumbing','home services'] },
  { keywords: ['electric','electrician','wiring','outlet','panel','generator'], topics: ['electric','home services'] },
  { keywords: ['doctor','medical','health','physician','pediatric','dental','dentist','orthodontist','chiropractor','therapy','therapist','pharmacy','medication'], topics: ['medical','health','dental','pharmacy'] },
  { keywords: ['tutor','school','education','learning','child','kids','camp','hebrew','judaics'], topics: ['education','tutoring','camp'] },
  { keywords: ['lawyer','attorney','legal','law','notary'], topics: ['legal','law'] },
  { keywords: ['accountant','accounting','tax','cpa','finance','financial'], topics: ['accounting','finance','tax'] },
  { keywords: ['real estate','realtor','house','apartment','rent','buy','sell','mortgage'], topics: ['real estate','mortgage'] },
  { keywords: ['car','auto','vehicle','tire','mechanic','repair','oil','engine'], topics: ['auto','car'] },
  { keywords: ['clothing','clothes','fashion','suit','dress','shoes','kids wear','womens','mens'], topics: ['clothing','fashion'] },
  { keywords: ['jewelry','ring','necklace','bracelet','watch','gem','diamond'], topics: ['jewelry'] },
  { keywords: ['grocery','supermarket','market','produce','fruit','vegetable'], topics: ['grocery','supermarket','market'] },
  { keywords: ['pest','exterminator','bug','rodent','mice','rat','termite'], topics: ['pest'] },
  { keywords: ['cleaning','cleaner','maid','laundry','dry cleaning'], topics: ['cleaning','laundry'] },
  { keywords: ['insurance','coverage','policy','life insurance','health insurance'], topics: ['insurance'] },
  { keywords: ['travel','trip','flight','hotel','vacation','tickets'], topics: ['travel'] },
  { keywords: ['gym','fitness','exercise','sport','yoga','pilates'], topics: ['fitness','gym'] },
  { keywords: ['moving','mover','storage','truck'], topics: ['moving','storage'] },
  { keywords: ['photography','photographer','photo','video','videography'], topics: ['photography','video'] },
  { keywords: ['print','printing','design','graphic','sign','banner','flyer'], topics: ['printing','design'] },
  { keywords: ['computer','tech','it','laptop','phone repair','software'], topics: ['computer','technology'] },
];

const STOP_WORDS = new Set(['the','and','for','are','but','not','you','all','can','her','was','one','our','out','get','has','him','his','how','its','who','did','yes','any','had','just','let','about','from','they','this','that','with','have','will','your','what','which','when','here','there','find','need','want','looking','like','good','near','area','open','now','best','where','tell','show','know','some','into','then','than','also','been','such']);

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

function formatBusiness(b) {
  const address = [b.address_line1, b.city].filter(Boolean).join(', ');
  const mapsLink = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
  const phone = b.phone ? b.phone.replace(/\D/g, '') : null;
  const whatsapp = b.whatsapp_number ? b.whatsapp_number.replace(/\D/g, '') : null;
  const hours = b.opening_hours_text || null;

  return [
    `Name: ${b.business_name}`,
    b.slug ? `Profile: https://lbadirectory.com/businesses/${b.slug}` : null,
    mapsLink ? `Address: ${address} | Maps: ${mapsLink}` : null,
    phone ? `Phone: ${b.phone} | tel:+1${phone}` : null,
    whatsapp ? `WhatsApp: ${b.whatsapp_number} | https://wa.me/1${whatsapp}` : null,
    b.website_url ? `Website: ${b.website_url}` : null,
    hours ? `Hours: ${hours}` : null,
    b.short_description ? `Desc: ${b.short_description.slice(0, 120)}` : null,
  ].filter(Boolean).join('\n');
}

// Detect intent topics from user query
function getIntentTopics(queryText) {
  const words = queryText.toLowerCase().split(/\s+/);
  const matched = new Set();
  for (const { keywords, topics } of INTENT_MAP) {
    if (keywords.some(k => queryText.includes(k))) {
      topics.forEach(t => matched.add(t));
    }
  }
  return [...matched];
}

// Find matching category IDs from category list
function matchCategories(categories, topics) {
  if (topics.length === 0) return [];
  const matched = [];
  for (const cat of categories) {
    const name = (cat.name || '').toLowerCase();
    if (topics.some(t => name.includes(t))) {
      matched.push(cat.id);
    }
  }
  return matched;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    // Extract meaningful keywords from the latest user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const queryText = (lastUserMsg?.content || '').toLowerCase();
    const queryWords = queryText.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

    // Detect intent topics
    const intentTopics = getIntentTopics(queryText);

    // Fetch categories (small, fast) to map intent → category IDs
    const categories = await base44.asServiceRole.entities.Category.filter({ is_active: true });
    const matchedCategoryIds = matchCategories(categories, intentTopics);

    let businesses = [];

    if (matchedCategoryIds.length > 0) {
      // Fetch businesses for matched categories in parallel
      const fetches = matchedCategoryIds.slice(0, 5).map(catId =>
        base44.asServiceRole.entities.Business.filter({ status: 'approved', category_id: catId })
      );
      const results = await Promise.all(fetches);
      // Deduplicate by id
      const seen = new Set();
      for (const batch of results) {
        for (const b of batch) {
          if (!seen.has(b.id)) { seen.add(b.id); businesses.push(b); }
        }
      }
    } else {
      // No clear category match — fetch a broad set (VIPs + recent) and rely on keyword scoring
      businesses = await base44.asServiceRole.entities.Business.filter({ status: 'approved' }, '-listing_rank', 80);
    }

    // Score and rank by keyword relevance
    const scored = businesses.map(b => {
      const haystack = [
        b.business_name, b.short_description,
        ...(b.tags || []), ...(b.ai_tags || [])
      ].join(' ').toLowerCase();
      const score = queryWords.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
      const vipBonus = b.is_vip ? 0.5 : 0;
      return { b, score: score + vipBonus };
    });

    scored.sort((a, b) => b.score - a.score);
    const relevant = scored.slice(0, 15).map(s => s.b);
    const businessCatalog = relevant.map(formatBusiness).join('\n\n');

    const systemPrompt = `You are the LBA Directory Assistant — a friendly, knowledgeable AI that helps people find local businesses in the Lakewood, NJ area (also serving Toms River, Jackson, Brick, Howell, Manchester).

IMPORTANT RULES:
- Always respond in English
- Only use information from the business directory below — never fabricate details
- This directory contains ONLY kosher businesses serving the Orthodox Jewish community in Lakewood, NJ — never ask if the user wants kosher food, everything here is kosher by default
- When a user asks about anything, IMMEDIATELY show the most relevant matching businesses with full details — do NOT ask for clarification first
- Only AFTER showing results, ask ONE single follow-up question to help narrow down further if needed
- Never ask multiple questions at once
- Never ask the user to clarify before showing results — always show something first
- If no matching business is found, say so politely and suggest calling LBA Directory at 732-600-1260
- For small talk, respond briefly and redirect to business discovery
- If the user asks about hours, always show the full opening hours exactly as listed
- If the user greets you, introduce yourself briefly and immediately ask what they are looking for (one question only)
- Always end every response with: "Want me to help you find anything else?"

RESPONSE FORMAT — use this EXACT structure for EVERY business result:

🏪 **[Business Name]**
🔗 [View Profile](https://lbadirectory.com/businesses/SLUG)
📍 [Address](Google Maps link)
📞 [Phone Number](tel:+1DIGITS)
💬 [WhatsApp](https://wa.me/1DIGITS)
🌐 [website url](website url)
🕐 Hours: [Opening Hours]
📝 [Short Description]

---

CRITICAL RULES:
- The 🔗 View Profile link MUST always be the SECOND line, right after the business name — use the exact URL from the Profile field
- Format address as: [Address](https://www.google.com/maps/search/?api=1&query=ENCODED_ADDRESS)
- Format phone as: [Phone Number](tel:+1PHONEDIGITS)
- Format WhatsApp as: [WhatsApp](https://wa.me/1WHATSAPPDIGITS)
- If a field is missing, skip that line entirely — do NOT write "Not available" or "N/A"
- Separate each business result with a --- divider
- Keep tone friendly and helpful

--- LBA DIRECTORY (${relevant.length} relevant businesses) ---
${businessCatalog}
--- END OF DIRECTORY ---`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
      system: systemPrompt,
      messages,
    });

    return Response.json({
      content: response.content[0].text,
      usage: response.usage,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});