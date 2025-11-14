import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Clock, Sparkles, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import BusinessResultCard from "../chat/BusinessResultCard";
import ReactMarkdown from "react-markdown";

export default function RecentSearchesTab({ user }) {
  const [activeSearch, setActiveSearch] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [results, setResults] = useState([]);

  // Fetch user's search history
  const { data: searchHistory = [], isLoading } = useQuery({
    queryKey: ["searchHistory", user?.id],
    queryFn: async () => {
      const allSearches = await base44.entities.SearchHistory.list();
      return allSearches
        .filter(s => s.user_id === user.id)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 20); // Last 20 searches
    },
    enabled: !!user?.id,
  });

  // Fetch all businesses
  const { data: allBusinesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const biz = await base44.entities.Business.list();
      return biz.filter(b => b.status === "approved");
    },
  });

  const extractBusinessesFromResponse = (responseText) => {
    const businesses = [];
    const responseLines = responseText.toLowerCase();

    allBusinesses.forEach(business => {
      const businessName = (business.business_name || "").toLowerCase();
      if (businessName && responseLines.includes(businessName)) {
        businesses.push(business);
      }
    });

    return businesses.slice(0, 6);
  };

  const handleShowResults = async (searchItem) => {
    setActiveSearch(searchItem.id);
    setIsSearching(true);
    setAiResponse("");
    setResults([]);

    try {
      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: `Repeat Search: ${searchItem.query}`,
          description: "From search history",
          context: "search_history_repeat"
        }
      });

      await base44.agents.addMessage(conv, {
        role: "user",
        content: `User's previous search: ${searchItem.query}\n\nPlease show relevant results again.`
      });

      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant") {
            setAiResponse(lastMessage.content);
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content);
            setResults(extractedBusinesses);
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
      setAiResponse("Sorry, I encountered an error. Please try again.");
    }
  };

  const handleContinueInChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const handleAskAI = () => {
    handleContinueInChat();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Loading search history...</p>
      </div>
    );
  }

  if (searchHistory.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Search History Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No search history yet. Try searching from the Home Page or ask the AI anything.
          </p>
          <Button
            onClick={handleAskAI}
            className="bg-cyan-600 hover:bg-cyan-700 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Start Searching
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Searches ({searchHistory.length})
      </h3>

      {/* Search History List */}
      <div className="space-y-3">
        {searchHistory.map((search) => (
          <Card key={search.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium mb-1">
                        "{search.query}"
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(search.created_date), { addSuffix: true })}
                        </span>
                        {search.results_count > 0 && (
                          <span>• {search.results_count} results</span>
                        )}
                        {search.page_context && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {search.page_context}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleShowResults(search)}
                  size="sm"
                  variant="outline"
                  disabled={isSearching && activeSearch === search.id}
                >
                  {isSearching && activeSearch === search.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Show Results
                    </>
                  )}
                </Button>
              </div>

              {/* Results Section */}
              {activeSearch === search.id && !isSearching && aiResponse && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* AI Response */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 mb-4 border border-cyan-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">AI Response:</h4>
                        <ReactMarkdown
                          className="prose prose-sm max-w-none prose-p:text-gray-700"
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          }}
                        >
                          {aiResponse}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Business Results */}
                  {results.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {results.map((business) => (
                        <BusinessResultCard key={business.id} business={business} />
                      ))}
                    </div>
                  )}

                  {/* Continue in Chat */}
                  <Button
                    onClick={handleContinueInChat}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Continue in chat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}