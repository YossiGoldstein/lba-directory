import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowLeft } from "lucide-react";
import BusinessCard from "../components/category/BusinessCard";
import BusinessMap from "../components/category/BusinessMap";

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

    // AI Search with full context
    let searchCompleted = false;
    try {
      // Get current time in EST
      const now = new Date();
      const estTime = now.toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const dayOfWeek = now.toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'long' });
      const currentHour = parseInt(now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false }));
      const currentMinute = parseInt(now.toLocaleString('en-US', { timeZone: 'America/New_York', minute: '2-digit' }));

      // Build comprehensive business data
      const businessData = allBusinesses.map(b => {
        const category = categories.find(c => c.id === b.category_id);
        return {
          name: b.business_name,
          category: category?.name || 'Other',
          city: b.city || 'Lakewood',
          address: `${b.address_line1 || ''}${b.address_line2 ? ', ' + b.address_line2 : ''}, ${b.city || ''}, ${b.state || 'NJ'} ${b.zip_code || ''}`.trim(),
          phone: b.phone || '',
          shortDesc: b.short_description || '',
          longDesc: b.long_description || '',
          tags: b.tags ? b.tags.join(', ') : '',
          hours: b.opening_hours_text || b.opening_hours_json ? 
            (b.opening_hours_text || JSON.stringify(b.opening_hours_json)) : 'Hours not specified',
          rating: b.general_rating || 0,
          reviewCount: b.reviews_count || 0
        };
      });

      // Group by category for better context
      const byCategory = {};
      businessData.forEach(b => {
        if (!byCategory[b.category]) byCategory[b.category] = [];
        byCategory[b.category].push(b);
      });

      const contextMessage = `CURRENT DATE & TIME (America/New_York timezone):
${estTime}
Day: ${dayOfWeek}

USER SEARCH QUERY: "${searchQuery}"

INSTRUCTIONS:
- If user asks for "open now", filter businesses based on the current time above
- Only recommend businesses that exist in the database below
- Always mention business names explicitly so they can be matched
- Provide structured, clear results with addresses and phone numbers

AVAILABLE BUSINESSES IN DIRECTORY (${allBusinesses.length} total):

${Object.entries(byCategory).map(([catName, businesses]) => 
  `=== ${catName} (${businesses.length}) ===
${businesses.slice(0, 15).map(b => 
`• ${b.name}
  ${b.city} | ${b.phone || 'No phone'}
  ${b.shortDesc}
  Hours: ${b.hours}
  Tags: ${b.tags || 'none'}
  Rating: ${b.rating > 0 ? `${b.rating}/5 (${b.reviewCount} reviews)` : 'No reviews yet'}`
).join('\n\n')}${businesses.length > 15 ? `\n\n... and ${businesses.length - 15} more in this category` : ''}`
).join('\n\n')}

RESPOND WITH:
- Exact business names from the list above
- Whether each is open now (if relevant to query)
- Full address and phone
- Brief helpful description
- Only real businesses from this database`;

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
        <div className="w-full">
          {/* Results Area */}
          <div className="w-full">
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

                {/* Results Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Results Column */}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900 mb-6">
                      {matchedBusinesses.length} Result{matchedBusinesses.length !== 1 ? 's' : ''}
                    </p>

                    {matchedBusinesses.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {matchedBusinesses.map((business) => (
                            <BusinessCard key={business.id} business={business} />
                          ))}
                        </div>

                        {/* Advanced Search Section */}
                        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-cyan-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                              Advance your current search
                            </h2>
                          </div>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.target.querySelector('input');
                            if (input?.value?.trim()) {
                              window.location.href = createPageUrl(`SearchResults?query=${encodeURIComponent(input.value.trim())}`);
                            }
                          }} className="flex gap-3">
                            <div className="flex-1 relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Refine your search with AI..."
                                className="w-full pl-10 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
                                defaultValue={searchQuery}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    window.location.href = createPageUrl(`SearchResults?query=${encodeURIComponent(e.target.value.trim())}`);
                                  }
                                }}
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
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-lg">No matches found</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Try rephrasing your search query
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Map Column */}
                  <div className="hidden lg:block w-[40%] max-w-[600px] flex-shrink-0">
                    <div className="sticky top-4 h-[calc(100vh-2rem)] rounded-xl overflow-hidden shadow-lg border border-gray-200">
                      <BusinessMap businesses={matchedBusinesses} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}