import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapView({ businesses, getCategoryName }) {
  const [mapCenter, setMapCenter] = useState([40.0959, -74.2227]); // Lakewood, NJ
  const [mapZoom, setMapZoom] = useState(13);

  const businessesWithCoords = businesses.filter(
    (b) => b.latitude && b.longitude
  );

  useEffect(() => {
    if (businessesWithCoords.length > 0) {
      // Calculate center based on all markers
      const avgLat =
        businessesWithCoords.reduce((sum, b) => sum + b.latitude, 0) /
        businessesWithCoords.length;
      const avgLng =
        businessesWithCoords.reduce((sum, b) => sum + b.longitude, 0) /
        businessesWithCoords.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [businesses]);

  if (businessesWithCoords.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Locations Available
        </h3>
        <p className="text-gray-600">
          None of the businesses in the current results have location data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-[600px] w-full">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {businessesWithCoords.map((business) => (
            <Marker
              key={business.id}
              position={[business.latitude, business.longitude]}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-bold text-gray-900 mb-1">
                    {business.business_name}
                  </h4>
                  <p className="text-sm text-cyan-600 mb-2">
                    {getCategoryName(business.category_id)}
                  </p>
                  {business.short_description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {business.short_description}
                    </p>
                  )}
                  {(business.city || business.state) && (
                    <p className="text-xs text-gray-500 mb-3">
                      {business.city}
                      {business.city && business.state && ", "}
                      {business.state}
                    </p>
                  )}
                  <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700" asChild>
                    <Link to={createPageUrl(`BusinessListing?id=${business.id}`)}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Business count below map */}
      <div className="p-4 bg-gray-50 border-t">
        <p className="text-sm text-gray-600">
          Showing {businessesWithCoords.length} business
          {businessesWithCoords.length !== 1 ? "es" : ""} with location data
        </p>
      </div>
    </div>
  );
}