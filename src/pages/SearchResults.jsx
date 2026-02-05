import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowLeft } from "lucide-react";
import BusinessCard from "../components/category/BusinessCard";
import BusinessMap from "../components/category/BusinessMap";
import FiltersPanel from "../components/category/FiltersPanel";
import ReactMarkdown from "react-markdown";

export default function SearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("query") || "";

  const [isSearching, setIsSearching] = useState(true);
  const [agentResponse, setAgentResponse] = useState("");
  const [matchedBusinesses, setMatchedBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    category: "all",
    location: "all",
    hasDeals: false,
    sortBy: "relevance"
  });
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bizList, catList] = await Promise.all([
          base44.entities.Business.list(),
          base44.entities.Category.list()
        ]);
        const approved = bizList.filter(b => b.status === "approved");
        setAllBusinesses(approved);
        setCategories(catList.filter(c => c.is_active));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery && allBusinesses.length > 0) {
      performSearch();
    }
  }, [searchQuery, allBusinesses]);

  useEffect(() => {
    // Apply filters to matched businesses
    let results = [...matchedBusinesses];

    // Filter by category
    if (filters.category !== "all") {
      results = results.filter(b => {
        const category = categories.find(c => c.id === b.category_id);
        return category && category.slug === filters.category;
      });
    }

    // Filter by deals
    if (filters.hasDeals) {
      results = results.filter(b => b.has_deals);
    }

    // Sort
    switch (filters.sortBy) {
      case "name_asc":
        results.sort((a, b) => a.business_name.localeCompare(b.business_name));
        break;
      case "rating_desc":
        results.sort((a, b) => (b.general_rating || 0) - (a.general_rating || 0));
        break;
      case "reviews_desc":
        results.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));
        break;
    }

    setFilteredBusinesses(results);
  }, [matchedBusinesses, filters, categories]);

  const performSearch = async () => {
    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(w => w.length > 2);

    // Detect if this is a natural language query
    const needsAI = 
      query.includes("looking for") ||
      query.includes("where can i") ||
      query.includes("open now") ||
      query.includes("available now") ||
      query.includes("best") ||
      query.includes("recommend") ||
      query.includes("suggest") ||
      query.includes("need") ||
      query.includes("want") ||
      query.includes("find me") ||
      query.includes("show me") ||
      query.startsWith("where") ||
      query.startsWith("when") ||
      query.startsWith("how") ||
      query.startsWith("why") ||
      query.startsWith("what") ||
      queryWords.length > 5;

    if (!needsAI) {
      // Direct search
      const directMatches = allBusinesses.filter(business => {
        const name = (business.business_name || "").toLowerCase();
        const slug = (business.slug || "").toLowerCase();
        const shortDesc = (business.short_description || "").toLowerCase();
        const longDesc = (business.long_description || "").toLowerCase();
        const tags = business.tags ? business.tags.map(t => t.toLowerCase()).join(" ") : "";

        const category = categories.find(c => c.id === business.category_id);
        const categoryName = category ? category.name.toLowerCase() : "";

        const allContent = `${name} ${slug} ${shortDesc} ${longDesc} ${tags} ${categoryName}`;

        if (name === query || slug === query) return true;
        const nameWords = name.split(/\s+/);
        if (nameWords.some(word => word === query)) return true;
        if (query.length >= 3 && (name.includes(query) || shortDesc.includes(query) || longDesc.includes(query))) {
          return true;
        }
        if (tags.includes(query)) return true;
        if (categoryName.includes(query)) return true;

        if (queryWords.length > 0) {
          const meaningfulWords = queryWords.filter(word => 
            !['looking', 'for', 'find', 'search', 'need', 'want', 'show', 'me', 'the', 'a', 'an'].includes(word)
          );
          if (meaningfulWords.length > 0) {
            const hasMatchingWords = meaningfulWords.some(word => allContent.includes(word));
            if (hasMatchingWords) return true;
          }
        }

        return false;
      });

      if (directMatches.length > 0) {
        setMatchedBusinesses(directMatches);
        setAgentResponse(`Found ${directMatches.length} business${directMatches.length !== 1 ? 'es' : ''} matching "${searchQuery}"`);
        setIsSearching(false);
        return;
      }
    }

    // AI Search
    let searchCompleted = false;
    try {
      const foodCategory = categories.find(c => c.slug === "food" || c.name.toLowerCase().includes("food"));
      const relevantBusinesses = allBusinesses.filter(b => {
        if (foodCategory && b.category_id === foodCategory.id) return true;
        const category = categories.find(c => c.id === b.category_id);
        return category && category.name.toLowerCase().includes("food");
      }).slice(0, 50);

      const contextMessage = relevantBusinesses.length > 0 
        ? `${searchQuery}\n\nNote: We have ${relevantBusinesses.length} food businesses in the directory. Here are their names: ${relevantBusinesses.map(b => b.business_name).join(", ")}`
        : searchQuery;

      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: "Search Results",
          description: "Search from search results page",
          context: "search_results"
        }
      });

      setConversation(conv);

      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant" && lastMessage.content) {
            searchCompleted = true;
            setAgentResponse(lastMessage.content);
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content);
            setMatchedBusinesses(extractedBusinesses);
            setIsSearching(false);
          }
        }
      );

      await base44.agents.addMessage(conv, {
        role: "user",
        content: contextMessage
      });

      setTimeout(() => {
        unsubscribe();
        if (!searchCompleted) {
          setIsSearching(false);
          setAgentResponse("The search took longer than expected. Please try rephrasing your search or browse our categories.");
          setMatchedBusinesses([]);
        }
      }, 30000);

    } catch (error) {
      console.error("Search failed:", error);
      setIsSearching(false);
      setAgentResponse("I'm having trouble processing your search. Please try again or browse our categories below.");
      setMatchedBusinesses([]);
    }
  };

  const extractBusinessesFromResponse = (responseText) => {
    const businesses = [];
    const responseLower = responseText.toLowerCase();

    allBusinesses.forEach(business => {
      const businessName = (business.business_name || "").toLowerCase().trim();
      const cleanName = businessName.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
      
      if (businessName && (responseLower.includes(businessName) || responseLower.includes(cleanName))) {
        businesses.push(business);
      } else {
        const words = cleanName.split(/\s+/).filter(w => w.length > 3);
        if (words.length >= 2) {
          const matchedWords = words.filter(word => responseLower.includes(word));
          if (matchedWords.length >= Math.ceil(words.length * 0.7)) {
            businesses.push(business);
          }
        }
      }
    });

    return businesses.slice(0, 20);
  };

  const handleContinueInChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-cyan-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
                <p className="text-gray-600 mt-1">Searching for: "{searchQuery}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FiltersPanel
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
              onApply={() => {}}
              onReset={() => setFilters({
                category: "all",
                location: "all",
                hasDeals: false,
                sortBy: "relevance"
              })}
            />
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {isSearching ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg text-gray-600">Searching for the best matches...</p>
                  <p className="text-sm text-gray-500 mt-2">Our AI assistant is analyzing your request</p>
                </div>
              </div>
            ) : (
              <>
                {/* AI Response */}
                {agentResponse && (
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
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
                        <Button
                          onClick={handleContinueInChat}
                          variant="outline"
                          size="sm"
                          className="mt-4"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Continue in chat
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-lg font-semibold text-gray-900">
                    {filteredBusinesses.length} Result{filteredBusinesses.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === "map" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("map")}
                    >
                      Map
                    </Button>
                  </div>
                </div>

                {/* Results */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBusinesses.map((business) => (
                      <BusinessCard key={business.id} business={business} />
                    ))}
                  </div>
                ) : (
                  <BusinessMap businesses={filteredBusinesses} />
                )}

                {filteredBusinesses.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-lg">No matches found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}