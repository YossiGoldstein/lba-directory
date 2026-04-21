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
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Init map always at default center
    const map = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    const infoWindow = new window.google.maps.InfoWindow();

    // Clear old markers
    markersRef.current.forEach((m) => { try { m.setMap(null); } catch(e){} });
    markersRef.current = [];

    if (!businesses || businesses.length === 0) return;

    const positions = [];

    const processBusinesses = async () => {
      for (const business of businesses) {
        let position = null;

        // 1. Use stored coords
        if (business.latitude && business.longitude && !isNaN(business.latitude) && !isNaN(business.longitude)) {
          position = { lat: Number(business.latitude), lng: Number(business.longitude) };
        } else {
          // 2. Geocode address
          const address = buildAddress(business);
          if (address) {
            position = await geocodeAddress(address);
          }
        }

        if (position) {
          positions.push(position);
          const marker = placeMarker(map, position, business, infoWindow);
          markersRef.current.push(marker);
        }
      }

      // Re-center map if we have positions
      if (positions.length > 0) {
        const avgLat = positions.reduce((s, p) => s + p.lat, 0) / positions.length;
        const avgLng = positions.reduce((s, p) => s + p.lng, 0) / positions.length;
        map.setCenter({ lat: avgLat, lng: avgLng });
      }
    };

    processBusinesses();

    return () => {
      markersRef.current.forEach((m) => { try { m.setMap(null); } catch(e){} });
    };
  }, [businesses]);

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height, width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}