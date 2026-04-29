import React, { useEffect, useRef } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";
import { createPageUrl } from "@/utils";

const DEFAULT_CENTER = { lat: 40.0957, lng: -74.2177 }; // Lakewood, NJ
const GEOCODE_API_KEY = "AIzaSyDfr-zgnbCEuvQGbEll582R4kSes79FDc8";
const MARKER_SIZE = 40;

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

function buildAddress(b) {
  if (!b.address_line1 || !b.city) return null;
  return `${b.address_line1}, ${b.city}, ${b.state || ""} ${b.zip_code || ""}`.trim();
}

// Draw a letter-based canvas marker
function drawLetterCanvas(initial) {
  const size = MARKER_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  // Circle background
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#0891b2";
  ctx.fill();
  // White border
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
  // Letter
  ctx.fillStyle = "white";
  ctx.font = `bold ${size * 0.42}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial, size / 2, size / 2);
  return canvas.toDataURL();
}

// Draw a logo image clipped into a circle on canvas
function drawLogoCanvas(img) {
  const size = MARKER_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  // Clip circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, 0, 0, size, size);
  // White border
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1.5, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
  return canvas.toDataURL();
}

// Returns a promise resolving to a dataURL icon for the business
function buildMarkerIcon(business) {
  const initial = (business.business_name || "?").charAt(0).toUpperCase();
  const logoUrl = business.logo_url ? fixImageUrl(business.logo_url) : null;

  if (!logoUrl) {
    return Promise.resolve(drawLetterCanvas(initial));
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(drawLogoCanvas(img));
    img.onerror = () => resolve(drawLetterCanvas(initial));
    img.src = logoUrl;
  });
}

function placeMarker(map, position, business, infoWindow, iconUrl) {
  const profileUrl = `/businesslisting/${business.slug || business.id}`;
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

  const openInfo = (marker) => {
    infoWindow.setContent(infoContent);
    if (window.google.maps.marker?.AdvancedMarkerElement && marker instanceof window.google.maps.marker.AdvancedMarkerElement) {
      infoWindow.open({ anchor: marker, map });
    } else {
      infoWindow.open(map, marker);
    }
  };

  // Try AdvancedMarkerElement with an img element as content
  if (window.google.maps.marker?.AdvancedMarkerElement) {
    const imgEl = document.createElement("img");
    imgEl.src = iconUrl;
    imgEl.style.cssText = `width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;`;

    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: imgEl,
      title: business.business_name,
    });

    imgEl.addEventListener("click", () => openInfo(marker));
    return marker;
  }

  // Fallback: standard Marker with canvas icon
  const marker = new window.google.maps.Marker({
    map,
    position,
    title: business.business_name,
    icon: {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(MARKER_SIZE, MARKER_SIZE),
      anchor: new window.google.maps.Point(MARKER_SIZE / 2, MARKER_SIZE / 2),
    },
  });
  marker.addListener("click", () => openInfo(marker));
  return marker;
}

export default function GoogleMap({ businesses = [], height = "450px" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const markersRef = useRef([]);
  const activeEffectRef = useRef(0);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();
  }, []);

  // Update markers whenever businesses change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !infoWindow) return;

    const effectId = ++activeEffectRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => { try { m.setMap(null); } catch (e) {} });
    markersRef.current = [];

    if (!businesses || businesses.length === 0) return;

    console.log(`[GoogleMap] Received ${businesses.length} businesses`);

    const run = async () => {
      // Step 1: resolve positions (parallel geocoding for those without coords)
      const withCoords = [];
      const needsGeocode = [];

      for (const b of businesses) {
        if (b.latitude && b.longitude && !isNaN(Number(b.latitude)) && !isNaN(Number(b.longitude))) {
          withCoords.push({ business: b, position: { lat: Number(b.latitude), lng: Number(b.longitude) } });
        } else {
          const address = buildAddress(b);
          if (address) needsGeocode.push({ business: b, address });
        }
      }

      console.log(`[GoogleMap] ${withCoords.length} have coords, ${needsGeocode.length} need geocoding`);

      const geocoded = await Promise.all(
        needsGeocode.map(async ({ business, address }) => {
          const position = await geocodeAddress(address);
          return position ? { business, position } : null;
        })
      );

      if (activeEffectRef.current !== effectId) return; // stale

      const geocodedValid = geocoded.filter(Boolean);
      console.log(`[GoogleMap] ${geocodedValid.length} successfully geocoded`);

      const allResolved = [...withCoords, ...geocodedValid];

      // Step 2: build canvas icons in parallel
      const withIcons = await Promise.all(
        allResolved.map(async (item) => ({
          ...item,
          iconUrl: await buildMarkerIcon(item.business),
        }))
      );

      if (activeEffectRef.current !== effectId) return; // stale

      // Step 3: place all markers
      withIcons.forEach(({ business, position, iconUrl }) => {
        const marker = placeMarker(map, position, business, infoWindow, iconUrl);
        markersRef.current.push(marker);
      });

      // Re-center to average position
      if (allResolved.length > 0) {
        const avgLat = allResolved.reduce((s, { position: p }) => s + p.lat, 0) / allResolved.length;
        const avgLng = allResolved.reduce((s, { position: p }) => s + p.lng, 0) / allResolved.length;
        map.setCenter({ lat: avgLat, lng: avgLng });
      }
    };

    run();

    return () => {
      markersRef.current.forEach((m) => { try { m.setMap(null); } catch (e) {} });
      markersRef.current = [];
    };
  }, [businesses]);

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height, width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}