import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function DealsSection({ deals }) {
  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Tag className="w-6 h-6 text-cyan-600" />
        Current Deals & Promotions
      </h2>

      <div className="grid gap-4">
        {deals.map((deal) => (
          <Card key={deal.id} className="border-2 border-green-200 bg-green-50/30">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                {deal.badge_text && (
                  <Badge className="bg-green-600 text-white">
                    {deal.badge_text}
                  </Badge>
                )}
              </div>

              {deal.description && (
                <p className="text-gray-700 mb-3">{deal.description}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Valid until {format(new Date(deal.end_date), 'MMM d, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}