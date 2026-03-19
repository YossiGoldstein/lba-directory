import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, conversationHistory } = await req.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get approved businesses
    const allBusinesses = await base44.asServiceRole.entities.Business.list();
    const approved = allBusinesses.filter(b => b.status === 'approved');

    // Extract keywords for search
    const stopWords = new Set(['im', 'i', 'a', 'an', 'the', 'to', 'for', 'and', 'or', 'is', 'are', 'am', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'in', 'on', 'at', 'by', 'with', 'from', 'of', 'as', 'about', 'into', 'through', 'during', 'looking', 'buy', 'find', 'search', 'need', 'want', 'get', 'help', 'show', 'me', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'where', 'when', 'why', 'how']);
    const keywords = query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    let matchedBusinesses = [];

    if (keywords.length > 0) {
      matchedBusinesses = approved.filter(b => {
        const name = (b.business_name || '').toLowerCase();
        const desc = (b.short_description || '').toLowerCase();
        const longDesc = (b.long_description || '').toLowerCase();
        const tags = (b.tags || []).map(t => t.toLowerCase()).join(' ');
        const aiTags = (b.ai_tags || []).map(t => t.toLowerCase()).join(' ');
        const category = (b.category_id || '').toLowerCase();
        const allText = `${name} ${desc} ${longDesc} ${tags} ${aiTags} ${category}`;
        return keywords.some(keyword => allText.includes(keyword));
      });

      // Sort by VIP, featured, rank
      matchedBusinesses.sort((a, b) => {
        if (a.is_vip !== b.is_vip) return b.is_vip - a.is_vip;
        if (a.is_featured !== b.is_featured) return b.is_featured - a.is_featured;
        return (b.listing_rank || 0) - (a.listing_rank || 0);
      });
    }

    const topBusinesses = matchedBusinesses.slice(0, 5);

    // Build Claude prompt
    const businessContext = topBusinesses.length > 0
      ? topBusinesses.map((b, i) =>
          `${i + 1}. **${b.business_name}** - ${b.short_description || 'No description'} | ${b.city || ''}, ${b.state || ''} | Phone: ${b.phone || 'N/A'} | Rating: ${b.general_rating || 'N/A'}`
        ).join('\n')
      : "No matching businesses found in the directory.";

    const systemPrompt = `You are LBA Directory Assistant, a helpful AI that helps people find local businesses in the Lakewood, NJ area (also serving Toms River, Jackson, Brick, Howell, Manchester).

Your job is to answer users' questions naturally and present relevant businesses from the directory.

Guidelines:
- Be friendly, concise, and helpful
- When businesses are found, present them clearly and mention key details (name, what they do, location, phone)
- If no businesses match, suggest the user try different keywords or contact LBA Directory directly
- Keep responses short and to the point
- Respond in the same language the user writes in (English or Hebrew)`;

    const messages = [];

    // Include conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    messages.push({
      role: "user",
      content: `User query: "${query}"\n\nRelevant businesses from directory:\n${businessContext}\n\nPlease provide a helpful response based on the user's query and the businesses above.`
    });

    const claudeResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const aiReply = claudeResponse.content[0].text;

    return Response.json({
      query,
      businesses: topBusinesses.map(b => ({
        id: b.id,
        business_name: b.business_name,
        short_description: b.short_description,
        address_line1: b.address_line1,
        city: b.city,
        state: b.state,
        zip_code: b.zip_code,
        phone: b.phone,
        opening_hours_text: b.opening_hours_text,
        is_vip: b.is_vip,
        general_rating: b.general_rating,
        logo_url: b.logo_url,
      })),
      aiReply,
    });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});