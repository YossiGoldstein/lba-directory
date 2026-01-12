import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, CheckCircle } from "lucide-react";

export default function BusinessCard({ business, categoryName, hasActiveDeals }) {
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
    : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=300&fit=crop";

  const isPaid = business.listing_tier === "pro" || business.listing_tier === "premium";
  const isFeatured = business.is_featured || business.listing_tier === "premium";

  return (
    <Link to={createPageUrl(`BusinessListing?id=${business.id}`)} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Wide Cover Image - Banner Style */}
        <div className="relative w-full h-24 sm:h-28 bg-gray-100">
          <img
            src={coverImage}
            alt={business.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Open/Closed Badge - Top Left */}
          {isOpen !== null && (
            <div className="absolute top-2 left-2">
              <Badge className={`${isOpen ? 'bg-green-500' : 'bg-red-500'} text-white text-[10px] px-2 py-0.5 shadow-lg font-bold uppercase tracking-wide`}>
                {isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
          )}

          {/* Status Badges - Top Right */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            {hasActiveDeals && (
              <Badge className="bg-red-500 text-white text-[10px] px-2 py-0.5 shadow-lg font-bold uppercase tracking-wide">
                Sale
              </Badge>
            )}
            {isFeatured && (
              <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 shadow-lg font-bold uppercase tracking-wide">
                Featured
              </Badge>
            )}
            {isPaid && !isFeatured && (
              <Badge className="bg-cyan-600 text-white text-[10px] px-2 py-0.5 shadow-lg font-bold uppercase tracking-wide">
                Pro
              </Badge>
            )}
          </div>

          {/* Circular Logo - Overlaid on cover */}
          <div className="absolute -bottom-6 left-4">
            <div className="w-12 h-12 rounded-full border-[3px] border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-cyan-600">
                  {business.business_name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-8 pb-3 px-4">
          {/* Business Name */}
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-1">
              {business.business_name}
            </h3>
            {business.listing_tier === "premium" && (
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
            <span className="line-clamp-1">
              {business.address_line1 ? (
                <>
                  {business.address_line1}
                  {business.city && `, ${business.city}`}
                </>
              ) : (
                business.city || "Lakewood, NJ"
              )}
            </span>
          </div>

          {/* Phone */}
          {business.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span>{business.phone}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}