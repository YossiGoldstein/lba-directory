import React from "react";
import { Star } from "lucide-react";

export default function ReviewCard({ review }) {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500">
          by {review.created_by || "Anonymous"} • {new Date(review.created_date).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 w-24">General:</span>
          <div className="flex gap-1">
            {renderStars(review.general_rating)}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 w-24">Servicing:</span>
          <div className="flex gap-1">
            {renderStars(review.servicing_rating)}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 w-24">Pricing:</span>
          <div className="flex gap-1">
            {renderStars(review.pricing_rating)}
          </div>
        </div>
      </div>
    </div>
  );
}