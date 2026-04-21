// Compatibility shim — delegates to GoogleMap
import GoogleMap from "@/components/maps/GoogleMap";
export default function BusinessMap({ businesses, height }) {
  return <GoogleMap businesses={businesses} height={height} />;
}