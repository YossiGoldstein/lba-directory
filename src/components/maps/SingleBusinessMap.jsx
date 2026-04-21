import React, { useEffect, useRef } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";

const DEFAULT_CENTER = { lat: 40.0957, lng: -74.2177 }; // Lakewood, NJ
const GEOCODE_API_KEY = "AIzaSyDfr-zgnbCEuvQGbEll582R4kSes79FDc8";

async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GEOCODE_API_KEY}`
    );
    const data = await res.json();
    if (data.status === "OK" && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export default function SingleBusinessMap({ business, height = "320px" }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const initMap = async () => {
      let position = null;

      // 1. Use stored coords
      if (business?.latitude && business?.longitude && !isNaN(business.latitude) && !isNaN(business.longitude)) {
        position = { lat: Number(business.latitude), lng: Number(business.longitude) };
      } else if (business?.address_line1 && business?.city) {
        // 2. Geocode address
        const address = `${business.address_line1}, ${business.city}, ${business.state || ""} ${business.zip_code || ""}`.trim();
        position = await geocodeAddress(address);
      }

      const center = position || DEFAULT_CENTER;
      const zoom = position ? 15 : 13;

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      if (!position) return;

      const logoUrl = business?.logo_url ? fixImageUrl(business.logo_url) : null;
      const initial = (business?.business_name || "?").charAt(0).toUpperCase();

      const markerDiv = document.createElement("div");
      markerDiv.style.cssText = `
        width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        background: white; display: flex; align-items: center; justify-content: center;
      `;

      if (logoUrl) {
        const img = document.createElement("img");
        img.src = logoUrl;
        img.alt = business.business_name;
        img.style.cssText = "width:100%;height:100%;object-fit:cover;";
        img.onerror = () => {
          markerDiv.innerHTML = `<span style="font-weight:bold;font-size:18px;color:white;">${initial}</span>`;
          markerDiv.style.background = "linear-gradient(135deg,#0891b2,#06b6d4)";
        };
        markerDiv.appendChild(img);
      } else {
        markerDiv.style.background = "linear-gradient(135deg,#0891b2,#06b6d4)";
        markerDiv.innerHTML = `<span style="font-weight:bold;font-size:18px;color:white;">${initial}</span>`;
      }

      if (window.google.maps.marker?.AdvancedMarkerElement) {
        new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          content: markerDiv,
          title: business?.business_name,
        });
      } else {
        new window.google.maps.Marker({
          map,
          position,
          title: business?.business_name,
        });
      }
    };

    initMap();
  }, [business?.latitude, business?.longitude, business?.address_line1, business?.city, business?.logo_url]);

  return (
    <div style={{ height, width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}