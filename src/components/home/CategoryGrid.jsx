import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { 
  UtensilsCrossed, Shirt, Briefcase, Home, Car, 
  Book, Sparkles, PartyPopper, GraduationCap, HandHeart,
  ChevronRight
} from "lucide-react";

const iconMap = {
  "UtensilsCrossed": UtensilsCrossed,
  "Shirt": Shirt,
  "Briefcase": Briefcase,
  "Home": Home,
  "Car": Car,
  "Book": Book,
  "Sparkles": Sparkles,
  "PartyPopper": PartyPopper,
  "GraduationCap": GraduationCap,
  "HandHeart": HandHeart,
};

export default function CategoryGrid({ categories }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600">
            Explore local businesses across different categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon_name] || Briefcase;
            
            return (
              <Link 
                key={category.id} 
                to={createPageUrl(`CategoryListing?slug=${category.slug}`)}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 border-transparent hover:border-blue-500">
                  <div className="p-6 flex flex-col items-center text-center">
                    {/* Icon Circle */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center mb-4 transition-colors">
                      <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    
                    {/* Category Name */}
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    
                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}