import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function MyReviewsTab({ user }) {
  // Fetch user's reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["myReviews", user?.id],
    queryFn: async () => {
      const allReviews = await base44.entities.Review.list();
      return allReviews
        .filter(r => r.user_id === user.id)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.id,
  });

  // Fetch all businesses
  const { data: allBusinesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const biz = await base44.entities.Business.list();
      return biz.filter(b => b.status === "approved");
    },
  });

  const getBusinessById = (businessId) => {
    return allBusinesses.find(b => b.id === businessId);
  };

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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't written any reviews yet. You can review any business you visit to help others in the community.
          </p>
          <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
            <Link to={createPageUrl("Home")}>
              Explore Businesses
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
      </h3>

      {reviews.map((review) => {
        const business = getBusinessById(review.business_id);
        
        return (
          <Card key={review.id}>
            <CardContent className="p-6">
              {/* Business Header */}
              {business && (
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex-1">
                    <Link
                      to={createPageUrl(`BusinessListing?id=${business.id}`)}
                      className="text-lg font-semibold text-gray-900 hover:text-cyan-600 transition-colors flex items-center gap-2"
                    >
                      {business.business_name}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    {business.city && (
                      <p className="text-sm text-gray-600">{business.city}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Review Content */}
              <div className="space-y-3">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {review.rating}.0
                  </span>
                </div>

                {/* Title */}
                {review.title && (
                  <h4 className="font-semibold text-gray-900">{review.title}</h4>
                )}

                {/* Body */}
                <p className="text-gray-700 whitespace-pre-line">{review.body}</p>

                {/* Visit Date */}
                {review.visit_date && (
                  <p className="text-sm text-gray-500">
                    Visit date: {format(new Date(review.visit_date), "MMM d, yyyy")}
                  </p>
                )}

                {/* Review Date & Status */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Posted on {format(new Date(review.created_date), "MMM d, yyyy")}
                  </p>
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
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}