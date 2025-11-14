import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function ReviewsTab({ business }) {
  // Fetch reviews for this business
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["businessOwnerReviews", business.id],
    queryFn: async () => {
      const allReviews = await base44.entities.Review.list();
      return allReviews
        .filter(r => r.business_id === business.id)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div
                  key={review.id}
                  className={`p-4 rounded-lg border ${
                    review.is_approved
                      ? "bg-white border-gray-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  {/* Review Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {format(new Date(review.created_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    {review.is_approved ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Approved
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        Pending Approval
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-700 whitespace-pre-line mb-2">{review.body}</p>

                  {/* Visit Date */}
                  {review.visit_date && (
                    <p className="text-xs text-gray-500">
                      Visit date: {format(new Date(review.visit_date), "MMM d, yyyy")}
                    </p>
                  )}

                  {/* Admin Notes */}
                  {review.admin_notes && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Admin Note:</p>
                      <p className="text-sm text-blue-800">{review.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>No reviews yet</p>
              <p className="text-sm mt-1">Reviews will appear here once customers start reviewing your business</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}