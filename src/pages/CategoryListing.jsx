import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, List, Map as MapIcon, ChevronRight, X } from "lucide-react";
import FiltersPanel from "../components/category/FiltersPanel";
import BusinessCard from "../components/category/BusinessCard";
import MapView from "../components/category/MapView";

export default function CategoryListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "all";
  const initialQuery = urlParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeView, setActiveView] = useState("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    category: slug === "all" ? "all" : slug,
    location: "all",
    hasDeals: false,
    sortBy: "relevance",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.filter((c) => c.is_active);
    },
  });

  // Fetch businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
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

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  // Check if business has active deals
  const hasActiveDeals = (businessId) => {
    const now = new Date();
    return deals.some((deal) => {
      if (deal.business_id !== businessId || !deal.is_active) return false;
      const start = new Date(deal.start_date);
      const end = new Date(deal.end_date);
      return start <= now && end >= now;
    });
  };

  // Filter and sort businesses
  const filteredBusinesses = React.useMemo(() => {
    let results = [...businesses];

    // Category filter
    if (appliedFilters.category !== "all") {
      results = results.filter((b) => {
        const cat = categories.find((c) => c.id === b.category_id);
        if (!cat) return false;
        
        // Check main category or subcategories
        if (cat.slug === appliedFilters.category) return true;
        if (b.subcategory_ids && b.subcategory_ids.length > 0) {
          return b.subcategory_ids.some((subId) => {
            const subCat = categories.find((c) => c.id === subId);
            return subCat && subCat.slug === appliedFilters.category;
          });
        }
        return false;
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((b) => {
        const searchableText = [
          b.business_name || "",
          b.short_description || "",
          b.long_description || "",
          ...(b.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(query);
      });
    }

    // Location filter
    if (appliedFilters.location !== "all") {
      results = results.filter((b) => {
        const city = (b.city || "").toLowerCase();
        return city.includes(appliedFilters.location.toLowerCase());
      });
    }

    // Deals filter
    if (appliedFilters.hasDeals) {
      results = results.filter((b) => hasActiveDeals(b.id));
    }

    // Sort
    switch (appliedFilters.sortBy) {
      case "name_asc":
        results.sort((a, b) =>
          (a.business_name || "").localeCompare(b.business_name || "")
        );
        break;
      case "rating_desc":
        results.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case "reviews_desc":
        results.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));
        break;
      default:
        // Relevance - prioritize featured and sponsors
        results.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.is_lba_sponsor && !b.is_lba_sponsor) return -1;
          if (!a.is_lba_sponsor && b.is_lba_sponsor) return 1;
          return 0;
        });
    }

    return results;
  }, [businesses, categories, deals, searchQuery, appliedFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with query param
    const newUrl = `${createPageUrl("CategoryListing")}?slug=${slug}${
      searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ""
    }`;
    window.history.pushState({}, "", newUrl);
    setAppliedFilters({ ...filters });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setMobileFiltersOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: slug === "all" ? "all" : slug,
      location: "all",
      hasDeals: false,
      sortBy: "relevance",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSearchQuery("");
    setMobileFiltersOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {currentCategory ? currentCategory.name : "All Businesses"}
          </h1>
          <p className="text-lg text-gray-600">
            {currentCategory
              ? currentCategory.description || "Browse businesses in this category"
              : "Browse all listings in the directory"}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search within this category..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Panel - Desktop */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <FiltersPanel
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Mobile Filters Button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              variant="outline"
              className="w-full mb-4"
            >
              Filters {mobileFiltersOpen ? "▲" : "▼"}
            </Button>
            {mobileFiltersOpen && (
              <div className="mb-6">
                <FiltersPanel
                  categories={categories}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {/* Results Count & View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filteredBusinesses.length}
                </span>{" "}
                business{filteredBusinesses.length !== 1 ? "es" : ""} found
              </p>

              <Tabs value={activeView} onValueChange={setActiveView}>
                <TabsList>
                  <TabsTrigger value="list" className="gap-2">
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List View</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="gap-2">
                    <MapIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Map View</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Loading State */}
            {businessesLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">Loading businesses...</p>
              </div>
            )}

            {/* Empty State */}
            {!businessesLoading && filteredBusinesses.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No listings match your search
                </h3>
                <p className="text-gray-600 mb-6">
                  Try changing filters or searching a different keyword.
                </p>
                <Button onClick={handleResetFilters} variant="outline">
                  Reset Filters
                </Button>
              </div>
            )}

            {/* List View */}
            {!businessesLoading && activeView === "list" && filteredBusinesses.length > 0 && (
              <div className="space-y-4">
                {filteredBusinesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    categoryName={getCategoryName(business.category_id)}
                    hasActiveDeals={hasActiveDeals(business.id)}
                  />
                ))}
              </div>
            )}

            {/* Map View */}
            {!businessesLoading && activeView === "map" && filteredBusinesses.length > 0 && (
              <MapView
                businesses={filteredBusinesses}
                getCategoryName={getCategoryName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}