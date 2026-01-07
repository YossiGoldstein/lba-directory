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

  const coverImage = business.gallery_images && business.gallery_images.length > 0 
    ? business.gallery_images[0] 
    : business.logo_url;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-100">
        {coverImage ? (
          <img
            src={coverImage}
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
        
        {/* Circular Logo Overlay */}
        {business.logo_url && (
          <div className="absolute bottom-0 left-4 transform translate-y-1/2">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              <img
                src={business.logo_url}
                alt={business.business_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Badges on image */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
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

        <button className="absolute top-2 left-2 text-white hover:text-red-500 transition-colors bg-black/30 hover:bg-white rounded-full p-2">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 pt-12">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {business.business_name}
          </h3>
          <p className="text-sm text-cyan-600 font-medium">{categoryName}</p>
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
          <div className="flex flex-wrap gap-1 mb-4">
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

        {/* Action Button */}
        <Button
          asChild
          className="w-full bg-cyan-600 hover:bg-cyan-700"
        >
          <Link to={createPageUrl(`BusinessListing?id=${business.id}`)}>
            View Details
          </Link>
        </Button>
      </div>
    </div>
  );
}