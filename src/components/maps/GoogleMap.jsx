import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { fixImageUrl } from "@/components/lib/imageUtils";
import { createPageUrl } from "@/utils";

const DEFAULT_CENTER = { lat: 40.0960, lng: -74.2179 }; // Lakewood, NJ

export default function GoogleMap({ businesses = [], height = "450px" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const validBusinesses = businesses.filter(
    (b) => b.latitude && b.longitude && !isNaN(b.latitude) && !isNaN(b.longitude)
  );

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Calculate center
    let center = DEFAULT_CENTER;
    if (validBusinesses.length > 0) {
      const avgLat = validBusinesses.reduce((sum, b) => sum + Number(b.latitude), 0) / validBusinesses.length;
      const avgLng = validBusinesses.reduce((sum, b) => sum + Number(b.longitude), 0) / validBusinesses.length;
      center = { lat: avgLat, lng: avgLng };
    }

    // Init map
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    // Shared InfoWindow
    const infoWindow = new window.google.maps.InfoWindow();
    infoWindowRef.current = infoWindow;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    validBusinesses.forEach((business) => {
      const logoUrl = business.logo_url ? fixImageUrl(business.logo_url) : null;
      const initial = (business.business_name || "?").charAt(0).toUpperCase();

      // Custom marker HTML
      const markerDiv = document.createElement("div");
      markerDiv.style.cssText = `
        width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        cursor: pointer; background: white;
        display: flex; align-items: center; justify-content: center;
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

      const marker = new window.google.maps.marker.AdvancedMarkerElement
        ? new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: Number(business.latitude), lng: Number(business.longitude) },
            content: markerDiv,
            title: business.business_name,
          })
        : (() => {
            // Fallback to standard Marker if AdvancedMarkerElement unavailable
            const m = new window.google.maps.Marker({
              map,
              position: { lat: Number(business.latitude), lng: Number(business.longitude) },
              title: business.business_name,
            });
            return m;
          })();

      const profileUrl = createPageUrl(`BusinessListing?id=${business.id}`);
      const infoContent = `
        <div style="max-width:220px;font-family:Arial,sans-serif;">
          <h3 style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">
            ${business.business_name}
          </h3>
          ${business.short_description
            ? `<p style="margin:0 0 10px;font-size:13px;color:#4b5563;line-height:1.4;">${business.short_description.slice(0, 100)}${business.short_description.length > 100 ? "…" : ""}</p>`
            : ""}
          <a href="${profileUrl}" style="display:inline-block;background:#0891b2;color:#fff;padding:6px 14px;border-radius:5px;text-decoration:none;font-size:13px;font-weight:600;">
            View Profile
          </a>
        </div>
      `;

      const clickHandler = () => {
        infoWindow.setContent(infoContent);
        if (marker.setMap) {
          // AdvancedMarkerElement
          infoWindow.open({ anchor: marker, map });
        } else {
          infoWindow.open(map, marker);
        }
      };

      if (marker.addListener) {
        marker.addListener("click", clickHandler);
      } else if (marker.element) {
        marker.element.addEventListener("click", clickHandler);
      } else {
        markerDiv.addEventListener("click", clickHandler);
      }

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => {
        if (m.setMap) m.setMap(null);
      });
    };
  }, [validBusinesses.length, businesses]);

  if (validBusinesses.length === 0) {
    return (
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-500"
        style={{ height }}
      >
        <MapPin className="w-10 h-10 text-gray-300" />
        <p className="text-sm">No location data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height, width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}