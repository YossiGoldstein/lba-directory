import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Edit, Eye } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function BusinessesTab({ onUpdate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: businesses = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const biz = await base44.entities.Business.list();
      return biz.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return await base44.entities.Category.list();
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return await base44.entities.User.list();
    }
  });

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const getOwnerName = (createdBy) => {
    const owner = users.find(u => u.email === createdBy);
    return owner ? owner.full_name : createdBy;
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = 
      business.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryName(business.category_id).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || business.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      approved: "bg-green-500 text-white",
      pending: "bg-orange-500 text-white",
      rejected: "bg-red-500 text-white"
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading businesses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Businesses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, city, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600">
          Showing {filteredBusinesses.length} of {businesses.length} businesses
        </p>

        {/* Businesses Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Business</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{business.business_name}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {getOwnerName(business.created_by)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {getCategoryName(business.category_id)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {business.city || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(business.status)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(business.created_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                      >
                        <a
                          href={`${createPageUrl("BusinessListing")}?id=${business.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert("Edit functionality coming soon");
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No businesses found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}