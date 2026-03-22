import React, { useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("all");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = location && location !== "all"
      ? `${searchQuery} in ${location}`
      : searchQuery;

    window.location.href = createPageUrl(`SearchResults?query=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Lakewood Business Alliance Directory
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
            Find local businesses, deals, and services in your area – fast.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type="text"
                    placeholder="Search by business, category, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                {/* Location Dropdown */}
                <div className="md:w-48 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border-0 bg-transparent focus:ring-0 text-base text-gray-900"
                  >
                    <option value="all">All Locations</option>
                    <option value="lakewood">Lakewood</option>
                    <option value="jackson">Jackson</option>
                    <option value="toms-river">Toms River</option>
                  </select>
                </div>

                {/* Search Button */}
                <Button 
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Stats */}
          {(
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-blue-100">
              <div>
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm">Local Businesses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">10+</div>
                <div className="text-sm">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-sm">Happy Customers</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}