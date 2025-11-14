import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function DealsOverviewTab() {
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: async () => {
      const dealList = await base44.entities.Deal.list();
      return dealList.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      return await base44.entities.Business.list();
    }
  });

  const toggleDealMutation = useMutation({
    mutationFn: async ({ dealId, isActive }) => {
      return await base44.entities.Deal.update(dealId, { is_active: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
      toast.success("Deal status updated!");
    },
    onError: () => {
      toast.error("Failed to update deal");
    }
  });

  const getBusinessName = (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    return business ? business.business_name : "Unknown Business";
  };

  const isExpiringSoon = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isActive = (deal) => {
    if (!deal.is_active) return false;
    const now = new Date();
    const start = new Date(deal.start_date);
    const end = new Date(deal.end_date);
    return start <= now && end >= now;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading deals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Total deals: {deals.length} • Active: {deals.filter(d => isActive(d)).length}
        </p>

        {/* Deals Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Deal Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Business</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Badge</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">End Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr 
                  key={deal.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    isExpiringSoon(deal.end_date) ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{deal.title}</div>
                    {deal.description && (
                      <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {deal.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {getBusinessName(deal.business_id)}
                  </td>
                  <td className="py-3 px-4">
                    {deal.badge_text && (
                      <Badge variant="outline">{deal.badge_text}</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(deal.start_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(deal.end_date).toLocaleDateString()}
                    {isExpiringSoon(deal.end_date) && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                        <Calendar className="w-3 h-3" />
                        Expiring soon
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isActive(deal) ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : deal.is_active ? (
                      <Badge className="bg-blue-500">Scheduled</Badge>
                    ) : (
                      <Badge className="bg-gray-500">Inactive</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleDealMutation.mutate({ dealId: deal.id, isActive: deal.is_active })}
                      className="gap-2"
                    >
                      {deal.is_active ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {deals.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No deals found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}