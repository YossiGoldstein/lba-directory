import React, { useEffect, useRef } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";

const DEFAULT_CENTER = { lat: 40.0957, lng: -74.2177 }; // Lakewood, NJ
const GEOCODE_API_KEY = "AIzaSyDfr-zgnbCEuvQGbEll582R4kSes79FDc8";
// Required by AdvancedMarkerElement — replace with a real Map ID from Google Cloud Console if desired
const MAP_ID = "DEMO_MAP_ID";

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

export default function SingleBusinessMap({ business, height = "320px" }) {
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (cancelled || !mapRef.current || !window.google) return;

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

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapId: MAP_ID,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      if (!position) return;

      const markerDiv = buildMarkerDiv(business);

      // AdvancedMarkerElement supports custom DOM content (the circular logo).
      // It requires both &libraries=marker in the script URL and a mapId on the Map.
      if (window.google.maps.marker?.AdvancedMarkerElement) {
        new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          content: markerDiv,
          title: business?.business_name || "",
        });
      } else {
        // Fallback: classic Marker (deprecated but always available)
        new window.google.maps.Marker({
          map,
          position,
          title: business?.business_name || "",
        });
      }
    };

    // Retry until window.google is available (handles async/defer race condition)
    const tryInit = (attempt = 0) => {
      if (cancelled) return;
      if (window.google) {
        initMap();
      } else if (attempt < 30) {
        setTimeout(() => tryInit(attempt + 1), 200);
      }
    };

    tryInit();

    return () => {
      cancelled = true;
    };
  }, [
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
