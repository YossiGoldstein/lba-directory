import React, { useEffect, useRef, useState } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";

const DEFAULT_CENTER = { lat: 40.0957, lng: -74.2177 }; // Lakewood, NJ
const MARKER_SIZE = 52; // display px

// Returns a position for every business — no external API calls.
// Businesses with stored lat/lng use exact coordinates.
// Others are placed in a golden-angle spiral around Lakewood center so
// every business is visible. Run the geocodeBusinesses admin function to
// populate exact coordinates for all businesses.
function resolvePosition(b, spiralIndex) {
  if (b.latitude && b.longitude && !isNaN(Number(b.latitude)) && !isNaN(Number(b.longitude))) {
    return { lat: Number(b.latitude), lng: Number(b.longitude) };
  }
  // Golden-angle spiral: even angular distribution, ~8 per ring, ~300 m per ring
  const angle = (spiralIndex * 137.5 * Math.PI) / 180;
  const radius = 0.003 * (Math.floor(spiralIndex / 8) + 1);
  return {
    lat: DEFAULT_CENTER.lat + radius * Math.cos(angle),
    lng: DEFAULT_CENTER.lng + radius * Math.sin(angle),
  };
}

// Spread markers at identical stored coordinates so they don't stack
function jitterDuplicates(resolved) {
  const counts = new Map();
  return resolved.map((item) => {
    const key = `${item.position.lat.toFixed(4)},${item.position.lng.toFixed(4)}`;
    const idx = counts.get(key) || 0;
    counts.set(key, idx + 1);
    if (idx === 0) return item;
    const angle = (idx * 137.5 * Math.PI) / 180;
    const radius = 0.0004 * Math.ceil(idx / 6);
    return {
      ...item,
      position: {
        lat: item.position.lat + radius * Math.cos(angle),
        lng: item.position.lng + radius * Math.sin(angle),
      },
    };
  });
}

// Build a circular canvas icon (HiDPI-aware).
// Uses the business logo clipped to a circle; falls back to a letter if the
// image can't be loaded (CORS, network error, etc.).
function buildMarkerIcon(business) {
  const dpr = window.devicePixelRatio || 1;
  const display = MARKER_SIZE;
  const canvas = display * dpr;
  const initial = (business.business_name || "?").charAt(0).toUpperCase();
  const logoUrl = business.logo_url ? fixImageUrl(business.logo_url) : null;

  function letterIcon() {
    const c = document.createElement("canvas");
    c.width = canvas; c.height = canvas;
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

  if (!logoUrl) return Promise.resolve(letterIcon());

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = canvas; c.height = canvas;
        const ctx = c.getContext("2d");
        ctx.scale(dpr, dpr);
        // White circle background
        ctx.beginPath(); ctx.arc(display / 2, display / 2, display / 2, 0, Math.PI * 2);
        ctx.fillStyle = "white"; ctx.fill();
        // Clip to circle and draw logo
        ctx.save();
        ctx.beginPath(); ctx.arc(display / 2, display / 2, display / 2 - 3, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(img, 0, 0, display, display);
        ctx.restore();
        // White border ring
        ctx.beginPath(); ctx.arc(display / 2, display / 2, display / 2 - 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
        // Drop shadow effect (outer ring)
        ctx.beginPath(); ctx.arc(display / 2, display / 2, display / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5; ctx.stroke();
        resolve(c.toDataURL());
      } catch (e) {
        resolve(letterIcon());
      }
    };
    img.onerror = () => resolve(letterIcon());
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

  const markerOptions = {
    map,
    position,
    title: business.business_name,
  };

  if (iconUrl) {
    markerOptions.icon = {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(MARKER_SIZE, MARKER_SIZE),
      anchor: new window.google.maps.Point(MARKER_SIZE / 2, MARKER_SIZE / 2),
    };
  }

  const marker = new window.google.maps.Marker(markerOptions);
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

  // Init map once — retry until window.google is available (async/defer race)
  useEffect(() => {
    let cancelled = false;

    const initMap = () => {
      if (cancelled || !mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 13,
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

  // Place/update markers whenever businesses or mapReady changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !infoWindow) return;

    const effectId = ++activeEffectRef.current;

    markersRef.current.forEach((m) => { try { m.setMap(null); } catch (e) {} });
    markersRef.current = [];

    if (!businesses || businesses.length === 0) return;

    const run = async () => {
      // Assign positions synchronously (no external API calls).
      // spiralIndex counts only the businesses that lack stored coords.
      let spiralIndex = 0;
      let resolved = businesses.map((b) => ({
        business: b,
        position: resolvePosition(b, b.latitude && b.longitude ? 0 : spiralIndex++),
      }));

      resolved = jitterDuplicates(resolved);

      // Build canvas icons in parallel (async only for image loading)
      const icons = await Promise.all(
        resolved.map(({ business: b }) => buildMarkerIcon(b).catch(() => null))
      );

      if (activeEffectRef.current !== effectId) return;

      resolved = resolved.map((item, i) => ({ ...item, iconUrl: icons[i] }));

      resolved.forEach(({ business, position, iconUrl }) => {
        try {
          const marker = placeMarker(map, position, business, infoWindow, iconUrl);
          markersRef.current.push(marker);
        } catch (e) {
          console.error("[GoogleMap] marker error:", business.business_name, e);
        }
      });

      // Center on exact-coordinate businesses if any; otherwise use default
      const withExact = resolved.filter(({ business: b }) =>
        b.latitude && b.longitude && !isNaN(Number(b.latitude)) && !isNaN(Number(b.longitude))
      );
      const reference = withExact.length > 0 ? withExact : resolved;
      if (reference.length > 0) {
        const avgLat = reference.reduce((s, { position: p }) => s + p.lat, 0) / reference.length;
        const avgLng = reference.reduce((s, { position: p }) => s + p.lng, 0) / reference.length;
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
