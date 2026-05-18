import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { fixImageUrl } from "@/components/lib/imageUtils";
import BusinessImage from "@/components/lib/BusinessImage";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, CheckCircle, Star, Zap } from "lucide-react";


const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

const computeBusinessStatus = (business) => {
  if (business.by_appointment_only) {
    return { type: 'appointment', label: 'By Appointment' };
  }
  if (!business.opening_hours_json) return null;

  const now = new Date();
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[nyTime.getDay()];
  const hours = business.opening_hours_json[currentDay];

  if (!hours || hours.closed) return { type: 'closed', label: 'Closed' };

  const currentTime = nyTime.getHours() * 60 + nyTime.getMinutes();
  const [openHour, openMin] = (hours.open || '00:00').split(':').map(Number);
  const [closeHour, closeMin] = (hours.close || '00:00').split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  const isOpen = currentTime >= openTime && currentTime <= closeTime;
  return { type: isOpen ? 'open' : 'closed', label: isOpen ? 'Open Now' : 'Closed' };
};

export default function BusinessCard({ business, categoryName, hasActiveDeals }) {
  const [businessStatus, setBusinessStatus] = useState(() => computeBusinessStatus(business));

  useEffect(() => {
    // Refresh status every minute
    const interval = setInterval(() => {
      setBusinessStatus(computeBusinessStatus(business));
    }, 60000);
    return () => clearInterval(interval);
  }, [business]);



  const isPaid = business.listing_tier === "pro" || business.listing_tier === "premium";
  const isFeatured = business.is_featured || business.listing_tier === "premium";
  const hasDeals = hasActiveDeals === true;

  return (
    <Link to={`/businesslisting/${business.slug || business.id}`} className="block group h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Wide Cover Image - Banner Style */}
        <div className="relative w-full h-32 sm:h-40 bg-gray-100">
          <BusinessImage business={business} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Status Badges - Top Left */}
          <div className="absolute top-2 left-2 flex gap-1.5 z-10 pointer-events-none">
            {hasDeals && (
              <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide shadow-md">
                🔥 Sale
              </div>
            )}
            {businessStatus && (
              <div className={`backdrop-blur-sm text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide shadow-md ${
                businessStatus.type === 'open' 
                  ? 'bg-green-500 text-white' 
                  : businessStatus.type === 'appointment'
                  ? 'bg-blue-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {businessStatus.label}
              </div>
            )}
          </div>

          {/* Tier Badges - Top Right */}
          <div className="absolute top-2 right-2 flex gap-1.5 z-10 pointer-events-none">
            {business.listing_tier === 'premium' && (
              <div className="bg-white/70 backdrop-blur-sm p-1 rounded shadow-md">
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              </div>
            )}
          </div>

          {/* Circular Logo - Overlaid on cover */}
          <div className="absolute -bottom-6 left-4">
            <div className="w-12 h-12 rounded-full border-[3px] border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
              {business.logo_url ? (
                <img
                  src={fixImageUrl(business.logo_url)}
                  alt={business.business_name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
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
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-cyan-600 transition-colors line-clamp-1">
              {business.business_name}
            </h3>
            {business.listing_tier === "premium" && (
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>

          {business.is_lba_sponsor && (
            <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 mb-1.5">LBA Sponsor</Badge>
          )}

          {/* Ratings Row */}
          {business.reviews_count > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
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
              <span className="text-xs text-gray-600">
                ({business.reviews_count})
              </span>
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