import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ExternalLink, Sparkles, AlertTriangle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function PendingApprovalsTab({ onUpdate }) {
  const queryClient = useQueryClient();
  const [rejectionReasons, setRejectionReasons] = useState({});

  const { data: pendingBusinesses = [], isLoading } = useQuery({
    queryKey: ["pending-businesses"],
    queryFn: async () => {
      const biz = await base44.entities.Business.list();
      return biz
        .filter(b => b.status === "pending")
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return await base44.entities.Category.list();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (businessId) => {
      return await base44.entities.Business.update(businessId, { status: "approved" });
    },
    onSuccess: async (_, businessId) => {
      queryClient.invalidateQueries({ queryKey: ["pending-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      toast.success("Business approved successfully!");
      if (onUpdate) onUpdate();
    },
    onError: () => {
      toast.error("Failed to approve business");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ businessId, reason }) => {
      return await base44.entities.Business.update(businessId, {
        status: "rejected",
        admin_notes: reason || "Rejected by admin"
      });
    },
    onSuccess: async (_, { businessId, reason }) => {
      queryClient.invalidateQueries({ queryKey: ["pending-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      toast.success("Business rejected");

      // Send rejection email
      try {
        await base44.functions.invoke('sendBusinessEmail', {
          type: 'business_rejected',
          businessId: businessId,
          data: {
            rejectionReason: reason || "Your business submission did not meet our guidelines. Please review and update your listing."
          }
        });
      } catch (error) {
        console.error("Failed to send rejection email:", error);
      }

      if (onUpdate) onUpdate();
    },
    onError: () => {
      toast.error("Failed to reject business");
    }
  });

  const getMissingFields = (business) => {
    const checks = [
      { field: "Logo",            missing: !business.logo_url },
      { field: "Short Description", missing: !business.short_description },
      { field: "Full Description",  missing: !business.long_description },
      { field: "Phone",           missing: !business.phone },
      { field: "Email",           missing: !business.email },
      { field: "Address",         missing: !business.address_line1 },
      { field: "City",            missing: !business.city },
      { field: "ZIP Code",        missing: !business.zip_code },
      { field: "Opening Hours",   missing: !business.opening_hours_text },
      { field: "Website",         missing: !business.website_url },
      { field: "Tags",            missing: !business.tags || business.tags.length === 0 },
      { field: "Gallery Photos",  missing: !business.gallery_images || business.gallery_images.length === 0 },
    ];
    return checks.filter(c => c.missing).map(c => c.field);
  };

  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
  };

  const formatOpeningHours = (business) => {
    if (business.opening_hours_json) {
      const days = [
        { key: "sunday", label: "Sunday" },
        { key: "monday", label: "Monday" },
        { key: "tuesday", label: "Tuesday" },
        { key: "wednesday", label: "Wednesday" },
        { key: "thursday", label: "Thursday" },
        { key: "friday", label: "Friday" },
        { key: "saturday", label: "Saturday" },
        { key: "motzei_shabbos", label: "Motzei Shabbos" },
      ];
      return days
        .map(({ key, label }) => {
          const day = business.opening_hours_json[key];
          if (!day) return null;
          if (day.closed) return `${label}: Closed`;
          return `${label}: ${formatTime12h(day.open)} - ${formatTime12h(day.close)}`;
        })
        .filter(Boolean)
        .join("\n");
    }
    if (business.opening_hours_text) {
      return business.opening_hours_text.replace(
        /\b(\d{1,2}):(\d{2})\b/g,
        (_, h, m) => {
          const hour = parseInt(h);
          const period = hour >= 12 ? "PM" : "AM";
          const h12 = hour % 12 || 12;
          return `${h12}:${m} ${period}`;
        }
      );
    }
    return "Not specified";
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const handleApprove = (businessId) => {
    if (confirm("Are you sure you want to approve this business?")) {
      approveMutation.mutate(businessId);
    }
  };

  const handleReject = (businessId) => {
    const reason = rejectionReasons[businessId] || "";
    if (confirm("Are you sure you want to reject this business?")) {
      rejectMutation.mutate({ businessId, reason });
      setRejectionReasons({ ...rejectionReasons, [businessId]: "" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading pending approvals...</p>
        </CardContent>
      </Card>
    );
  }

  if (pendingBusinesses.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending businesses to review at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({pendingBusinesses.length})</CardTitle>
        </CardHeader>
      </Card>

      {pendingBusinesses.map((business) => (
        <Card key={business.id} className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {business.business_name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-cyan-600">{getCategoryName(business.category_id)}</Badge>
                    <Badge variant="outline">{business.city || "No city"}</Badge>
                    <Badge className="bg-orange-500">Pending Review</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    📧 {business.email || business.created_by} • Submitted: {new Date(business.created_date).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`${createPageUrl("BusinessListing")}?id=${business.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview
                  </a>
                </Button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Short Description</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {business.short_description || "No description provided"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Contact</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    📞 {business.phone || "N/A"}<br />
                    📧 {business.email || "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Address</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {business.address_line1 || "N/A"}<br />
                    {business.city}, {business.state} {business.zip_code}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Opening Hours</Label>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                    {formatOpeningHours(business)}
                  </p>
                </div>
              </div>

              {/* Missing Fields */}
              {(() => {
                const missing = getMissingFields(business);
                if (missing.length === 0) return (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 font-medium">All fields complete</span>
                  </div>
                );
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-amber-800">Missing Fields ({missing.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {missing.map(field => (
                        <span key={field} className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded-full">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Tags */}
              {business.tags && business.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {business.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              {business.long_description && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Full Description</Label>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                    {business.long_description}
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              <div>
                <Label htmlFor={`reason-${business.id}`} className="text-sm font-semibold text-gray-700">
                  Rejection Reason (Optional)
                </Label>
                <Textarea
                  id={`reason-${business.id}`}
                  value={rejectionReasons[business.id] || ""}
                  onChange={(e) => setRejectionReasons({ ...rejectionReasons, [business.id]: e.target.value })}
                  placeholder="Enter reason for rejection (will be sent to business owner)"
                  rows={2}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleApprove(business.id)}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(business.id)}
                  variant="destructive"
                  className="gap-2"
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => toast.info("AI Review feature coming soon")}
                >
                  <Sparkles className="w-4 h-4" />
                  Send for AI Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}