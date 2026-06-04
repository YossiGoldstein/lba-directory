import Anthropic from 'npm:@anthropic-ai/sdk@0.65.0';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

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

function formatBusiness(b, index) {
  const delivery = getDeliveryOptions(b);
  const address = [b.address_line1, b.city, b.state].filter(Boolean).join(', ');
  const lines = [
    `${index + 1}. [ID:${b.id}] ${b.business_name}`,
    b.short_description ? `   ${b.short_description}` : null,
    address ? `   ${address}` : null,
    b.by_appointment_only ? `   Hours: By appointment only` : (b.opening_hours_text ? `   Hours: ${b.opening_hours_text}` : null),
    delivery.length > 0 ? `   Delivery: ${delivery.join(', ')}` : null,
    b.tags?.length ? `   Tags: ${b.tags.join(', ')}` : null,
    b.ai_tags?.length ? `   AI Tags: ${b.ai_tags.join(', ')}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}

Deno.serve(async (req) => {
  try {
    const { query, businesses } = await req.json();

    if (!query || !businesses?.length) {
      return Response.json({ selected_ids: [], aiReply: '' });
    }

    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const context = businesses.map((b, i) => formatBusiness(b, i)).join('\n\n');

    const systemPrompt = `You are an assistant for the LBA Directory (Lakewood, NJ area).
Current time: ${now} Eastern Time.

CRITICAL: Respond with ONLY a raw JSON object, no markdown, no extra text:
{"selected_ids":["id1","id2"],"reply":"Short friendly message"}

Rules:
1. Select ONLY businesses that genuinely match the user's query type/category
2. If "open now" requested — use opening hours + current time to filter
3. If nothing matches, return {"selected_ids":[],"reply":"No matching businesses found. Try different keywords or call 732-600-1260."}
4. Keep reply to 1-2 sentences max`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `Query: "${query}"\n\nBusinesses:\n${context}`
      }],
    });

    const text = response.content?.[0]?.type === "text" ? response.content[0].text : "";
    const rawText = text.trim();
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    const parsed = JSON.parse(rawText.slice(start, end + 1));

    return Response.json({
      selected_ids: parsed.selected_ids || [],
      aiReply: parsed.reply || '',
    });

  } catch (error) {
    console.error('Refine error:', error);
    return Response.json({ selected_ids: [], aiReply: '' });
  }
});