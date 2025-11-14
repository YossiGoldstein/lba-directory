import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function FiltersPanel({ 
  categories, 
  filters, 
  onFiltersChange, 
  onApply, 
  onReset 
}) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-cyan-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Category</Label>
        <Select 
          value={filters.category || "all"} 
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Location</Label>
        <Select 
          value={filters.location || "all"} 
          onValueChange={(value) => handleFilterChange("location", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="downtown">Downtown</SelectItem>
            <SelectItem value="west">West Side</SelectItem>
            <SelectItem value="east">East Side</SelectItem>
            <SelectItem value="north">North</SelectItem>
            <SelectItem value="south">South</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deals Filter */}
      <div className="flex items-center space-x-2 py-2">
        <Checkbox 
          id="hasDeals" 
          checked={filters.hasDeals || false}
          onCheckedChange={(checked) => handleFilterChange("hasDeals", checked)}
        />
        <Label 
          htmlFor="hasDeals" 
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          Only show businesses with active deals
        </Label>
      </div>

      {/* Sort Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Sort By</Label>
        <Select 
          value={filters.sortBy || "relevance"} 
          onValueChange={(value) => handleFilterChange("sortBy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Relevance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
            <SelectItem value="rating_desc">Highest Rated</SelectItem>
            <SelectItem value="reviews_desc">Most Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t">
        <Button 
          onClick={onApply} 
          className="w-full bg-cyan-600 hover:bg-cyan-700"
        >
          Apply Filters
        </Button>
        <Button 
          onClick={onReset} 
          variant="outline" 
          className="w-full"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}