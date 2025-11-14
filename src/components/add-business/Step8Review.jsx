import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Clock, Image as ImageIcon, TrendingUp, Tag } from "lucide-react";
import { format } from "date-fns";

export default function Step8Review({ data }) {
  const tagsArray = data.tags ? data.tags.split(",").map(t => t.trim()).filter(t => t) : [];
  const deals = data.deals || [];
  const images = data.gallery_images || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{data.business_name || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <span className="ml-2 text-gray-900">{data.category_name || "—"}</span>
              </div>
              {data.short_description && (
                <div>
                  <span className="font-medium text-gray-700">Short Description:</span>
                  <p className="mt-1 text-gray-900">{data.short_description}</p>
                </div>
              )}
              {data.long_description && (
                <div>
                  <span className="font-medium text-gray-700">Full Description:</span>
                  <p className="mt-1 text-gray-900 whitespace-pre-line">{data.long_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {tagsArray.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tagsArray.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location & Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location & Contact
            </h3>
            <div className="space-y-2">
              {data.address_line1 && (
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-900">
                    {data.address_line1}
                    {data.address_line2 && `, ${data.address_line2}`}
                    <br />
                    {data.city}, {data.state} {data.zip_code}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{data.phone || "—"}</span>
              </div>
              {data.email && (
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{data.email}</span>
                </div>
              )}
              {data.website_url && (
                <div>
                  <span className="font-medium text-gray-700">Website:</span>
                  <a href={data.website_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-cyan-600 hover:underline">
                    {data.website_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Hours */}
          {(data.opening_hours_text || data.opening_hours_json) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Opening Hours
              </h3>
              {data.opening_hours_text ? (
                <p className="text-gray-900 whitespace-pre-line">{data.opening_hours_text}</p>
              ) : (
                <div className="space-y-1">
                  {Object.entries(data.opening_hours_json || {}).map(([day, hours]) => {
                    const dayName = day.replace("_", " ");
                    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                    
                    return (
                      <div key={day} className="flex gap-2">
                        <span className="font-medium text-gray-700 w-32">{capitalizedDay}:</span>
                        <span className="text-gray-900">
                          {hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Gallery */}
          {images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Gallery ({images.length} images)
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deals */}
          {deals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Deals ({deals.length})
              </h3>
              <div className="space-y-2">
                {deals.map((deal, idx) => (
                  <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{deal.title}</span>
                      {deal.badge_text && (
                        <Badge className="bg-green-600 text-white">{deal.badge_text}</Badge>
                      )}
                    </div>
                    {deal.description && (
                      <p className="text-sm text-gray-600 mb-1">{deal.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Valid: {deal.start_date} to {deal.end_date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          ✓ Your business listing will be submitted for approval. Once approved by our team, it will appear in the directory and be searchable by customers.
        </p>
      </div>
    </div>
  );
}