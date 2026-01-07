import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function BusinessMap({ businesses }) {
  const [center, setCenter] = useState([40.0960, -74.2179]); // Lakewood, NJ default

  // Calculate center based on businesses with valid coordinates
  useEffect(() => {
    const validBusinesses = businesses.filter(b => b.latitude && b.longitude);
    
    if (validBusinesses.length > 0) {
      const avgLat = validBusinesses.reduce((sum, b) => sum + b.latitude, 0) / validBusinesses.length;
      const avgLng = validBusinesses.reduce((sum, b) => sum + b.longitude, 0) / validBusinesses.length;
      setCenter([avgLat, avgLng]);
    }
  }, [businesses]);

  const businessesWithCoords = businesses.filter(b => b.latitude && b.longitude);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={center}
        zoom={13}
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
              <div className="text-sm">
                <h3 className="font-bold text-gray-900 mb-1">
                  {business.business_name}
                </h3>
                {business.address_line1 && (
                  <p className="text-gray-600 text-xs mb-2">
                    {business.address_line1}, {business.city}
                  </p>
                )}
                <Link
                  to={createPageUrl(`BusinessListing?id=${business.id}`)}
                  className="text-cyan-600 hover:text-cyan-700 text-xs font-medium underline"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}