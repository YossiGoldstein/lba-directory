import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, ExternalLink, Navigation } from "lucide-react";

export default function BusinessResultCard({ business }) {
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMap = (address) => {
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {business.business_name || business.name}
            </h4>
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
            <Link to={createPageUrl(`BusinessListing?id=${business.id}`)}>
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