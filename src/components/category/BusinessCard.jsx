import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Tag, Heart } from "lucide-react";

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 relative bg-gray-100">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
              <span className="text-4xl font-bold text-cyan-600">
                {business.business_name.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Badges on image */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {business.is_lba_sponsor && (
              <Badge className="bg-blue-600 text-white text-xs">LBA Sponsor</Badge>
            )}
            {business.is_featured && (
              <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
            )}
            {hasActiveDeals && (
              <Badge className="bg-green-600 text-white text-xs">Deals Available</Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {business.business_name}
                </h3>
                <p className="text-sm text-cyan-600 font-medium">{categoryName}</p>
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Rating */}
            {business.average_rating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {renderStars(Math.round(business.average_rating))}
                </div>
                <span className="text-sm text-gray-600">
                  {business.average_rating.toFixed(1)} ({business.reviews_count || 0} reviews)
                </span>
              </div>
            )}

            {/* Location */}
            {(business.city || business.state) && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>
                  {business.city}
                  {business.city && business.state && ", "}
                  {business.state}
                </span>
              </div>
            )}

            {/* Description */}
            {business.short_description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {business.short_description}
              </p>
            )}

            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {business.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-auto pt-3">
            <Button
              asChild
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700"
            >
              <Link to={createPageUrl(`BusinessListing?id=${business.id}`)}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}