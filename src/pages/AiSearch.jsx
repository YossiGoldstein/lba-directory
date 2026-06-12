import React, { useState, useEffect } from "react";
import { dealStart, dealEnd } from "@/lib/dealDates";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import BusinessCard from "@/components/category/BusinessCard";

export default function AiSearch() {
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    base44.entities.Deal.list().then(setDeals).catch(() => setDeals([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("query");
    if (q) {
      setQuery(q);
      setInputValue(q);
      runSearch(q);
    }
  }, []);

  const hasActiveDeals = (businessId) => {
    const now = new Date();
    return deals.some((deal) => {
      if (deal.business_id !== businessId || !deal.is_active) return false;
      const start = dealStart(deal);
      const end = dealEnd(deal);
      return start <= now && end >= now;
    });
  };

  const runSearch = async (q) => {
    if (!q?.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const response = await base44.functions.invoke("searchBusinesses", { query: q.trim() });
      setBusinesses(response.data?.businesses || []);
    } catch {
      setBusinesses([]);
    }
    setLoading(false);
    setSearched(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    const q = inputValue.trim();
    setQuery(q);
    runSearch(q);
    const url = new URL(window.location.href);
    url.searchParams.set("query", q);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link to={createPageUrl("Home")} className="text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-semibold text-gray-900 text-sm">Search Results</span>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search for businesses, services, categories..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && searched && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {businesses.length > 0
                ? `${businesses.length} result${businesses.length !== 1 ? "s" : ""} for "${query}"`
                : `No results found for "${query}"`}
            </p>
            {businesses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} hasActiveDeals={hasActiveDeals(business.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-base font-medium text-gray-500">No businesses found</p>
                <p className="text-sm text-gray-400 mt-1">Try different keywords or browse by category</p>
                <Link
                  to={createPageUrl("Home")}
                  className="mt-4 inline-block text-blue-600 text-sm underline"
                >
                  Back to Home
                </Link>
              </div>
            )}
          </>
        )}

        {!loading && !searched && (
          <div className="text-center py-24">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-base font-medium text-gray-500">Enter a search above to find local businesses</p>
          </div>
        )}
      </div>
    </div>
  );
}
