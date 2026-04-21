import React from "react";
import { fixImageUrl } from "./imageUtils";

const PLACEHOLDER = "https://media.base44.com/images/public/69160f6f331f1b03b4ecdf77/3512c92fb_generated_image.png";

/**
 * Displays a business cover image.
 * Priority: cover_photo_url → gallery_images[0] → logo_url → placeholder
 */
export default function BusinessImage({ business, className = "w-full h-full object-cover", style }) {
  const getImageSrc = () => {
    if (business.cover_photo_url && business.cover_photo_url.trim()) return fixImageUrl(business.cover_photo_url);
    const gallery = business.gallery_images;
    const validGallery = Array.isArray(gallery) && gallery.find(i => i && i.trim() !== '');
    if (validGallery) return fixImageUrl(validGallery);
    if (business.logo_url && business.logo_url.trim() !== '') return fixImageUrl(business.logo_url);
    return PLACEHOLDER;
  };

  return (
    <img
      src={getImageSrc()}
      alt={business.business_name}
      className={className}
      style={style}
      onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
    />
  );
}