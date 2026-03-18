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
      const allBusinesses = await base44.entities.Business.list();
      const approved = allBusinesses.filter(b => b.status === "approved");

      const businessList = approved.map(b => ({
        id: b.id,
        name: b.business_name,
        category_id: b.category_id,
        short_description: b.short_description || "",
        long_description: b.long_description || "",
        tags: (b.tags || []).join(", "),
        ai_tags: (b.ai_tags || []).join(", "),
        city: b.city || "",
        opening_hours_text: b.opening_hours_text || "",
        opening_hours_json: b.opening_hours_json || null,
        by_appointment_only: b.by_appointment_only || false,
      }));

      const now = new Date();
      const estTime = now.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const prompt = `You are a smart business directory search engine for LBA Directory in Lakewood, NJ.

Current time: ${estTime}

User query: "${searchQuery}"

Here is the full list of businesses in the directory (JSON):
${JSON.stringify(businessList, null, 2)}

Your job:
1. Find ALL businesses that match the user's query. Be generous — match by category, description, tags, or name.
2. If the user asks for "open now", check opening_hours_json or opening_hours_text against the current time/day. Include businesses that appear to be open.
3. Return a short, friendly response explaining what you found (2-3 sentences max).
4. Return the matching business IDs.

Respond ONLY with valid JSON in this exact format:
{
  "message": "short friendly message about results",
  "business_ids": ["id1", "id2", ...]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            business_ids: { type: "array", items: { type: "string" } }
          }
        }
      });

      const ids = result.business_ids || [];
      const matched = approved.filter(b => ids.includes(b.id));

      setAiResponse(result.message || "");
      setMatchedBusinesses(matched);
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
            {aiResponse && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
                    <ReactMarkdown className="prose prose-sm max-w-none prose-p:text-gray-700">
                      {aiResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

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