import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Building2 } from "lucide-react";

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  closed: "bg-green-100 text-green-800",
};

export default function ServiceInquiriesTab() {
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["service-inquiries"],
    queryFn: () => base44.entities.ServiceInquiry.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ServiceInquiry.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["service-inquiries"] }),
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading inquiries...</div>;
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No service inquiries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Service Inquiries</h2>
        <Badge className="bg-blue-100 text-blue-800">{inquiries.filter(i => i.status === 'new').length} New</Badge>
      </div>

      <div className="space-y-3">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{inquiry.full_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inquiry.status]}`}>
                    {inquiry.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {inquiry.business_name}
                  </span>
                  <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 hover:text-cyan-600">
                    <Phone className="w-3.5 h-3.5" /> {inquiry.phone}
                  </a>
                  <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 hover:text-cyan-600">
                    <Mail className="w-3.5 h-3.5" /> {inquiry.email}
                  </a>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(inquiry.services || []).map((service) => (
                    <span key={service} className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-1 rounded-full">
                      {service}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(inquiry.created_date).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>

              <div className="flex-shrink-0">
                <Select
                  value={inquiry.status}
                  onValueChange={(val) => updateMutation.mutate({ id: inquiry.id, status: val })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}