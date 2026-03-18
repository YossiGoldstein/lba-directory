import React from 'react';
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BusinessSearchResultCard({ business }) {
  if (!business) return null;

  const getDisplayHours = () => {
    if (business.by_appointment_only) {
      return "By appointment only";
    }
    if (business.opening_hours_text) {
      return business.opening_hours_text;
    }
    return "Hours not available";
  };

  const formatAddress = () => {
    const parts = [business.address_line1, business.city, business.state, business.zip_code].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 my-2 shadow-sm hover:shadow-md transition-shadow">
      {/* Business Name as Link */}
      <Link 
        to={`/BusinessListing?id=${business.id}&businessName=${encodeURIComponent(business.business_name)}`}
        className="block text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2"
      >
        {business.business_name}
      </Link>

      {/* Address */}
      {formatAddress() && (
        <div className="flex items-start gap-2 text-sm text-gray-700 mb-2">
          <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
          <span>{formatAddress()}</span>
        </div>
      )}

      {/* Phone */}
      {business.phone && (
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <a href={`tel:${business.phone}`} className="hover:text-blue-600">
            {business.phone}
          </a>
        </div>
      )}

      {/* Hours */}
      <div className="flex items-start gap-2 text-sm text-gray-700">
        <Clock className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
        <span>{getDisplayHours()}</span>
      </div>

      {/* Visit Link */}
      <Link 
        to={`/BusinessListing?id=${business.id}&businessName=${encodeURIComponent(business.business_name)}`}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-3"
      >
        View Business <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}