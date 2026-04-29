/**
 * Geocode a business address using Nominatim (OpenStreetMap).
 * Returns { lat, lng } on success, null on failure.
 * Nominatim policy: max 1 req/sec. This function makes a single
 * request per call, so callers making sequential saves are compliant.
 */
export async function geocodeBusinessAddress({ address_line1, city, state, zip_code } = {}) {
  const parts = [address_line1, city, state, zip_code].filter(Boolean);
  if (parts.length < 1 || !city) return null;

  const query = parts.join(", ");
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "User-Agent": "LBADirectory/1.0 (lbadirectory.com)" } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // Network error or rate limit — silently ignore
  }
  return null;
}

/**
 * Returns true if any address field changed between formData and the
 * stored business record. Used to skip unnecessary geocoding on saves
 * that only changed non-address fields.
 */
export function addressChanged(formData, business) {
  return (
    (formData.address_line1 ?? "") !== (business.address_line1 ?? "") ||
    (formData.city ?? "") !== (business.city ?? "") ||
    (formData.state ?? "") !== (business.state ?? "") ||
    (formData.zip_code ?? "") !== (business.zip_code ?? "")
  );
}
