import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchBar({ onSearch, className = "" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ searchTerm, location });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex flex-col md:flex-row gap-3 bg-white rounded-2xl shadow-lg p-3">
        {/* Search Term */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="What are you looking for?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
          />
        </div>

        {/* Location */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
          <MapPin className="w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="City or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
          />
        </div>

        {/* Search Button */}
        <Button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-xl text-base font-medium"
        >
          Search
        </Button>
      </div>
    </form>
  );
}