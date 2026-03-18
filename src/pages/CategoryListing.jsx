import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Sparkles } from "lucide-react";
import BusinessCard from "../components/category/BusinessCard";
import RelatedCategories from "../components/category/RelatedCategories";
import BusinessMap from "../components/category/BusinessMap";

export default function CategoryListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(6);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.filter((c) => c.is_active);
    },
  });

  // Fetch all businesses
  const { data: allBusinesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const biz = await base44.entities.Business.list();
      return biz.filter((b) => b.status === "approved");
    },
  });

  // Fetch deals
  const { data: deals = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      return await base44.entities.Deal.list();
    },
  });

  // Get current category info
  const currentCategory = categories.find((c) => c.slug === slug);

  // Filter businesses by current category (for default view)
  const categoryBusinesses = useMemo(() => {
    if (slug === "all") return allBusinesses;
    
    return allBusinesses.filter((b) => {
      const cat = categories.find((c) => c.id === b.category_id);
      if (!cat) return false;
      
      if (cat.slug === slug) return true;
      if (b.subcategory_ids && b.subcategory_ids.length > 0) {
        return b.subcategory_ids.some((subId) => {
          const subCat = categories.find((c) => c.id === subId);
          return subCat && subCat.slug === slug;
        });
      }
      return false;
    });
  }, [allBusinesses, categories, slug]);

  // Get sorted businesses (VIP first, then by listing_rank, then featured/sponsors, then rating)
  const sortedBusinesses = React.useMemo(() => {
    return [...categoryBusinesses]
      .sort((a, b) => {
        // First: VIP listings always on top
        if (a.is_vip && !b.is_vip) return -1;
        if (!a.is_vip && b.is_vip) return 1;
        
        // Second: Sort by listing_rank (higher rank = better placement)
        const rankA = a.listing_rank || 1;
        const rankB = b.listing_rank || 1;
        if (rankA !== rankB) return rankB - rankA;
        
        // Third: Featured businesses
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        
        // Fourth: LBA Sponsors
        if (a.is_lba_sponsor && !b.is_lba_sponsor) return -1;
        if (!a.is_lba_sponsor && b.is_lba_sponsor) return 1;
        
        // Fifth: Rating
        return (b.average_rating || b.general_rating || 0) - (a.average_rating || a.general_rating || 0);
      });
  }, [categoryBusinesses]);

  const displayedBusinesses = sortedBusinesses.slice(0, displayLimit);

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  const hasActiveDeals = (businessId) => {
    const now = new Date();
    return deals.some((deal) => {
      if (deal.business_id !== businessId || !deal.is_active) return false;
      const start = new Date(deal.start_date);
      const end = new Date(deal.end_date);
      return start <= now && end >= now;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = createPageUrl(`SearchResults?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  const businessesToMap = displayedBusinesses;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="w-full py-4 sm:py-6 lg:py-8">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-0">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4 sm:mb-6">
          <Link
            to={createPageUrl("Home")}
            className="hover:text-cyan-600 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">
            {currentCategory ? currentCategory.name : "All Businesses"}
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {currentCategory ? currentCategory.name : "All Businesses"}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {currentCategory
              ? currentCategory.description || "Browse businesses in this category"
              : "Browse all listings in the directory"}
          </p>
        </div>
        </div>

        {/* Default View - Businesses */}
        <div className="flex gap-0 lg:gap-6">
            {/* Listings Column - Takes more space for wide cards */}
            <div className="flex-1 min-w-0 px-0 lg:pr-6 overflow-y-auto lg:h-[calc(100vh-12rem)]">
            {/* Info Block */}
            {categoryBusinesses.length > 0 && (
              <div className="bg-cyan-50 rounded-lg p-4 mb-4 border border-cyan-200">
                <p className="text-gray-700 text-sm">
                  Total businesses in this category: <strong>{categoryBusinesses.length}</strong>
                </p>
                {displayedBusinesses.length < categoryBusinesses.length && (
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-gray-600 text-sm">
                      {categoryBusinesses.length - displayedBusinesses.length} more businesses in this category
                    </p>
                    <Button 
                      onClick={() => setDisplayLimit(prev => prev + 6)}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}

            {businessesLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">Loading businesses...</p>
              </div>
            )}

            {!businessesLoading && categoryBusinesses.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No businesses in this category yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Check back soon or browse other categories
                </p>
                <Button asChild variant="outline">
                  <Link to={createPageUrl("Home")}>Back to Home</Link>
                </Button>
              </div>
            )}

            {!businessesLoading && displayedBusinesses.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
                  {displayedBusinesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      categoryName={getCategoryName(business.category_id)}
                      hasActiveDeals={hasActiveDeals(business.id)}
                    />
                  ))}
                </div>



                {/* AI Advanced Search Section */}
                <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-cyan-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Advance your current search
                    </h2>
                  </div>
                  <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Refine your search with AI..."
                        className="pl-10 h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-cyan-600 hover:bg-cyan-700 h-12 px-8"
                    >
                      Search
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 mt-3">
                    Ex. Take out closed businesses, show only my favorites
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Map Column - Fixed position */}
          <div className="hidden lg:block w-[40%] max-w-[600px] flex-shrink-0">
            <div className="sticky top-4 h-[calc(100vh-2rem)] rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <BusinessMap businesses={businessesToMap} />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}