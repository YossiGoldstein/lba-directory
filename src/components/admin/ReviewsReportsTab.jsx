import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, EyeOff, Flag } from "lucide-react";
import { toast } from "sonner";

export default function ReviewsReportsTab() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("reviews");

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const reviewList = await base44.entities.Review.list();
      return reviewList.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      return await base44.entities.Business.list();
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return await base44.entities.Customer.list();
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }) => {
      return await base44.entities.Review.update(reviewId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update review");
    }
  });

  const getBusinessName = (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    return business ? business.business_name : "Unknown Business";
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : "Anonymous";
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleToggleApproval = (review) => {
    updateReviewMutation.mutate({
      reviewId: review.id,
      data: { is_approved: !review.is_approved }
    });
  };

  const handleToggleFlag = (review) => {
    updateReviewMutation.mutate({
      reviewId: review.id,
      data: { reported: !review.reported }
    });
  };

  if (reviewsLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Reports Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setSelectedTab("reviews")}
              className={`pb-2 px-4 font-medium ${
                selectedTab === "reviews"
                  ? "border-b-2 border-cyan-600 text-cyan-600"
                  : "text-gray-600"
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setSelectedTab("flagged")}
              className={`pb-2 px-4 font-medium ${
                selectedTab === "flagged"
                  ? "border-b-2 border-cyan-600 text-cyan-600"
                  : "text-gray-600"
              }`}
            >
              Flagged ({reviews.filter(r => r.reported).length})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews
          .filter(review => selectedTab === "reviews" || (selectedTab === "flagged" && review.reported))
          .map((review) => (
            <Card key={review.id} className={review.reported ? "border-l-4 border-l-red-500" : ""}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {getBusinessName(review.business_id)}
                        </h4>
                        <div className="flex gap-1">
                          {renderStars(review.general_rating || review.rating || 0)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        By: {getUserName(review.user_id)} • {new Date(review.created_date).toLocaleDateString()}
                      </p>
                      {review.visit_date && (
                        <p className="text-xs text-gray-500">
                          Visit date: {new Date(review.visit_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {review.is_approved ? (
                        <Badge className="bg-green-500">Visible</Badge>
                      ) : (
                        <Badge className="bg-gray-500">Hidden</Badge>
                      )}
                      {review.reported && (
                        <Badge className="bg-red-500">Flagged</Badge>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  {review.title && (
                    <h5 className="font-medium text-gray-900">{review.title}</h5>
                  )}
                  <p className="text-gray-700">{review.body}</p>

                  {/* Admin Notes */}
                  {review.admin_notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-900 mb-1">Admin Notes:</p>
                      <p className="text-sm text-yellow-800">{review.admin_notes}</p>
                    </div>
                  )}

                  {/* AI Sentiment */}
                  {review.ai_sentiment && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">AI Sentiment:</span>
                      <Badge variant="outline">{review.ai_sentiment}</Badge>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant={review.is_approved ? "outline" : "default"}
                      onClick={() => handleToggleApproval(review)}
                      className="gap-2"
                    >
                      {review.is_approved ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Show
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant={review.reported ? "destructive" : "outline"}
                      onClick={() => handleToggleFlag(review)}
                      className="gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      {review.reported ? "Unflag" : "Flag"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {reviews.filter(review => selectedTab === "reviews" || (selectedTab === "flagged" && review.reported)).length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No reviews to display.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}