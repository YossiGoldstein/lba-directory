import React, { useEffect, useRef } from "react";
import { fixImageUrl } from "@/components/lib/imageUtils";
import { createPageUrl } from "@/utils";

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

function buildAddress(b) {
  if (!b.address_line1 || !b.city) return null;
  return `${b.address_line1}, ${b.city}, ${b.state || ""} ${b.zip_code || ""}`.trim();
}

function placeMarker(map, position, business, infoWindow) {
  const logoUrl = business.logo_url ? fixImageUrl(business.logo_url) : null;
  const initial = (business.business_name || "?").charAt(0).toUpperCase();

  const markerDiv = document.createElement("div");
  markerDiv.style.cssText = `
    width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
    border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    cursor: pointer; background: linear-gradient(135deg,#0891b2,#06b6d4);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  `;

  if (logoUrl) {
    const img = document.createElement("img");
    img.src = logoUrl;
    img.alt = business.business_name;
    img.style.cssText = "width:100%;height:100%;object-fit:cover;";
    img.onerror = () => {
      markerDiv.innerHTML = `<span style="font-weight:bold;font-size:18px;color:white;">${initial}</span>`;
    };
    markerDiv.appendChild(img);
  } else {
    markerDiv.innerHTML = `<span style="font-weight:bold;font-size:18px;color:white;">${initial}</span>`;
  }

  let marker;
  if (window.google.maps.marker?.AdvancedMarkerElement) {
    marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: markerDiv,
      title: business.business_name,
    });
  } else {
    marker = new window.google.maps.Marker({
      map,
      position,
      title: business.business_name,
    });
  }

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
    if (window.google.maps.marker?.AdvancedMarkerElement && marker instanceof window.google.maps.marker.AdvancedMarkerElement) {
      infoWindow.open({ anchor: marker, map });
    } else {
      infoWindow.open(map, marker);
    }
  };

  if (marker.addListener) {
    marker.addListener("click", clickHandler);
  } else {
    markerDiv.addEventListener("click", clickHandler);
  }

  return marker;
}

export default function GoogleMap({ businesses = [], height = "450px" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const infoWindowRef = useRef(null);
  const markersRef = useRef([]);
  const activeEffectRef = useRef(0); // cancel stale async runs

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

    // Cancel any previous async run
    const effectId = Date.now();
    activeEffectRef.current = effectId;

    // Clear existing markers
    markersRef.current.forEach((m) => { try { m.setMap(null); } catch (e) {} });
    markersRef.current = [];

    if (!businesses || businesses.length === 0) return;

    console.log(`[GoogleMap] Received ${businesses.length} businesses`);

    const run = async () => {
      // Separate businesses into those with coords and those needing geocoding
      const withCoords = [];
      const needsGeocode = [];

      for (const b of businesses) {
        if (b.latitude && b.longitude && !isNaN(Number(b.latitude)) && !isNaN(Number(b.longitude))) {
          withCoords.push({ business: b, position: { lat: Number(b.latitude), lng: Number(b.longitude) } });
        } else {
          const address = buildAddress(b);
          if (address) {
            needsGeocode.push({ business: b, address });
          }
        }
      }

      console.log(`[GoogleMap] ${withCoords.length} have coords, ${needsGeocode.length} need geocoding`);

      // Geocode all in parallel
      const geocoded = await Promise.all(
        needsGeocode.map(async ({ business, address }) => {
          const position = await geocodeAddress(address);
          return position ? { business, position } : null;
        })
      );

      // If a newer effect started while we were geocoding, bail out
      if (activeEffectRef.current !== effectId) return;

      const geocodedValid = geocoded.filter(Boolean);
      console.log(`[GoogleMap] ${geocodedValid.length} successfully geocoded`);

      const allResolved = [...withCoords, ...geocodedValid];

      // Place all markers
      allResolved.forEach(({ business, position }) => {
        const marker = placeMarker(map, position, business, infoWindow);
        markersRef.current.push(marker);
      });

      // Re-center map to average position
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