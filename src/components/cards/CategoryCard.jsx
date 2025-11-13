import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function CategoryCard({ category, businessCount = 0 }) {
  return (
    <Link to={createPageUrl(`CategoryListing?slug=${category.slug}`)}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
        {/* Image */}
        <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          {category.image_url ? (
            <img 
              src={category.image_url} 
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <span className="text-3xl">{category.icon || "📁"}</span>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Content on image */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-semibold text-white text-lg mb-1">{category.name}</h3>
            <p className="text-sm text-white/90">{businessCount} Businesses</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 bg-white">
          {category.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
              Explore
            </span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}