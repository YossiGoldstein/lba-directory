import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Edit, Eye, Trash2, Plus, Mail, Building2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import AdminEditBusinessModal from "./AdminEditBusinessModal";

export default function BusinessesTab({ onUpdate }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [claimModalBusiness, setClaimModalBusiness] = useState(null);
  const [claimEmail, setClaimEmail] = useState("");
  const [claimSending, setClaimSending] = useState(false);

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

  const getOwnerInfo = (business) => {
    const contactEmail = business.email || business.created_by;
    const addedBy = business.created_by;
    return { contactEmail, addedBy };
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch =
      business.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryName(business.category_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.phone?.includes(searchQuery);
    
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

  const deleteMutation = useMutation({
    mutationFn: async (businessId) => {
      return await base44.entities.Business.delete(businessId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      toast.success("Business deleted successfully!");
      if (onUpdate) onUpdate();
    },
    onError: () => {
      toast.error("Failed to delete business");
    }
  });

  const sendPasswordEmailMutation = useMutation({
    mutationFn: async (businessId) => {
      const response = await base44.functions.invoke('sendPasswordSetupEmail', { businessId });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Password setup email sent to ${data.business}`);
    },
    onError: (error) => {
      toast.error("Failed to send email: " + error.message);
    }
  });

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setIsEditModalOpen(true);
  };

  const handleDelete = (business) => {
    if (confirm(`Are you sure you want to delete "${business.business_name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(business.id);
    }
  };

  const handleEditSave = () => {
    refetch();
    if (onUpdate) onUpdate();
  };

  const handleAddNew = () => {
    window.open(createPageUrl("AddBusiness"), "_blank");
  };

  const handleSendPasswordEmail = (business) => {
    if (confirm(`Send password setup email to ${business.business_name} (${business.email})?`)) {
      sendPasswordEmailMutation.mutate(business.id);
    }
  };

  const handleOpenClaimModal = (business) => {
    setClaimModalBusiness(business);
    setClaimEmail(business.email || "");
  };

  const handleSendClaimEmail = async () => {
    if (!claimEmail || !claimEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setClaimSending(true);
    try {
      const response = await base44.functions.invoke("sendClaimEmail", {
        businessId: claimModalBusiness.id,
        targetEmail: claimEmail,
        adminSent: true,
      });
      if (response.data?.success) {
        toast.success(`Claim email sent to ${claimEmail}`);
        setClaimModalBusiness(null);
        setClaimEmail("");
      } else {
        toast.error(response.data?.error || "Failed to send claim email");
      }
    } catch (error) {
      console.error("Claim email error:", error);
      toast.error(error.message || "Failed to send claim email");
    } finally {
      setClaimSending(false);
    }
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Businesses</CardTitle>
            <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700 gap-2">
              <Plus className="w-4 h-4" />
              Add New Business
            </Button>
          </div>
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
                    <div>{business.email || "—"}</div>
                    {business.created_by && business.created_by !== business.email && business.created_by !== "anonymous" && (
                      <div className="text-xs text-gray-400">Added by: {business.created_by === "office@lbadirectory.com" || business.created_by === "ydg7780@gmail.com" ? "Admin" : business.created_by}</div>
                    )}
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
                        title="View"
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
                        onClick={() => handleEdit(business)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {business.email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendPasswordEmail(business)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title={business.password_hash ? "Send Password Reset Email" : "Send Password Setup Email"}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      {!business.owner_id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenClaimModal(business)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Send Claim Business Email"
                        >
                          <Building2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(business)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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

    <AdminEditBusinessModal
      business={editingBusiness}
      isOpen={isEditModalOpen}
      onClose={() => {
        setIsEditModalOpen(false);
        setEditingBusiness(null);
      }}
      onSave={handleEditSave}
    />

    {/* Claim Email Modal */}
    {claimModalBusiness && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-xl font-bold text-gray-900">Send Claim Email</h3>
            <p className="text-sm text-gray-500 mt-1">
              Send a claim link for <strong>{claimModalBusiness.business_name}</strong>
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Owner's Email
              </label>
              <input
                type="email"
                value={claimEmail}
                onChange={(e) => setClaimEmail(e.target.value)}
                placeholder="owner@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                The business owner will receive a link to claim this listing.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSendClaimEmail}
                disabled={claimSending}
                className="flex-1 bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:opacity-90 text-white font-semibold"
              >
                {claimSending ? "Sending..." : "Send Claim Email"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setClaimModalBusiness(null); setClaimEmail(""); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}