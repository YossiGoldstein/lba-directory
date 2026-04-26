import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowRight, Award } from "lucide-react";

export default function FeaturedBusinesses({ businesses, categories }) {
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Business";
  };

  if (!businesses || businesses.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-4">
            <Award className="w-4 h-4" />
            Featured Listings
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Businesses
          </h2>
          <p className="text-lg text-gray-600">
            Trusted local businesses recommended by our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Link 
              key={business.id} 
              to={`/businesslisting/${business.slug || business.id}`}
            >
              <Card className="group hover:shadow-2xl transition-all duration-300 h-full overflow-hidden border-2 border-transparent hover:border-blue-500">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                  {business.gallery_images?.[0] ? (
                    <img 
                      src={business.gallery_images[0]} 
                      alt={business.business_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-bold text-blue-200">
                        {business.business_name[0]}
                      </span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <Badge className="bg-yellow-500 text-white font-semibold shadow-lg">
                      Featured
                    </Badge>
                    {business.is_lba_sponsor && (
                      <Badge className="bg-blue-600 text-white font-semibold shadow-lg">
                        LBA Sponsor
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Logo & Name */}
                  <div className="flex items-start gap-3 mb-3">
                    {business.logo_url && (
                      <img 
                        src={business.logo_url} 
                        alt={business.business_name}
                        className="w-14 h-14 rounded-lg object-cover border-2 border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {business.business_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getCategoryName(business.category_id)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {business.short_description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {business.short_description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2">
                    {/* Rating */}
                    {business.reviews_count > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">
                            {business.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({business.reviews_count} reviews)
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    {business.city && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{business.city}, {business.state}</span>
                      </div>
                    )}
                  </div>

                  {/* View Link */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}