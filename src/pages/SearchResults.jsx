import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";
import BusinessCard from "../components/category/BusinessCard";
import BusinessMap from "../components/category/BusinessMap";

export default function SearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("query") || "";

  const [isSearching, setIsSearching] = useState(true);
  const [aiResponse, setAiResponse] = useState("");
  const [matchedBusinesses, setMatchedBusinesses] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await base44.functions.invoke("searchBusinesses", { query: searchQuery });
      const data = response.data;
      setMatchedBusinesses(data.businesses || []);
      setAiResponse(data.aiReply || "");
    } catch (error) {
      console.error("Search failed:", error);
      setAiResponse("Something went wrong. Please try again.");
      setMatchedBusinesses([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
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

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSearching ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-gray-600">Searching for the best matches...</p>
              <p className="text-sm text-gray-500 mt-2">AI is analyzing your request</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-6">
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

                    <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-cyan-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Refine your search</h2>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.target.querySelector('input');
                        if (input?.value?.trim()) {
                          window.location.href = createPageUrl(`SearchResults?query=${encodeURIComponent(input.value.trim())}`);
                        }
                      }} className="flex gap-3">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Refine your search..."
                            className="w-full pl-10 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
                            defaultValue={searchQuery}
                          />
                        </div>
                        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 h-12 px-8">
                          Search
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-lg">No matches found</p>
                    <p className="text-sm text-gray-500 mt-2">Try rephrasing your search query</p>
                  </div>
                )}
              </div>

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
  );
}