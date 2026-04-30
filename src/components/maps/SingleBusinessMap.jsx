import React, { useEffect, useRef } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";

const DEFAULT_CENTER = { lat: 40.0957, lng: -74.2177 }; // Lakewood, NJ
const MAP_ID = "DEMO_MAP_ID";

async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { "User-Agent": "LBADirectory/1.0 (lbadirectory.com)" } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function buildMarkerDiv(business) {
  const logoUrl = business?.logo_url ? fixImageUrl(business.logo_url) : null;
  const initial = (business?.business_name || "?").charAt(0).toUpperCase();

  const div = document.createElement("div");
  div.style.cssText = [
    "width:56px;height:56px;border-radius:50%;overflow:hidden;",
    "border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);",
    "background:white;display:flex;align-items:center;justify-content:center;",
    "cursor:pointer;",
  ].join("");

  if (logoUrl) {
    const img = document.createElement("img");
    img.src = logoUrl;
    img.alt = business.business_name || "";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;";
    img.onerror = () => {
      div.innerHTML = `<span style="font-weight:bold;font-size:22px;color:white;">${initial}</span>`;
      div.style.background = "linear-gradient(135deg,#0891b2,#06b6d4)";
    };
    div.appendChild(img);
  } else {
    div.style.background = "linear-gradient(135deg,#0891b2,#06b6d4)";
    div.innerHTML = `<span style="font-weight:bold;font-size:22px;color:white;">${initial}</span>`;
  }

  return div;
}

function buildFallbackIcon(business) {
  const dpr = window.devicePixelRatio || 1;
  const display = 56;
  const px = display * dpr;
  const initial = (business?.business_name || "?").charAt(0).toUpperCase();
  const c = document.createElement("canvas");
  c.width = px; c.height = px;
  const ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);
  const r = display / 2;
  ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.fillStyle = "#0891b2"; ctx.fill();
  ctx.beginPath(); ctx.arc(r, r, r - 2, 0, Math.PI * 2);
  ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = `bold ${Math.round(display * 0.4)}px Arial`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(initial, r, r);
  return c.toDataURL();
}

export default function SingleBusinessMap({ business, height = "320px" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (cancelled || !mapRef.current) return;

      // Use importLibrary to ensure libraries are fully loaded
      const { Map } = await window.google.maps.importLibrary("maps");
      if (cancelled || !mapRef.current) return;

      // Resolve position: stored coords → geocode full address → geocode city
      let position = null;
      if (
        business?.latitude &&
        business?.longitude &&
        !isNaN(Number(business.latitude)) &&
        !isNaN(Number(business.longitude))
      ) {
        position = { lat: Number(business.latitude), lng: Number(business.longitude) };
      } else if (business?.address_line1 && business?.city) {
        const address = [
          business.address_line1,
          business.city,
          business.state || "",
          business.zip_code || "",
        ]
          .filter(Boolean)
          .join(", ");
        position = await geocodeAddress(address);
      } else if (business?.city) {
        position = await geocodeAddress(
          `${business.city}${business.state ? ", " + business.state : ", NJ"}`
        );
      }

      if (cancelled || !mapRef.current) return;

      const center = position || DEFAULT_CENTER;
      const zoom = position
        ? business?.latitude
          ? 15  // precise coords
          : 14  // geocoded
        : 12;   // fallback city view

      // Reuse existing map instance rather than rebuilding the DOM node
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new Map(mapRef.current, {
          center,
          zoom,
          mapId: MAP_ID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      } else {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(zoom);
      }

      const map = mapInstanceRef.current;

      // Remove previous marker before placing new one
      if (markerRef.current) {
        try { markerRef.current.setMap(null); } catch (e) {}
        markerRef.current = null;
      }

      if (!position) return;

      const markerDiv = buildMarkerDiv(business);

      try {
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
        if (cancelled) return;
        markerRef.current = new AdvancedMarkerElement({
          map,
          position,
          content: markerDiv,
          title: business?.business_name || "",
        });
      } catch (e) {
        // Fallback to standard marker
        const { Marker } = await window.google.maps.importLibrary("maps");
        const iconUrl = buildFallbackIcon(business);
        markerRef.current = new Marker({
          map,
          position,
          title: business?.business_name || "",
          icon: {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(56, 56),
            anchor: new window.google.maps.Point(28, 28),
          },
        });
      }
    };

    // Wait for Google Maps loader to be ready
    const tryInit = (attempt = 0) => {
      if (cancelled) return;
      if (window.google?.maps?.importLibrary) {
        initMap();
      } else if (attempt < 50) {
        setTimeout(() => tryInit(attempt + 1), 200);
      }
    };

    tryInit();

    return () => {
      cancelled = true;
    };
  }, [
    business?.id,
    business?.latitude,
    business?.longitude,
    business?.address_line1,
    business?.city,
    business?.state,
    business?.zip_code,
    business?.logo_url,
    business?.business_name,
  ]);

  return (
    <div style={{ height, width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}