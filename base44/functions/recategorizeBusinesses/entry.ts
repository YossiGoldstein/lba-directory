import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Fetch all categories
    const categories = await base44.asServiceRole.entities.Category.list();
    const activeCategories = categories.filter(c => c.is_active);

    // Fetch all businesses
    const businesses = await base44.asServiceRole.entities.Business.list();
    
    const results = {
      total: businesses.length,
      updated: 0,
      skipped: 0,
      errors: [],
      details: []
    };

    // Process businesses in batches
    for (const business of businesses) {
      try {
        // Skip if no description
        if (!business.business_name && !business.short_description && !business.long_description) {
          results.skipped++;
          continue;
        }

        // Prepare business info for AI
        const businessInfo = `
Business Name: ${business.business_name || 'Unknown'}
Description: ${business.short_description || business.long_description || 'No description'}
Tags: ${(business.tags || []).join(', ')}
        `.trim();

        // Prepare categories list
        const categoriesList = activeCategories.map(c => 
          `- ${c.name} (${c.slug}): ${c.description}`
        ).join('\n');

        // Call AI to determine correct category
        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a business categorization expert. Given the following business information and available categories, determine the MOST appropriate category.

Business Information:
${businessInfo}

Available Categories:
${categoriesList}

Return ONLY the category slug (e.g., "food", "services", "apparel", etc.) that best matches this business. Return exactly one word - the slug only, nothing else.`,
          response_json_schema: {
            type: "object",
            properties: {
              category_slug: {
                type: "string",
                description: "The most appropriate category slug"
              }
            },
            required: ["category_slug"]
          }
        });

        const suggestedSlug = aiResponse.category_slug;
        const targetCategory = activeCategories.find(c => c.slug === suggestedSlug);

        if (!targetCategory) {
          results.errors.push({
            business_id: business.id,
            business_name: business.business_name,
            error: `AI suggested invalid category: ${suggestedSlug}`
          });
          continue;
        }

        // Update business category if different
        if (business.category_id !== targetCategory.id) {
          await base44.asServiceRole.entities.Business.update(business.id, {
            category_id: targetCategory.id
          });

          results.updated++;
          results.details.push({
            business_id: business.id,
            business_name: business.business_name,
            old_category: business.category_id,
            new_category: targetCategory.id,
            new_category_name: targetCategory.name
          });
        } else {
          results.skipped++;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.errors.push({
          business_id: business.id,
          business_name: business.business_name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Recategorization complete: ${results.updated} updated, ${results.skipped} skipped, ${results.errors.length} errors`,
      results
    });

  } catch (error) {
    console.error('Recategorization failed:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});
