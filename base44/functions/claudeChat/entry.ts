import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Anthropic from 'npm:@anthropic-ai/sdk';

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

function formatBusiness(b) {
  const address = [b.address_line1, b.city, b.state].filter(Boolean).join(', ');
  const mapsLink = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
  const phone = b.phone ? b.phone.replace(/\D/g, '') : null;
  const whatsapp = b.whatsapp_number ? b.whatsapp_number.replace(/\D/g, '') : null;
  const delivery = getDeliveryOptions(b);
  const hours = b.by_appointment_only ? 'By appointment only' : (b.opening_hours_text || null);
  // Combine tags for keyword matching, keep description short
  const keywords = [...(b.tags || []), ...(b.ai_tags || [])].join(', ');

  return [
    `Name: ${b.business_name}`,
    mapsLink ? `Address: ${address} | Maps: ${mapsLink}` : null,
    phone ? `Phone: ${b.phone} | tel:+1${phone}` : null,
    whatsapp ? `WhatsApp: ${b.whatsapp_number} | https://wa.me/1${whatsapp}` : null,
    b.website_url ? `Website: ${b.website_url}` : null,
    hours ? `Hours: ${hours}` : null,
    b.short_description ? `Desc: ${b.short_description.slice(0, 150)}` : null,
    delivery.length > 0 ? `Delivery: ${delivery.join(', ')}` : null,
    keywords ? `Tags: ${keywords}` : null,
  ].filter(Boolean).join('\n');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    // Fetch all approved businesses
    const allBusinesses = await base44.asServiceRole.entities.Business.list();
    const approved = allBusinesses.filter(b => b.status === 'approved');
    const businessCatalog = approved.map(formatBusiness).join('\n\n');

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

RESPONSE FORMAT — use this exact structure for EVERY business result:

🏪 **[Business Name]**
📍 [Address as a Markdown link to Google Maps]
📞 [Phone as a tel: Markdown link]
💬 [WhatsApp as a wa.me Markdown link]
🌐 [Website as a Markdown link]
🕐 Hours: [Opening Hours]
📝 [Short Description]

---

FORMATTING RULES:
- Format address as: [Address](https://www.google.com/maps/search/?api=1&query=ENCODED_ADDRESS)
- Format phone as: [Phone Number](tel:+1PHONEDIGITS)
- Format WhatsApp as: [WhatsApp](https://wa.me/1WHATSAPPDIGITS)
- Format website as: [Website URL](website_url)
- If a field is missing, skip that line entirely — do NOT write "Not available" or "N/A"
- Separate each business result with a --- divider
- Keep tone friendly and helpful

--- LBA DIRECTORY (${approved.length} businesses) ---
${businessCatalog}
--- END OF DIRECTORY ---`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
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