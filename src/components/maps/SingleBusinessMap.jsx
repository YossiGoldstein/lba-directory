import React, { useEffect, useRef } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";

export default function SingleBusinessMap({ business, height = "320px" }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.google || !business?.latitude || !business?.longitude) return;

    const position = {
      lat: Number(business.latitude),
      lng: Number(business.longitude),
    };

    const map = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const logoUrl = business.logo_url ? fixImageUrl(business.logo_url) : null;
    const initial = (business.business_name || "?").charAt(0).toUpperCase();

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
        title: business.business_name,
      });
    } else {
      new window.google.maps.Marker({
        map,
        position,
        title: business.business_name,
      });
    }
  }, [business?.latitude, business?.longitude, business?.logo_url]);

  return (
    <div style={{ height, width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}