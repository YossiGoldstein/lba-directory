import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import BusinessCard from "../components/category/BusinessCard";
import RelatedCategories from "../components/category/RelatedCategories";
import BusinessMap from "../components/category/BusinessMap";
import ReactMarkdown from "react-markdown";

export default function CategoryListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [agentResponse, setAgentResponse] = useState("");
  const [matchedBusinesses, setMatchedBusinesses] = useState([]);
  const [conversation, setConversation] = useState(null);
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
  const categoryBusinesses = React.useMemo(() => {
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

  // Get sorted businesses (featured and sponsors first, then by rating)
  const sortedBusinesses = React.useMemo(() => {
    return [...categoryBusinesses]
      .sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        if (a.is_lba_sponsor && !b.is_lba_sponsor) return -1;
        if (!a.is_lba_sponsor && b.is_lba_sponsor) return 1;
        return (b.average_rating || 0) - (a.average_rating || 0);
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

  const extractBusinessesFromResponse = (responseText) => {
    const businesses = [];
    const responseLines = responseText.toLowerCase();

    allBusinesses.forEach(business => {
      const businessName = (business.business_name || "").toLowerCase();
      if (businessName && responseLines.includes(businessName)) {
        businesses.push(business);
      }
    });

    return businesses.slice(0, 12);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    setSearchResults(null);
    setAgentResponse("");
    setMatchedBusinesses([]);

    // Step 1: Direct business lookup within current category
    const query = searchQuery.toLowerCase().trim();
    const searchPool = slug === "all" ? allBusinesses : categoryBusinesses;
    
    const directMatches = searchPool.filter(business => {
      const name = (business.business_name || "").toLowerCase();
      const slug = (business.slug || "").toLowerCase();
      
      // Exact match
      if (name === query || slug === query) return true;
      
      // Contains match
      if (name.includes(query) || query.includes(name)) return true;
      
      // Word match
      const queryWords = query.split(/\s+/).filter(w => w.length > 2);
      const nameWords = name.split(/\s+/);
      if (queryWords.length >= 2) {
        const matchedWords = queryWords.filter(qw => 
          nameWords.some(nw => nw.includes(qw) || qw.includes(nw))
        );
        if (matchedWords.length >= Math.ceil(queryWords.length * 0.7)) return true;
      }
      
      return false;
    });

    // If single exact match, navigate directly
    if (directMatches.length === 1) {
      window.location.href = createPageUrl(`BusinessListing?id=${directMatches[0].id}`);
      return;
    }

    // If multiple clear matches, show them without AI
    if (directMatches.length > 0 && directMatches.length <= 10) {
      setMatchedBusinesses(directMatches);
      setAgentResponse(`Found ${directMatches.length} business${directMatches.length !== 1 ? 'es' : ''} matching "${searchQuery}"`);
      setSearchResults({
        response: `Found ${directMatches.length} business${directMatches.length !== 1 ? 'es' : ''} matching "${searchQuery}"`,
        businesses: directMatches
      });
      setIsSearching(false);
      return;
    }

    // Step 2: Fall back to AI if no clear matches
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: `Category Search: ${currentCategory?.name || 'All'}`,
          description: "Search within category",
          context: "category_page_search",
          category_slug: slug,
          category_name: currentCategory?.name
        }
      });

      setConversation(conv);

      const categoryContext = currentCategory 
        ? `User is viewing the "${currentCategory.name}" category page.`
        : "User is viewing all businesses.";

      await base44.agents.addMessage(conv, {
        role: "user",
        content: `${categoryContext}\n\nUser search: ${searchQuery}`
      });

      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant") {
            setAgentResponse(lastMessage.content);
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content);
            setMatchedBusinesses(extractedBusinesses);
            setSearchResults({
              response: lastMessage.content,
              businesses: extractedBusinesses
            });
            setIsSearching(false);
          }
        }
      );

      setTimeout(() => {
        unsubscribe();
      }, 30000);

    } catch (error) {
      console.error("Search failed:", error);
      setIsSearching(false);
      setAgentResponse("Sorry, I encountered an error while searching. Please try again.");
    }
  };

  const handleRelatedCategoryClick = async (category) => {
    setIsSearching(true);
    setSearchResults(null);
    setAgentResponse("");
    setMatchedBusinesses([]);

    try {
      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: `Related Category: ${category.name}`,
          description: "Browse related category",
          context: "related_category_click",
          original_category: currentCategory?.name,
          clicked_category: category.name
        }
      });

      setConversation(conv);

      await base44.agents.addMessage(conv, {
        role: "user",
        content: `User is on the "${currentCategory?.name || 'All'}" category page and clicked a related category: ${category.name}\n\nShow businesses from this related category.`
      });

      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant") {
            setAgentResponse(lastMessage.content);
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content);
            setMatchedBusinesses(extractedBusinesses);
            setSearchResults({
              response: lastMessage.content,
              businesses: extractedBusinesses
            });
            setIsSearching(false);
          }
        }
      );

      setTimeout(() => {
        unsubscribe();
      }, 30000);

    } catch (error) {
      console.error("Related category search failed:", error);
      setIsSearching(false);
      setAgentResponse("Sorry, I encountered an error. Please try again.");
    }
  };

  const handleContinueInChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  // Determine which businesses to show on map
  const businessesToMap = searchResults ? matchedBusinesses : displayedBusinesses;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Loading State */}
        {isSearching && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Searching for the best matches...</p>
            <p className="text-sm text-gray-500 mt-2">Our AI assistant is analyzing your request</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults && !isSearching && (
          <div className="flex gap-8">
            {/* Search Results Column */}
            <div className="flex-[0_0_calc(100%-650px)]">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
            {/* Agent Response */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Assistant Response:</h3>
                  <ReactMarkdown
                    className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600"
                    components={{
                      a: ({ children, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="underline">
                          {children}
                        </a>
                      ),
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    }}
                  >
                    {agentResponse}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Business Results */}
            {matchedBusinesses.length > 0 && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {matchedBusinesses.length} Result{matchedBusinesses.length !== 1 ? 's' : ''} Found
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {matchedBusinesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      categoryName={getCategoryName(business.category_id)}
                      hasActiveDeals={hasActiveDeals(business.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {matchedBusinesses.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No specific matches found</p>
                <p className="text-sm text-gray-500 mt-1">Try refining your search or browse the full list below</p>
              </div>
            )}

            {/* Continue in Chat */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <Button
                onClick={handleContinueInChat}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Continue this search in chat
              </Button>
            </div>
          </div>
        </div>

        {/* Map Column for Search Results - Fixed on desktop */}
        <div className="hidden lg:block w-[600px]">
          <div className="sticky top-24 h-[calc(100vh-7rem)]">
            <BusinessMap businesses={businessesToMap} />
          </div>
        </div>
        </div>
        )}

        {/* Default View - Businesses */}
        {!searchResults && !isSearching && (
          <div className="flex gap-8">
            {/* Listings Column */}
            <div className="flex-[0_0_calc(100%-650px)]">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedBusinesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      categoryName={getCategoryName(business.category_id)}
                      hasActiveDeals={hasActiveDeals(business.id)}
                    />
                  ))}
                </div>

                {/* Related Categories */}
                {currentCategory && (
                  <div className="mt-8">
                    <RelatedCategories
                      currentCategory={currentCategory}
                      categories={categories}
                      businesses={allBusinesses}
                      onCategoryClick={handleRelatedCategoryClick}
                    />
                  </div>
                )}

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
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 mt-3">
                    Ex. Take out closed businesses, show only my favorites
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Map Column - Fixed on desktop */}
          <div className="hidden lg:block w-[600px]">
            <div className="sticky top-24 h-[calc(100vh-7rem)]">
              <BusinessMap businesses={businessesToMap} />
            </div>
          </div>
          </div>
          )}
      </div>
    </div>
  );
}