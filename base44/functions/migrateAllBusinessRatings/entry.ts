import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    const __ADMIN_SECRET = Deno.env.get("ADMIN_TASK_SECRET");
    if (!__ADMIN_SECRET || req.headers.get("x-admin-secret") !== __ADMIN_SECRET) {
      return Response.json({ error: "This migration endpoint is disabled. Set the ADMIN_TASK_SECRET env var and pass it as the 'x-admin-secret' request header to run it." }, { status: 403 });
    }
    try {
        const base44 = createClientFromRequest(req);
        
        // Check if user is admin
        // Get all businesses and reviews
        const [businesses, reviews] = await Promise.all([
            base44.asServiceRole.entities.Business.list(),
            base44.asServiceRole.entities.Review.list()
        ]);

        const updatedCount = [];

        for (const business of businesses) {
            // Get approved reviews for this business
            const businessReviews = reviews.filter(r => 
                r.business_id === business.id && r.is_approved
            );

            if (businessReviews.length === 0) {
                // No reviews - set everything to 0
                await base44.asServiceRole.entities.Business.update(business.id, {
                    general_rating: 0,
                    servicing_rating: 0,
                    pricing_rating: 0,
                    reviews_count: 0
                });
            } else {
                // Calculate averages
                const generalSum = businessReviews.reduce((sum, r) => sum + (r.general_rating || 0), 0);
                const servicingSum = businessReviews.reduce((sum, r) => sum + (r.servicing_rating || 0), 0);
                const pricingSum = businessReviews.reduce((sum, r) => sum + (r.pricing_rating || 0), 0);

                const count = businessReviews.length;
                const generalAvg = Math.round((generalSum / count) * 10) / 10;
                const servicingAvg = Math.round((servicingSum / count) * 10) / 10;
                const pricingAvg = Math.round((pricingSum / count) * 10) / 10;

                await base44.asServiceRole.entities.Business.update(business.id, {
                    general_rating: generalAvg,
                    servicing_rating: servicingAvg,
                    pricing_rating: pricingAvg,
                    reviews_count: count
                });

                updatedCount.push({
                    business_name: business.business_name,
                    reviews_count: count,
                    ratings: { generalAvg, servicingAvg, pricingAvg }
                });
            }
        }

        return Response.json({
            success: true,
            message: `Updated ${businesses.length} businesses`,
            businesses_with_reviews: updatedCount
        });

    } catch (error) {
        console.error('Migration error:', error);
        return Response.json({ 
            error: error.message || 'Migration failed' 
        }, { status: 500 });
    }
});
