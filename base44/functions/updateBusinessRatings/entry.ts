import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { businessId } = await req.json();

        if (!businessId) {
            return Response.json({ error: 'Business ID is required' }, { status: 400 });
        }

        // Get all approved reviews for this business
        const reviews = await base44.asServiceRole.entities.Review.list();
        const businessReviews = reviews.filter(r => 
            r.business_id === businessId && r.is_approved
        );

        if (businessReviews.length === 0) {
            // No reviews - set everything to 0
            await base44.asServiceRole.entities.Business.update(businessId, {
                general_rating: 0,
                servicing_rating: 0,
                pricing_rating: 0,
                reviews_count: 0
            });
            return Response.json({ success: true, reviews_count: 0 });
        }

        // Calculate averages
        const generalSum = businessReviews.reduce((sum, r) => sum + (r.general_rating || 0), 0);
        const servicingSum = businessReviews.reduce((sum, r) => sum + (r.servicing_rating || 0), 0);
        const pricingSum = businessReviews.reduce((sum, r) => sum + (r.pricing_rating || 0), 0);

        const count = businessReviews.length;
        const generalAvg = Math.round((generalSum / count) * 10) / 10;
        const servicingAvg = Math.round((servicingSum / count) * 10) / 10;
        const pricingAvg = Math.round((pricingSum / count) * 10) / 10;

        // Update business with new ratings
        await base44.asServiceRole.entities.Business.update(businessId, {
            general_rating: generalAvg,
            servicing_rating: servicingAvg,
            pricing_rating: pricingAvg,
            reviews_count: count
        });

        return Response.json({
            success: true,
            reviews_count: count,
            general_rating: generalAvg,
            servicing_rating: servicingAvg,
            pricing_rating: pricingAvg
        });

    } catch (error) {
        console.error('Error updating business ratings:', error);
        return Response.json({ 
            error: error.message || 'Failed to update ratings' 
        }, { status: 500 });
    }
});