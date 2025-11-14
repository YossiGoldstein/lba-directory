import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default function ReviewCard({ review, userName = "Anonymous" }) {
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
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-cyan-600" />
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{userName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(review.created_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
            )}

            {/* Body */}
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {review.body}
            </p>

            {/* Visit Date */}
            {review.visit_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Visited on {format(new Date(review.visit_date), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}