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
        {/* Business Name - Centered */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
          {business.business_name}
        </h3>

        {/* Address */}
        {business.address_line1 && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              {business.address_line1}
              {business.city && `, ${business.city}`}
              {business.state && `, ${business.state}`}
              {business.zip_code && ` ${business.zip_code}`}
            </span>
          </div>
        )}

        {/* Phone */}
        {business.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${business.phone}`} className="hover:text-cyan-600">
              {business.phone}
            </a>
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