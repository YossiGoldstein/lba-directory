import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Building2 } from "lucide-react";

export default function BusinessHeader({ business, category }) {
  const statusColors = {
    approved: "bg-green-600 text-white",
    pending: "bg-yellow-500 text-white",
    rejected: "bg-red-600 text-white",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Logo & Info */}
        <div className="flex items-start gap-4 flex-1">
          {/* Logo */}
          <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-200">
            {business.logo_url ? (
              <img 
                src={business.logo_url} 
                alt={business.business_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-10 h-10 text-gray-400" />
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {business.business_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {category && (
                <span className="text-sm text-cyan-600 font-medium">
                  {category.name}
                </span>
              )}
              {(business.city || business.state) && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {business.city}
                    {business.city && business.state && ", "}
                    {business.state}
                  </span>
                </>
              )}
            </div>

            {/* Status Badge */}
            <Badge className={statusColors[business.status] || "bg-gray-500"}>
              {business.status === "approved" && "✓ Approved"}
              {business.status === "pending" && "⏳ Pending Approval"}
              {business.status === "rejected" && "✗ Rejected"}
            </Badge>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            variant="outline"
            className="gap-2"
          >
            <Link to={`/businesslisting/${business.slug || business.id}`}>
              <ExternalLink className="w-4 h-4" />
              View Public Page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}