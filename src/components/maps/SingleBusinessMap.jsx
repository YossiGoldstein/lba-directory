import React, { useEffect, useRef } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";
import { loadGoogleMaps } from "@/components/lib/googleMapsLoader";

const DEFAULT_CENTER = { lat: 40.0957, lng: -74.2177 }; // Lakewood, NJ
const MARKER_SIZE = 56;

// Geocode with the Google Maps JS Geocoder first (tolerant of abbreviations/
// spacing — e.g. it resolves "1750 Cedarbridge Ave" which Nominatim cannot),
// falling back to Nominatim. NOTE: the Google Geocoder only works once the
// "Geocoding API" is enabled on the Maps key in Google Cloud Console — until
// then it returns REQUEST_DENIED and we use the Nominatim fallback.
function geocodeGoogle(address) {
  return new Promise((resolve) => {
    try {
      if (!window.google?.maps?.Geocoder) return resolve(null);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          resolve(null);
        }
      });
    } catch (e) {
      resolve(null);
    }
  });
}

async function geocodeNominatim(address) {
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
    // ignore network errors
  }
  return null;
}

async function geocodeAddress(address) {
  return (await geocodeGoogle(address)) || (await geocodeNominatim(address));
}

function buildMarkerIcon(business) {
  const dpr = window.devicePixelRatio || 1;
  const display = MARKER_SIZE;
  const px = display * dpr;
  const initial = (business?.business_name || "?").charAt(0).toUpperCase();
  const logoUrl = business?.logo_url ? fixImageUrl(business.logo_url) : null;

  function letterIcon() {
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

  function circularDataUrl(img) {
    const c = document.createElement("canvas");
    c.width = px; c.height = px;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.beginPath(); ctx.arc(display / 2, display / 2, display / 2, 0, Math.PI * 2);
    ctx.fillStyle = "white"; ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(display / 2, display / 2, display / 2 - 3, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(img, 0, 0, display, display);
    ctx.restore();
    ctx.beginPath(); ctx.arc(display / 2, display / 2, display / 2 - 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(display / 2, display / 2, display / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5; ctx.stroke();
    return c.toDataURL();
  }

  if (!logoUrl) return Promise.resolve(letterIcon());

  return new Promise((resolve) => {
    const corsImg = new Image();
    corsImg.crossOrigin = "anonymous";
    corsImg.onload = () => {
      try { resolve(circularDataUrl(corsImg)); } catch (e) { resolve(letterIcon()); }
    };
    corsImg.onerror = () => {
      const img = new Image();
      img.onload = () => {
        try { resolve(circularDataUrl(img)); } catch (e) { resolve(logoUrl); }
      };
      img.onerror = () => resolve(letterIcon());
      img.src = logoUrl;
    };
    corsImg.src = logoUrl;
  });
}

export default function SingleBusinessMap({ business, height = "320px" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      await loadGoogleMaps();
      if (cancelled || !mapRef.current) return;

      let position = null;
      if (
        business?.latitude &&
        business?.longitude &&
        !isNaN(Number(business.latitude)) &&
        !isNaN(Number(business.longitude))
      ) {
        position = { lat: Number(business.latitude), lng: Number(business.longitude) };
      } else if (business?.address_line1 && business.address_line1.trim()) {
        const address = [
          business.address_line1,
          business.city,
          business.state || "",
          business.zip_code || "",
        ].filter(Boolean).join(", ");
        position = await geocodeAddress(address);
      }
      // No city-only fallback: a listing with only a city (e.g. "Lakewood")
      // and no street address gets no pin.

      if (cancelled || !mapRef.current) return;

      const center = position || DEFAULT_CENTER;
      const zoom = position ? (business?.latitude ? 15 : 14) : 12;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      } else {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(zoom);
      }

      const map = mapInstanceRef.current;

      if (markerRef.current) {
        try { markerRef.current.setMap(null); } catch (e) {}
        markerRef.current = null;
      }

      if (!position) return;

      const iconUrl = await buildMarkerIcon(business).catch(() => null);
      if (cancelled) return;

      const markerOptions = {
        map,
        position,
        title: business?.business_name || "",
      };
      if (iconUrl) {
        markerOptions.icon = {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(MARKER_SIZE, MARKER_SIZE),
          anchor: new window.google.maps.Point(MARKER_SIZE / 2, MARKER_SIZE / 2),
        };
      }
      markerRef.current = new window.google.maps.Marker(markerOptions);
    };

    initMap().catch((err) => console.error("[SingleBusinessMap] load error:", err));

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
