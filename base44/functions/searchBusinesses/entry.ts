import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get approved businesses
    const allBusinesses = await base44.asServiceRole.entities.Business.list();
    const approved = allBusinesses.filter(b => b.status === 'approved');
    
    // Search in name, description, tags, AI tags
    const searchLower = query.toLowerCase();
    const results = approved.filter(b => {
      const name = (b.business_name || '').toLowerCase();
      const desc = (b.short_description || '').toLowerCase();
      const longDesc = (b.long_description || '').toLowerCase();
      const tags = (b.tags || []).map(t => t.toLowerCase()).join(' ');
      const aiTags = (b.ai_tags || []).map(t => t.toLowerCase()).join(' ');
      
      return (
        name.includes(searchLower) ||
        desc.includes(searchLower) ||
        longDesc.includes(searchLower) ||
        tags.includes(searchLower) ||
        aiTags.includes(searchLower)
      );
    });

    // Sort by VIP, rank, featured
    results.sort((a, b) => {
      if (a.is_vip !== b.is_vip) return b.is_vip - a.is_vip;
      if (a.is_featured !== b.is_featured) return b.is_featured - a.is_featured;
      if (a.listing_rank !== b.listing_rank) return b.listing_rank - a.listing_rank;
      return 0;
    });

    // Return top 5 results
    return Response.json({
      query,
      count: results.length,
      businesses: results.slice(0, 5).map(b => ({
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
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});