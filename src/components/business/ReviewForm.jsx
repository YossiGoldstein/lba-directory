import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";

export default function ReviewForm({ businessId, onReviewSubmitted }) {
  const [generalRating, setGeneralRating] = useState(0);
  const [servicingRating, setServicingRating] = useState(0);
  const [pricingRating, setPricingRating] = useState(0);
  const [hoveredGeneral, setHoveredGeneral] = useState(0);
  const [hoveredServicing, setHoveredServicing] = useState(0);
  const [hoveredPricing, setHoveredPricing] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (generalRating === 0 || servicingRating === 0 || pricingRating === 0) {
      toast.error("Please rate all three categories");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get customer from localStorage
      const customerData = localStorage.getItem("lba_customer");
      if (!customerData) {
        toast.error("Please sign in to submit a review");
        return;
      }
      
      const customer = JSON.parse(customerData);
      
      const avgRating = Math.round((generalRating + servicingRating + pricingRating) / 3);
      // Do NOT set is_approved here — new reviews must stay unapproved until an
      // admin moderates them. Only is_approved:true reviews are shown publicly.
      await base44.entities.Review.create({
        business_id: businessId,
        user_id: customer.id,
        rating: avgRating,
        general_rating: generalRating,
        servicing_rating: servicingRating,
        pricing_rating: pricingRating,
      });

      // Update business ratings
      await base44.functions.invoke('updateBusinessRatings', { businessId });

      toast.success("Review submitted successfully!");
      
      // Reset form
      setGeneralRating(0);
      setServicingRating(0);
      setPricingRating(0);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingRow = ({ label, rating, setRating, hovered, setHovered }) => (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 w-32">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hovered || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <RatingRow
          label="General"
          rating={generalRating}
          setRating={setGeneralRating}
          hovered={hoveredGeneral}
          setHovered={setHoveredGeneral}
        />
        <RatingRow
          label="Servicing"
          rating={servicingRating}
          setRating={setServicingRating}
          hovered={hoveredServicing}
          setHovered={setHoveredServicing}
        />
        <RatingRow
          label="Pricing"
          rating={pricingRating}
          setRating={setPricingRating}
          hovered={hoveredPricing}
          setHovered={setHoveredPricing}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-cyan-600 hover:bg-cyan-700 w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}