import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import BusinessImage from "@/components/lib/BusinessImage";
import { Star, MapPin, ArrowRight } from "lucide-react";

export default function RelatedBusinesses({ businesses, categoryName }) {
  if (!businesses || businesses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">You might also like</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <Link
            key={business.id}
            to={createPageUrl(`BusinessListing?id=${business.id}`)}
            className="block group"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Image */}
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  {business.logo_url ? (
                    <img
                      src={business.logo_url}
                      alt={business.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
                      <span className="text-4xl font-bold text-cyan-600">
                        {business.business_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-cyan-600 transition-colors">
                    {business.business_name}
                  </h3>
                  
                  <p className="text-sm text-cyan-600 mb-2">{categoryName}</p>

                  {/* Location */}
                  {(business.city || business.state) && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {business.city}
                        {business.city && business.state && ", "}
                        {business.state}
                      </span>
                    </div>
                  )}

                  {/* Rating */}
                  {business.average_rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>{business.average_rating.toFixed(1)}</span>
                      {business.reviews_count > 0 && (
                        <span className="text-gray-500">({business.reviews_count})</span>
                      )}
                    </div>
                  )}

                  {/* View More */}
                  <div className="mt-3 flex items-center gap-1 text-sm text-cyan-600 font-medium group-hover:gap-2 transition-all">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}