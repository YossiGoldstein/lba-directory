import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, MessageSquare, Eye, Heart, Sparkles, TrendingUp, Crown, Zap, Link2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function OverviewTab({ business, deals = [] }) {
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

  // Use deals passed from parent
  const activeDeals = deals.filter(deal => {
    if (!deal.is_active) return false;
    const now = new Date();
    const start = new Date(deal.start_date);
    const end = new Date(deal.end_date);
    return start <= now && end >= now;
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



  const getShareUrl = () => {
    const identifier = business.slug
      ? `slug=${business.slug}`
      : `id=${business.id}`;
    return `https://www.lbadirectory.com/functions/b?${identifier}`;
  };

  const handleCopyShareLink = async () => {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleWhatsAppShare = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://wa.me/?text=${url}`, "_blank");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Share Link Card */}
      <Card className="border-cyan-200 bg-cyan-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="w-4 h-4 text-cyan-600" />
                <h3 className="font-semibold text-gray-900">Share Your Business</h3>
              </div>
              <p className="text-xs text-gray-500">Share this link on WhatsApp, Facebook, or anywhere — it will show your business name, logo, and description as a preview.</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button onClick={handleCopyShareLink} variant="outline" size="sm" className="gap-1.5 border-cyan-400 text-cyan-700 hover:bg-cyan-100">
                <Link2 className="w-4 h-4" />
                Copy Share Link
              </Button>
              <Button onClick={handleWhatsAppShare} size="sm" className="gap-1.5 bg-green-500 hover:bg-green-600 text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="business-info" className="bg-white rounded-lg border">
          <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold">Business Information</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6 pb-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Business Name</p>
                  <p className="font-semibold text-sm sm:text-base">{business.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-sm sm:text-base break-all">{business.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-semibold text-sm sm:text-base">{business.phone}</p>
                </div>
                {business.website_url && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Website</p>
                    <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm sm:text-base text-cyan-600 hover:underline break-all">
                      {business.website_url}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-sm sm:text-base">
                    {business.address_line1}
                    {business.address_line2 && `, ${business.address_line2}`}
                    <br />
                    {business.city}, {business.state} {business.zip_code}
                  </p>
                </div>
                {business.opening_hours_text && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hours</p>
                    <p className="font-semibold text-sm sm:text-base whitespace-pre-line">{business.opening_hours_text}</p>
                  </div>
                )}
              </div>
              {business.short_description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Short Description</p>
                  <p className="text-gray-700 text-sm sm:text-base">{business.short_description}</p>
                </div>
              )}
              {business.long_description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Description</p>
                  <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line">{business.long_description}</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {business.general_rating > 0 ? business.general_rating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-gray-600">Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{business.reviews_count || 0}</p>
              <p className="text-xs text-gray-600">Reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{business.views_count || 0}</p>
              <p className="text-xs text-gray-600">Views</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{business.clicks_to_website || 0}</p>
              <p className="text-xs text-gray-600">Website</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{business.clicks_to_phone || 0}</p>
              <p className="text-xs text-gray-600">Calls</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{favoritesCount}</p>
              <p className="text-xs text-gray-600">Favorites</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deals */}
      {activeDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeDeals.map(deal => (
                <div key={deal.id} className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{deal.title}</h4>
                      {deal.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{deal.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Valid until {format(new Date(deal.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    {deal.badge_text && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full whitespace-nowrap">
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
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {renderStars(review.general_rating || review.rating)}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {format(new Date(review.created_date), "MMM d, yyyy")}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{review.title}</h4>
                  )}
                  <p className="text-gray-700 text-xs sm:text-sm line-clamp-3">{review.body || "Great service!"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm sm:text-base">No reviews yet</p>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}