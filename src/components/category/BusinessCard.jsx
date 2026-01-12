import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Tag, Heart, CheckCircle } from "lucide-react";

export default function BusinessCard({ business, categoryName, hasActiveDeals }) {
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

  // Check if business is currently open
  const isBusinessOpen = () => {
    if (!business.opening_hours_json) return null;
    
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const hours = business.opening_hours_json[currentDay];
    
    if (!hours || hours.closed) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const isOpen = isBusinessOpen();

  const coverImage = business.gallery_images && business.gallery_images.length > 0 
    ? business.gallery_images[0] 
    : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop";

  return (
    <Link to={createPageUrl(`BusinessListing?id=${business.id}`)} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
        {/* Cover Image */}
        <div className="relative w-full aspect-[16/9] bg-gray-100">
          <img
            src={coverImage}
            alt={business.business_name}
            className="w-full h-full object-cover"
          />

          {/* Open/Closed Badge - Top Left */}
          {isOpen !== null && (
            <div className="absolute top-2 left-2">
              <Badge className={`${isOpen ? 'bg-green-600' : 'bg-red-600'} text-white text-xs shadow-md font-semibold`}>
                {isOpen ? 'OPEN' : 'CLOSED'}
              </Badge>
            </div>
          )}

          {/* Status Badges - Top Right */}
          <div className="absolute top-2 right-2 flex gap-1">
            {hasActiveDeals && (
              <Badge className="bg-red-600 text-white text-xs shadow-md font-semibold">SALE</Badge>
            )}
            {(business.listing_tier === "pro" || business.listing_tier === "premium") && (
              <Badge className="bg-orange-500 text-white text-xs shadow-md font-semibold">PAID</Badge>
            )}
          </div>
        </div>

        {/* Content Section with Logo Overlap */}
        <div className="relative px-4 pt-8 pb-4">
          {/* Circular Logo - Positioned to overlap cover image */}
          {business.logo_url && (
            <div className="absolute -top-10 left-4">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <img
                  src={business.logo_url}
                  alt={business.business_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Business Name */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 hover:text-cyan-600 transition-colors">
              {business.business_name}
            </h3>
            {business.listing_tier === "premium" && (
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            )}
          </div>

          {/* Address */}
          {business.address_line1 && (
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                {business.address_line1}
                {business.city && `, ${business.city}`}
              </span>
            </div>
          )}

          {/* Phone */}
          {business.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{business.phone}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}