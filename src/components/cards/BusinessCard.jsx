import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { fixImageUrl } from "../lib/imageUtils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, ExternalLink, CheckCircle } from "lucide-react";

export default function BusinessCard({ business }) {
  return (
    <Link to={createPageUrl(`BusinessListing?id=${business.id}`)}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {business.cover_image_url ? (
            <img 
              src={fixImageUrl(business.cover_image_url)}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <span className="text-4xl font-bold text-blue-200">{business.name[0]}</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {business.is_featured && (
              <Badge className="bg-yellow-500 text-white">Featured</Badge>
            )}
            {business.is_verified && (
              <Badge className="bg-green-500 text-white flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Logo & Name */}
          <div className="flex items-start gap-3 mb-3">
            {business.logo_url && (
              <img 
                src={fixImageUrl(business.logo_url)}
                alt={business.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {business.name}
              </h3>
              {business.rating_count > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {business.rating_average.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({business.rating_count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {business.description}
          </p>

          {/* Details */}
          <div className="space-y-2">
            {business.city && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{business.city}, {business.state}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
          </div>

          {/* View Link */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}