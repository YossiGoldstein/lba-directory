// Compatibility shim — delegates to GoogleMap
import GoogleMap from "@/components/maps/GoogleMap";

export default function MapView({ businesses }) {
  return <GoogleMap businesses={businesses} height="600px" />;
}