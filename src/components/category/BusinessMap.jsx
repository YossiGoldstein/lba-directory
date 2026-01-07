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
  const [geocodedBusinesses, setGeocodedBusinesses] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Geocode addresses for businesses without coordinates
  useEffect(() => {
    const geocodeBusinesses = async () => {
      const needGeocoding = businesses.filter(b => !b.latitude && !b.longitude && b.address_line1);
      
      if (needGeocoding.length === 0) {
        setGeocodedBusinesses(businesses.filter(b => b.latitude && b.longitude));
        return;
      }

      setIsGeocoding(true);
      const results = [];

      for (const business of needGeocoding) {
        const address = `${business.address_line1}, ${business.city || 'Lakewood'}, ${business.state || 'NJ'}, ${business.zip_code || ''}`;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            results.push({
              ...business,
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon)
            });
          }
          
          // Rate limit: wait 1 second between requests (Nominatim requirement)
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to geocode ${business.business_name}:`, error);
        }
      }

      const existingWithCoords = businesses.filter(b => b.latitude && b.longitude);
      setGeocodedBusinesses([...existingWithCoords, ...results]);
      setIsGeocoding(false);
    };

    geocodeBusinesses();
  }, [businesses]);

  // Calculate center based on geocoded businesses
  useEffect(() => {
    if (geocodedBusinesses.length > 0) {
      const avgLat = geocodedBusinesses.reduce((sum, b) => sum + b.latitude, 0) / geocodedBusinesses.length;
      const avgLng = geocodedBusinesses.reduce((sum, b) => sum + b.longitude, 0) / geocodedBusinesses.length;
      setCenter([avgLat, avgLng]);
    }
  }, [geocodedBusinesses]);

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