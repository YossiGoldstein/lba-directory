import React, { useState } from 'react';
import { MapPin, Clock, Phone, ExternalLink, Mail, Globe, Star, Truck, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const DELIVERY_LABELS = {
  doordash_url: 'DoorDash',
  uber_eats_url: 'Uber Eats',
  grubhub_url: 'Grubhub',
  instacart_url: 'Instacart',
  postmates_url: 'Postmates',
  toast_url: 'Toast',
  k1_url: 'K1',
};

export default function BusinessSearchResultCard({ business }) {
  const [expanded, setExpanded] = useState(false);
  if (!business) return null;

  const address = [business.address_line1, business.address_line2, business.city, business.state, business.zip_code]
    .filter(Boolean).join(', ');

  const deliveryOptions = Object.entries(DELIVERY_LABELS)
    .filter(([key]) => business[key])
    .map(([, label]) => label);

  const hours = business.by_appointment_only
    ? 'By appointment only'
    : business.opening_hours_text || null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden my-2 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        {business.logo_url && (
          <img
            src={business.logo_url}
            alt={business.business_name}
            className="w-12 h-12 rounded-md object-cover flex-shrink-0 bg-white border border-gray-100"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Link
              to={`/businesslisting/${business.slug || business.id}`}
              className="font-semibold text-blue-600 hover:text-blue-800 text-sm leading-tight"
            >
              {business.business_name}
            </Link>
            {business.is_vip && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">VIP</span>
            )}
          </div>
          {business.general_rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-gray-600">{business.general_rating.toFixed(1)}</span>
              {business.reviews_count > 0 && (
                <span className="text-xs text-gray-400">({business.reviews_count})</span>
              )}
            </div>
          )}
          {business.short_description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{business.short_description}</p>
          )}
        </div>
      </div>

      {/* Key info */}
      <div className="px-3 pb-2 space-y-1">
        {business.phone && (
          <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600">
            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {business.phone}
          </a>
        )}
        {address && (
          <div className="flex items-start gap-1.5 text-xs text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            {address}
          </div>
        )}
        {business.by_appointment_only && (
          <div className="flex items-center gap-1.5 text-xs text-purple-700">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            By appointment only
          </div>
        )}
        {!business.by_appointment_only && hours && (
          <div className="flex items-start gap-1.5 text-xs text-gray-700">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="whitespace-pre-line line-clamp-2">{hours}</span>
          </div>
        )}
        {deliveryOptions.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-green-700">
            <Truck className="w-3.5 h-3.5 flex-shrink-0" />
            {deliveryOptions.join(' · ')}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-1 border-t border-gray-100 pt-2">
          {business.long_description && (
            <p className="text-xs text-gray-600">{business.long_description.slice(0, 300)}{business.long_description.length > 300 ? '…' : ''}</p>
          )}
          {business.email && (
            <a href={`mailto:${business.email}`} className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {business.email}
            </a>
          )}
          {business.website_url && (
            <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>
          )}
          {!business.by_appointment_only && business.opening_hours_text && (
            <div className="flex items-start gap-1.5 text-xs text-gray-700">
              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="whitespace-pre-line">{business.opening_hours_text}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {expanded ? 'Show less' : 'More details'}
        </button>
        <Link
          to={`/businesslisting/${business.slug || business.id}`}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          View Profile <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}