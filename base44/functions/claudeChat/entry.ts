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
  const address = [b.address_line1, b.address_line2, b.city, b.state, b.zip_code].filter(Boolean).join(', ');
  const delivery = getDeliveryOptions(b);
  const hours = b.by_appointment_only ? 'By appointment only' : (b.opening_hours_text || 'Not specified');

  return [
    `- Name: ${b.business_name}`,
    b.short_description ? `  Description: ${b.short_description}` : null,
    b.long_description ? `  Details: ${b.long_description.slice(0, 400)}` : null,
    address ? `  Address: ${address}` : null,
    b.phone ? `  Phone: ${b.phone}` : null,
    b.whatsapp_number ? `  WhatsApp: ${b.whatsapp_number}` : null,
    b.email ? `  Email: ${b.email}` : null,
    b.website_url ? `  Website: ${b.website_url}` : null,
    `  Hours: ${hours}`,
    delivery.length > 0 ? `  Delivery: ${delivery.join(', ')}` : null,
    b.general_rating > 0 ? `  Rating: ${b.general_rating}/5` : null,
    b.tags && b.tags.length > 0 ? `  Tags: ${b.tags.join(', ')}` : null,
    b.ai_tags && b.ai_tags.length > 0 ? `  Keywords: ${b.ai_tags.join(', ')}` : null,
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
- When a user asks about a business or service, search the directory and provide full details: name, phone, address, hours, description, appointment info, and delivery options if available
- Be concise and helpful; highlight the most relevant businesses for the user's query
- If no matching business is found, say so politely and suggest calling LBA Directory at 732-600-1260
- For small talk, respond briefly and redirect to business discovery

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