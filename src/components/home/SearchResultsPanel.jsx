import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Map } from "lucide-react";
import BusinessResultCard from "../chat/BusinessResultCard";
import ReactMarkdown from "react-markdown";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function SearchResultsPanel({ 
  agentResponse, 
  businesses, 
  onContinueInChat,
  isLoading 
}) {
  // Filter businesses with valid coordinates for map
  const businessesWithCoords = businesses?.filter(b => b.latitude && b.longitude) || [];
  
  // Default center: Lakewood, NJ
  const defaultCenter = [40.0978, -74.2176];
  const mapCenter = businessesWithCoords.length > 0 
    ? [businessesWithCoords[0].latitude, businessesWithCoords[0].longitude]
    : defaultCenter;
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Searching for the best matches...</p>
            <p className="text-sm text-gray-500 mt-2">Our AI assistant is analyzing your request</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agentResponse) {
    return null;
  }

  return (
    <section className="bg-blue-50 py-12">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
          {/* Main Results Column */}
          <div className="flex-1 min-w-0 px-0 lg:pr-6 overflow-y-auto lg:h-[calc(100vh-12rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Search Results</h2>
            </div>

            {/* Business Results */}
            {businesses && businesses.length > 0 ? (
              <>
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {businesses.length} Result{businesses.length !== 1 ? 's' : ''} Found
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 auto-rows-fr">
                  {businesses.map((business) => (
                    <BusinessResultCard 
                      key={business.id} 
                      business={business} 
                      hasActiveDeals={business.has_deals || false}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-lg">No specific matches found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try refining your search or browse our categories
                </p>
              </div>
            )}

            {/* AI Assistant Panel - Mobile (After Results) */}
            <div className="lg:hidden mt-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
                    <ReactMarkdown
                      className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600"
                      components={{
                        a: ({ children, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="underline">
                            {children}
                          </a>
                        ),
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      }}
                    >
                      {agentResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                <Button
                  onClick={onContinueInChat}
                  variant="outline"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Continue in chat
                </Button>
              </div>
            </div>
          </div>

          {/* Map Column - Fixed position on desktop */}
          <div className="hidden lg:block w-[40%] max-w-[600px] flex-shrink-0">
            <div className="sticky top-4 h-[calc(100vh-2rem)] rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <MapContainer
                center={mapCenter}
                zoom={businessesWithCoords.length > 0 ? 12 : 13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {businessesWithCoords.map((business) => (
                  <Marker
                    key={business.id}
                    position={[business.latitude, business.longitude]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {business.business_name}
                        </h4>
                        {business.short_description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {business.short_description.slice(0, 100)}...
                          </p>
                        )}
                        <a
                          href={createPageUrl(`BusinessListing?id=${business.id}`)}
                          className="text-cyan-600 text-sm font-medium hover:underline"
                        >
                          View Details →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}