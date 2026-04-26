import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { fixImageUrl } from "@/components/lib/imageUtils";
import BusinessImage from "@/components/lib/BusinessImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, ExternalLink, Navigation, CheckCircle } from "lucide-react";

export default function BusinessResultCard({ business, hasActiveDeals }) {
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
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMap = (address) => {
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {/* Cover Image with Icons - always show */}
      <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
        <BusinessImage business={business} className="w-full h-full object-cover" />
          
          {/* Status Badges */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Open/Closed - Top Left */}
            {isOpen !== null && (
              <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {isOpen ? 'OPEN' : 'CLOSED'}
              </div>
            )}
            
            {/* Tier/Deal Badges - Top Right */}
            <div className="absolute top-2 right-2 flex gap-1">
              {hasActiveDeals && (
                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                  SALE
                </div>
              )}
              {business.listing_tier === 'pro' && (
                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                  PRO
                </div>
              )}
              {business.listing_tier === 'premium' && (
                <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                  PREMIUM
                </div>
              )}
            </div>
          </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-gray-900 mb-1">
                {business.business_name || business.name}
              </h4>
              {business.listing_tier === 'premium' && (
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            {business.category && (
              <p className="text-sm text-cyan-600">{business.category}</p>
            )}
          </div>
          {business.is_lba_sponsor && (
            <Badge className="bg-blue-600 text-white text-xs">Sponsor</Badge>
          )}
        </div>

        {business.short_description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {business.short_description}
          </p>
        )}

        {/* Location */}
        {(business.city || business.address) && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="w-3 h-3" />
            <span>{business.city || business.address}</span>
          </div>
        )}

        {/* Rating */}
        {business.average_rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{business.average_rating.toFixed(1)}</span>
            {business.reviews_count > 0 && (
              <span className="text-gray-500">({business.reviews_count})</span>
            )}
          </div>
        )}

        {/* Opening Hours */}
        {business.opening_hours_text && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-1">
            🕐 {business.opening_hours_text}
          </p>
        )}

        {/* Active Deals */}
        {business.has_deals && (
          <div className="mb-3">
            <Badge className="bg-green-600 text-white text-xs">
              Active Deals Available
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-xs"
          >
            <Link to={`/businesslisting/${business.slug || business.id}`}>
              <ExternalLink className="w-3 h-3 mr-1" />
              View Details
            </Link>
          </Button>

          {business.phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCall(business.phone)}
              className="text-xs"
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
          )}

          {(business.address_line1 || business.latitude) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMap(business.address_line1 || `${business.latitude},${business.longitude}`)}
              className="text-xs"
            >
              <Navigation className="w-3 h-3 mr-1" />
              Map
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}