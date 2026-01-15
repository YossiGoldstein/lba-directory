import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, CheckCircle, Star } from "lucide-react";

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export default function BusinessCard({ business, categoryName, hasActiveDeals }) {
  // Check business status
  const getBusinessStatus = () => {
    // By appointment only
    if (business.by_appointment_only) {
      return { type: 'appointment', label: 'By Appointment' };
    }
    
    // No hours set
    if (!business.opening_hours_json) {
      return null;
    }
    
    // Check if currently open
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const hours = business.opening_hours_json[currentDay];
    
    if (!hours || hours.closed) {
      return { type: 'closed', label: 'Closed' };
    }
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    const isOpen = currentTime >= openTime && currentTime <= closeTime;
    return { type: isOpen ? 'open' : 'closed', label: isOpen ? 'Open' : 'Closed' };
  };

  const businessStatus = getBusinessStatus();

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
              <div className="bg-white/70 backdrop-blur-sm text-[#003D5C] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide shadow-md">
                Sale
              </div>
            )}
            {businessStatus && (
              <div className={`backdrop-blur-sm text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide shadow-md ${
                businessStatus.type === 'open' 
                  ? 'bg-green-500/90 text-white' 
                  : businessStatus.type === 'appointment'
                  ? 'bg-blue-500/90 text-white'
                  : 'bg-gray-500/90 text-white'
              }`}>
                {businessStatus.label}
              </div>
            )}
          </div>

          {/* Tier Badges - Top Right */}
          <div className="absolute top-2 right-2 flex gap-1.5 z-10 pointer-events-none">
            {business.listing_tier === 'premium' && (
              <div className="bg-white/70 backdrop-blur-sm p-1 rounded shadow-md">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
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
              <span>{formatPhoneNumber(business.phone)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}