import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

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

function formatBusinessForClaude(b, index) {
  const delivery = getDeliveryOptions(b);
  const address = [b.address_line1, b.address_line2, b.city, b.state, b.zip_code].filter(Boolean).join(', ');
  const lines = [
    `${index + 1}. **${b.business_name}**`,
    b.short_description ? `   Description: ${b.short_description}` : null,
    b.long_description ? `   Details: ${b.long_description.slice(0, 300)}` : null,
    address ? `   Address: ${address}` : null,
    b.phone ? `   Phone: ${b.phone}` : null,
    b.whatsapp_number ? `   WhatsApp: ${b.whatsapp_number}` : null,
    b.email ? `   Email: ${b.email}` : null,
    b.website_url ? `   Website: ${b.website_url}` : null,
    b.by_appointment_only ? `   Hours: By appointment only` : (b.opening_hours_text ? `   Hours: ${b.opening_hours_text}` : null),
    delivery.length > 0 ? `   Delivery: Available on ${delivery.join(', ')}` : null,
    b.general_rating ? `   Rating: ${b.general_rating}/5` : null,
    b.tags && b.tags.length > 0 ? `   Tags: ${b.tags.join(', ')}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, conversationHistory } = await req.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Fetch all approved businesses
    const allBusinesses = await base44.asServiceRole.entities.Business.list();
    const approved = allBusinesses.filter(b => b.status === 'approved');

    // Strip "open now" type phrases so they don't confuse keyword search
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
        ].filter(Boolean).join(' ').toLowerCase();

        // Check delivery platforms too
        const deliveryText = [
          b.doordash_url ? 'doordash delivery' : '',
          b.uber_eats_url ? 'uber eats delivery' : '',
          b.grubhub_url ? 'grubhub delivery' : '',
          b.instacart_url ? 'instacart delivery' : '',
          b.by_appointment_only ? 'appointment' : '',
        ].join(' ');

        const fullText = `${searchText} ${deliveryText}`;
        return keywords.some(kw => fullText.includes(kw));
      });

      // Sort: VIP → featured → rank → rating
      matchedBusinesses.sort((a, b) => {
        if (a.is_vip !== b.is_vip) return (b.is_vip ? 1 : 0) - (a.is_vip ? 1 : 0);
        if (a.is_featured !== b.is_featured) return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        if ((b.listing_rank || 0) !== (a.listing_rank || 0)) return (b.listing_rank || 0) - (a.listing_rank || 0);
        return (b.general_rating || 0) - (a.general_rating || 0);
      });
    }

    // Give Claude a larger pool to work with (up to 20 candidates)
    const candidateBusinesses = matchedBusinesses.slice(0, 20);

    // Build Claude context — include all candidates
    const businessContext = candidateBusinesses.length > 0
      ? candidateBusinesses.map((b, i) => formatBusinessForClaude(b, i)).join('\n\n')
      : 'No matching businesses found in the LBA Directory for this query.';

    const systemPrompt = `You are the LBA Directory Assistant for the Lakewood, NJ area (also serving Toms River, Jackson, Brick, Howell, Manchester).

CRITICAL: You MUST respond with ONLY a raw JSON object — no markdown, no code fences, no extra text before or after. Just the JSON.

Format:
{"selected_ids":["id1","id2"],"reply":"Your message"}

Your job:
1. From the businesses list, select ONLY those that genuinely match what the user is looking for
2. If user asks for "pizza" — only return pizza shops/restaurants
3. If user asks for "open now" — check the opening hours and current time (Eastern Time, ${new Date().toLocaleString('en-US', {timeZone:'America/New_York'})}) and only return businesses that are currently open
4. If nothing matches, return {"selected_ids":[],"reply":"I couldn't find any matching businesses..."}
5. NEVER include businesses that don't match the query type/category`;

    const messages = [];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-8).forEach(msg => {
        if ((msg.role === 'user' || msg.role === 'assistant') && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    // Include business IDs in the context so Claude can reference them
    const contextWithIds = candidateBusinesses.length > 0
      ? candidateBusinesses.map((b, i) => `[ID: ${b.id}]\n${formatBusinessForClaude(b, i)}`).join('\n\n')
      : 'No matching businesses found in the LBA Directory for this query.';

    messages.push({
      role: "user",
      content: `User's question: "${query}"\n\nAvailable businesses from the LBA Directory:\n${contextWithIds}`
    });

    const claudeResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      system: systemPrompt,
      messages,
    });

    let aiReply = '';
    let selectedIds = [];

    const rawText = claudeResponse.content[0].text.trim();
    try {
      // Extract JSON — find first { and last }
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      const jsonStr = rawText.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr);
      aiReply = parsed.reply || '';
      selectedIds = parsed.selected_ids || [];
    } catch {
      // Claude didn't return valid JSON — show message, return no businesses
      aiReply = "I couldn't process the search results. Please try again.";
      selectedIds = [];
    }

    // Filter to only businesses Claude selected
    const selectedBusinesses = candidateBusinesses.filter(b => selectedIds.includes(b.id));

    return Response.json({
      query,
      businesses: selectedBusinesses.map(b => ({
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
        by_appointment_only: b.by_appointment_only,
        general_rating: b.general_rating,
        reviews_count: b.reviews_count,
        is_vip: b.is_vip,
        is_featured: b.is_featured,
        logo_url: b.logo_url,
        delivery_options: getDeliveryOptions(b),
        doordash_url: b.doordash_url,
        uber_eats_url: b.uber_eats_url,
        grubhub_url: b.grubhub_url,
        instacart_url: b.instacart_url,
        postmates_url: b.postmates_url,
        toast_url: b.toast_url,
        k1_url: b.k1_url,
      })),
      aiReply,
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});