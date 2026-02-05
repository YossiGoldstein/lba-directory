import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Eye, Heart, Sparkles, TrendingUp, Crown, Zap } from "lucide-react";
import { format } from "date-fns";

export default function OverviewTab({ business, onSwitchTab }) {
  // Fetch reviews for this business
  const { data: reviews = [] } = useQuery({
    queryKey: ["businessReviews", business.id],
    queryFn: async () => {
      const allReviews = await base44.entities.Review.list();
      return allReviews
        .filter(r => r.business_id === business.id && r.is_approved)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  // Fetch deals for this business
  const { data: deals = [] } = useQuery({
    queryKey: ["businessDeals", business.id],
    queryFn: async () => {
      const allDeals = await base44.entities.Deal.list();
      const now = new Date();
      return allDeals.filter(deal => {
        if (deal.business_id !== business.id || !deal.is_active) return false;
        const start = new Date(deal.start_date);
        const end = new Date(deal.end_date);
        return start <= now && end >= now;
      });
    },
  });

  // Fetch favorites count
  const { data: favoritesCount = 0 } = useQuery({
    queryKey: ["businessFavorites", business.id],
    queryFn: async () => {
      const allFavorites = await base44.entities.Favorite.list();
      return allFavorites.filter(f => f.business_id === business.id).length;
    },
  });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const handleAskAI = () => {
    onSwitchTab("ai-assistant");
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {business.general_rating > 0 ? business.general_rating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-gray-600">Average Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{business.reviews_count || 0}</p>
              <p className="text-xs text-gray-600">Reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{business.views_count || 0}</p>
              <p className="text-xs text-gray-600">Profile Views</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{business.clicks_to_website || 0}</p>
              <p className="text-xs text-gray-600">Website Clicks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{business.clicks_to_phone || 0}</p>
              <p className="text-xs text-gray-600">Phone Clicks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{favoritesCount}</p>
              <p className="text-xs text-gray-600">Favorites</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deals */}
      {deals.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Active Deals
              </CardTitle>
              <Button
                onClick={() => onSwitchTab("deals")}
                variant="ghost"
                size="sm"
              >
                Manage Deals
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deals.slice(0, 3).map(deal => (
                <div key={deal.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                      {deal.description && (
                        <p className="text-sm text-gray-600 mt-1">{deal.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Valid until {format(new Date(deal.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    {deal.badge_text && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                        {deal.badge_text}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Reviews
            </CardTitle>
            <Button
              onClick={() => onSwitchTab("reviews")}
              variant="ghost"
              size="sm"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.slice(0, 3).map(review => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {format(new Date(review.created_date), "MMM d, yyyy")}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                  )}
                  <p className="text-gray-700 text-sm line-clamp-2">{review.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>No reviews yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Plan & Upgrade */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Current Plan: {business.listing_tier === 'free' ? 'Free' : business.listing_tier === 'pro' ? 'Pro' : business.listing_tier === 'premium' ? 'Premium' : 'Free'}
              </h3>
              <p className="text-gray-600">
                {business.listing_tier === 'free' 
                  ? 'Upgrade to Pro or Premium for more features and visibility' 
                  : business.listing_tier === 'pro'
                  ? 'Upgrade to Premium for maximum visibility and advanced features'
                  : 'You have access to all premium features!'}
              </p>
            </div>
            {business.listing_tier !== 'premium' && (
              <Button
                onClick={() => window.location.href = `/add-business?upgrade=${business.id}`}
                className="bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <Zap className="w-4 h-4" />
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Optimization CTA */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Get AI-Powered Optimization Tips
              </h3>
              <p className="text-gray-600">
                Ask our AI assistant for suggestions to improve your listing and attract more customers
              </p>
            </div>
            <Button
              onClick={handleAskAI}
              className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI for Advice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}