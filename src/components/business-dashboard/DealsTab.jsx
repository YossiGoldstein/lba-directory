import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DealsTab({ business }) {
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    badge_text: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const queryClient = useQueryClient();

  // Fetch deals for this business
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["businessDeals", business.id],
    queryFn: async () => {
      const allDeals = await base44.entities.Deal.list();
      return allDeals
        .filter(d => d.business_id === business.id)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData) => {
      return await base44.entities.Deal.create({
        ...dealData,
        business_id: business.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessDeals"] });
      resetForm();
      toast.success("Deal created successfully!");
    },
    onError: () => {
      toast.error("Failed to create deal");
    },
  });

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Deal.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessDeals"] });
      resetForm();
      toast.success("Deal updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update deal");
    },
  });

  // Delete deal mutation
  const deleteDealMutation = useMutation({
    mutationFn: async (dealId) => {
      return await base44.entities.Deal.delete(dealId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessDeals"] });
      toast.success("Deal deleted");
    },
    onError: () => {
      toast.error("Failed to delete deal");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      badge_text: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setEditingDeal(null);
    setShowForm(false);
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || "",
      badge_text: deal.badge_text || "",
      start_date: deal.start_date ? format(new Date(deal.start_date), "yyyy-MM-dd") : "",
      end_date: deal.end_date ? format(new Date(deal.end_date), "yyyy-MM-dd") : "",
      is_active: deal.is_active !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error("Start and end dates are required");
      return;
    }

    if (editingDeal) {
      updateDealMutation.mutate({ id: editingDeal.id, data: formData });
    } else {
      createDealMutation.mutate(formData);
    }
  };

  const handleToggleActive = (deal) => {
    updateDealMutation.mutate({
      id: deal.id,
      data: { ...deal, is_active: !deal.is_active },
    });
  };

  const handleDelete = (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      deleteDealMutation.mutate(dealId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Deals & Promotions
            </CardTitle>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Deal
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deal Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 bg-cyan-50 rounded-lg border border-cyan-200 space-y-4">
              <h3 className="font-semibold text-gray-900">
                {editingDeal ? "Edit Deal" : "Create New Deal"}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="10% off all items"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional details about the deal..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge_text">Badge Text</Label>
                <Input
                  id="badge_text"
                  value={formData.badge_text}
                  onChange={(e) => setFormData({...formData, badge_text: e.target.value})}
                  placeholder="Sale, New, Today Only"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                  {editingDeal ? "Update Deal" : "Create Deal"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Deals List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : deals.length > 0 ? (
            <div className="space-y-3">
              {deals.map(deal => {
                const now = new Date();
                const isActive = deal.is_active && 
                  new Date(deal.start_date) <= now && 
                  new Date(deal.end_date) >= now;

                return (
                  <div
                    key={deal.id}
                    className={`p-4 rounded-lg border ${
                      isActive
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                          {deal.badge_text && (
                            <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full">
                              {deal.badge_text}
                            </span>
                          )}
                          {isActive && (
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        {deal.description && (
                          <p className="text-sm text-gray-600 mb-2">{deal.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {format(new Date(deal.start_date), "MMM d, yyyy")} - {format(new Date(deal.end_date), "MMM d, yyyy")}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleToggleActive(deal)}
                          variant="ghost"
                          size="icon"
                          title={deal.is_active ? "Deactivate" : "Activate"}
                        >
                          {deal.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleEdit(deal)}
                          variant="ghost"
                          size="icon"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(deal.id)}
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>No deals created yet</p>
              <p className="text-sm mt-1">Create your first deal to attract more customers</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}