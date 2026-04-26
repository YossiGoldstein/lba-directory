import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, ArrowRight, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";

export default function LatestDeals({ deals, businesses }) {
  const getBusinessName = (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    return business?.business_name || "Business";
  };

  const getBusinessSlug = (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    return business?.slug || business?.id;
  };

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
            <Tag className="w-4 h-4" />
            Hot Deals
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Deals & Promotions
          </h2>
          <p className="text-lg text-gray-600">
            Don't miss out on these limited-time offers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => {
            const businessId = getBusinessSlug(deal.business_id);
            
            return (
              <Card key={deal.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-green-500">
                <div className="p-6">
                  {/* Badge */}
                  {deal.badge_text && (
                    <Badge className="bg-red-500 text-white font-semibold mb-4 text-xs">
                      {deal.badge_text}
                    </Badge>
                  )}

                  {/* Deal Title */}
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {deal.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {deal.description}
                  </p>

                  {/* Business Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">At: {getBusinessName(deal.business_id)}</span>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Valid until {format(new Date(deal.end_date), "MMM d, yyyy")}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all"
                    asChild
                  >
                    <Link to={`/businesslisting/${businessId}`}>
                      View Business <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}