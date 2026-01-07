import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Create custom marker with business logo
const createCustomIcon = (logoUrl, businessName) => {
  const iconHtml = logoUrl 
    ? `<div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); background: white;">
         <img src="${logoUrl}" alt="${businessName}" style="width: 100%; height: 100%; object-fit: cover;" />
       </div>`
    : `<div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
         ${businessName.charAt(0)}
       </div>`;

  return L.divIcon({
    html: iconHtml,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export default function BusinessMap({ businesses }) {
  const [center, setCenter] = useState([40.0960, -74.2179]); // Lakewood, NJ default

  const businessesWithCoords = businesses.filter(b => b.latitude && b.longitude);

  useEffect(() => {
    if (businessesWithCoords.length > 0) {
      const avgLat = businessesWithCoords.reduce((sum, b) => sum + b.latitude, 0) / businessesWithCoords.length;
      const avgLng = businessesWithCoords.reduce((sum, b) => sum + b.longitude, 0) / businessesWithCoords.length;
      setCenter([avgLat, avgLng]);
    }
  }, [businessesWithCoords.length]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 relative">
      {businessesWithCoords.length === 0 && (
        <div className="absolute inset-0 z-[1000] bg-white/95 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-gray-900 font-semibold mb-2">אין מיקומים זמינים</p>
            <p className="text-sm text-gray-600">
              {businesses.length} עסקים נמצאו, אבל אין להם קואורדינטות עדיין.
            </p>
          </div>
        </div>
      )}
      
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
            icon={createCustomIcon(business.logo_url, business.business_name)}
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