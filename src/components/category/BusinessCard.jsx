import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, CheckCircle, Star } from "lucide-react";

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
  const hasDeals = hasActiveDeals === true;

  return (
    <Link to={createPageUrl(`BusinessListing?id=${business.id}`)} className="block group h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Wide Cover Image - Banner Style */}
        <div className="relative w-full h-24 sm:h-28 bg-gray-100">
          <img
            src={coverImage}
            alt={business.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Status Badges - Top Left */}
          <div className="absolute top-2 left-2 flex gap-1.5 z-10 pointer-events-none">
            {hasDeals && (
              <div className="bg-white/70 backdrop-blur-sm text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide shadow-md">
                Sale
              </div>
            )}
            {isOpen !== null && (
              <div className="bg-white/70 backdrop-blur-sm text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide shadow-md">
                {isOpen ? 'Open' : 'Closed'}
              </div>
            )}
          </div>

          {/* Tier Badges - Top Right */}
          <div className="absolute top-2 right-2 flex gap-1.5 z-10 pointer-events-none">
            {business.listing_tier === 'premium' && (
              <div className="bg-white/70 backdrop-blur-sm p-1 rounded shadow-md">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
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
        <div className="pt-8 pb-3 px-4 flex-1">
          {/* Business Name */}
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-1">
              {business.business_name}
            </h3>
            {business.listing_tier === "premium" && (
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>

          {/* Ratings Row */}
          {business.reviews_count > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-500 text-xs font-medium">Reviews:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(business.general_rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
            <span className="line-clamp-2">
              {business.address_line1 ? (
                <>
                  {business.address_line1}
                  {business.city && `, ${business.city}`}
                  {business.state && `, ${business.state}`}
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