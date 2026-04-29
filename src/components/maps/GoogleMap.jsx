import React, { useEffect, useRef, useState } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";

const DEFAULT_CENTER = { lat: 40.0957, lng: -74.2177 }; // Lakewood, NJ
const GEOCODE_API_KEY = "AIzaSyDfr-zgnbCEuvQGbEll582R4kSes79FDc8";
const MAP_ID = "DEMO_MAP_ID";
const MARKER_SIZE = 52;

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

function buildMarkerDiv(business) {
  const logoUrl = business?.logo_url ? fixImageUrl(business.logo_url) : null;
  const initial = (business?.business_name || "?").charAt(0).toUpperCase();
  const fontSize = Math.round(MARKER_SIZE * 0.4);

  const div = document.createElement("div");
  div.style.cssText = [
    `width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;border-radius:50%;overflow:hidden;`,
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
      div.innerHTML = `<span style="font-weight:bold;font-size:${fontSize}px;color:white;">${initial}</span>`;
      div.style.background = "linear-gradient(135deg,#0891b2,#06b6d4)";
    };
    div.appendChild(img);
  } else {
    div.style.background = "linear-gradient(135deg,#0891b2,#06b6d4)";
    div.innerHTML = `<span style="font-weight:bold;font-size:${fontSize}px;color:white;">${initial}</span>`;
  }

  return div;
}

// HiDPI-aware canvas icon for the classic Marker fallback
function buildFallbackIcon(business) {
  const dpr = window.devicePixelRatio || 1;
  const displaySize = MARKER_SIZE;
  const canvasSize = displaySize * dpr;
  const initial = (business.business_name || "?").charAt(0).toUpperCase();

  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const r = displaySize / 2;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fillStyle = "#0891b2";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r, r, r - 2, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = `bold ${Math.round(displaySize * 0.4)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial, r, r);

  return canvas.toDataURL();
}

function placeMarker(map, position, business, infoWindow) {
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

  if (window.google.maps.marker?.AdvancedMarkerElement) {
    const markerDiv = buildMarkerDiv(business);
    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: markerDiv,
      title: business.business_name,
    });
    markerDiv.addEventListener("click", () => {
      infoWindow.setContent(infoContent);
      infoWindow.open({ anchor: marker, map });
    });
    return marker;
  }

  // Classic Marker fallback
  const iconUrl = buildFallbackIcon(business);
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
  marker.addListener("click", () => {
    infoWindow.setContent(infoContent);
    infoWindow.open(map, marker);
  });
  return marker;
}

export default function GoogleMap({ businesses = [], height = "450px" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const markersRef = useRef([]);
  const activeEffectRef = useRef(0);
  const [mapReady, setMapReady] = useState(false);

  // Init map once, with retry loop for async/defer race condition
  useEffect(() => {
    let cancelled = false;

    const initMap = () => {
      if (cancelled || !mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 13,
        mapId: MAP_ID,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapInstanceRef.current = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();
      setMapReady(true);
    };

    const tryInit = (attempt = 0) => {
      if (cancelled) return;
      if (window.google) {
        initMap();
      } else if (attempt < 30) {
        setTimeout(() => tryInit(attempt + 1), 200);
      }
    };

    tryInit();
    return () => { cancelled = true; };
  }, []);

  // Update markers whenever businesses or mapReady changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !infoWindow) return;

    const effectId = ++activeEffectRef.current;

    markersRef.current.forEach((m) => { try { m.setMap(null); } catch (e) {} });
    markersRef.current = [];

    if (!businesses || businesses.length === 0) return;

    const run = async () => {
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

      const geocoded = await Promise.all(
        needsGeocode.map(async ({ business, address }) => {
          const position = await geocodeAddress(address);
          return position ? { business, position } : null;
        })
      );

      if (activeEffectRef.current !== effectId) return;

      const allResolved = [...withCoords, ...geocoded.filter(Boolean)];

      allResolved.forEach(({ business, position }) => {
        const marker = placeMarker(map, position, business, infoWindow);
        markersRef.current.push(marker);
      });

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
  }, [businesses, mapReady]);

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height, width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
