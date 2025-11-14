import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag } from "lucide-react";

export default function RelatedCategories({ currentCategory, categories, businesses, onCategoryClick }) {
  // Map of category slugs to related category slugs
  const relatedCategoriesMap = {
    food: ["dairy", "bakery", "catering", "coffee"],
    dairy: ["food", "bakery", "coffee", "catering"],
    bakery: ["food", "dairy", "coffee", "catering"],
    apparel: ["shoes", "kids-clothing", "accessories", "alterations"],
    services: ["handyman", "cleaning", "moving", "professional"],
    home: ["furniture", "appliances", "hardware", "cleaning"],
    auto: ["mechanic", "body-shop", "tires", "detailing"],
    judaica: ["books", "gifts", "religious-items", "silver"],
    beauty: ["salon", "spa", "makeup", "nails"],
    fun: ["entertainment", "activities", "parks", "events"],
    education: ["tutoring", "schools", "learning", "camps"],
    "org-gmach": ["charity", "community", "organizations", "support"],
    repair: ["handyman", "plumber", "electrician", "appliance-repair"],
    handyman: ["repair", "plumber", "electrician", "contractor"],
    plumber: ["repair", "handyman", "electrician", "contractor"],
    electrician: ["repair", "handyman", "plumber", "contractor"],
    restaurant: ["food", "dairy", "catering", "takeout"],
    grocery: ["food", "bakery", "kosher", "specialty"],
    shopping: ["apparel", "gifts", "judaica", "home"],
    professional: ["services", "consulting", "accounting", "legal"],
    health: ["medical", "therapy", "wellness", "fitness"],
    kids: ["education", "camps", "activities", "tutoring"],
  };

  // Get related category slugs for current category
  const relatedSlugs = relatedCategoriesMap[currentCategory?.slug] || [];

  // Find actual category objects that exist and have businesses
  const relatedCategories = relatedSlugs
    .map(slug => categories.find(c => c.slug === slug))
    .filter(cat => {
      if (!cat) return false;
      // Check if this category has any businesses
      const hasBusinesses = businesses.some(b => 
        b.category_id === cat.id || 
        (b.subcategory_ids && b.subcategory_ids.includes(cat.id))
      );
      return hasBusinesses;
    })
    .slice(0, 5); // Limit to 5

  // If no related categories found, try to find any other popular categories
  if (relatedCategories.length === 0) {
    const popularSlugs = ["food", "services", "home", "apparel", "judaica"];
    const alternativeCategories = popularSlugs
      .map(slug => categories.find(c => c.slug === slug))
      .filter(cat => {
        if (!cat || cat.id === currentCategory?.id) return false;
        const hasBusinesses = businesses.some(b => 
          b.category_id === cat.id || 
          (b.subcategory_ids && b.subcategory_ids.includes(cat.id))
        );
        return hasBusinesses;
      })
      .slice(0, 5);
    
    if (alternativeCategories.length === 0) return null;
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Explore Other Categories
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {alternativeCategories.map((category) => (
            <Button
              key={category.id}
              onClick={() => onCategoryClick(category)}
              variant="outline"
              className="bg-white hover:bg-blue-50 border-blue-300 hover:border-blue-400 text-gray-900 hover:text-blue-700 transition-all"
            >
              {category.name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-cyan-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Related Categories
        </h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        You might also be looking for:
      </p>
      <div className="flex flex-wrap gap-3">
        {relatedCategories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategoryClick(category)}
            variant="outline"
            className="bg-white hover:bg-cyan-50 border-cyan-300 hover:border-cyan-400 text-gray-900 hover:text-cyan-700 transition-all"
          >
            {category.name}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ))}
      </div>
    </div>
  );
}