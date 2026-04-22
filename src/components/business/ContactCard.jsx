import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Globe, MessageCircle, Facebook, Instagram, MapPin, ExternalLink, Package } from "lucide-react";
import { getSocialPlatform } from "@/components/lib/socialPlatforms";

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export default function ContactCard({ business }) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
        {/* Address */}
        {business.address_line1 && (
          <div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>{business.address_line1}</p>
                {business.address_line2 && <p>{business.address_line2}</p>}
                <p>
                  {business.city}
                  {business.city && business.state && ", "}
                  {business.state} {business.zip_code}
                </p>
                {business.country && business.country !== "USA" && (
                  <p>{business.country}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Details */}
        <div className="space-y-3">
          {business.phone && business.phone.trim() && business.phone.replace(/\D/g, '').length >= 10 && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${business.phone}`} className="text-gray-700 hover:text-cyan-600">
                {formatPhoneNumber(business.phone)}
              </a>
            </div>
          )}

          {business.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${business.email}`} className="text-gray-700 hover:text-cyan-600">
                {business.email}
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t">
          {business.phone && business.phone.trim() && business.phone.replace(/\D/g, '').length >= 10 && (
            <Button 
              asChild 
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              size="lg"
            >
              <a href={`tel:${business.phone}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </a>
            </Button>
          )}

          {business.whatsapp_number && (
            <Button 
              asChild 
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <a 
                href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            </Button>
          )}

          {business.website_url && (
            <Button 
              asChild 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <a href={business.website_url} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
              </a>
            </Button>
          )}
        </div>

        {/* Social Media */}
        {(business.facebook_url || business.instagram_url || business.linkedin_url || business.youtube_url || business.x_url || business.other_social_url) && (
          <div className="pt-4 border-t">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Social Media</h3>
            <div className="flex gap-2 flex-wrap">
              {business.facebook_url && (
                <a 
                  href={business.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {business.instagram_url && (
                <a 
                  href={business.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 text-white rounded-lg flex items-center justify-center transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {business.linkedin_url && (
                <a 
                  href={business.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {business.x_url && (
                <a
                  href={business.x_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-black hover:bg-gray-800 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {business.youtube_url && (
                <a 
                  href={business.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {business.other_social_url && (() => {
                const platform = getSocialPlatform(business.other_social_url);
                return (
                  <a
                    href={business.other_social_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={platform.name === "Other" ? "Other Social Media" : platform.name}
                    aria-label={platform.name === "Other" ? "Other Social Media" : platform.name}
                    className={`w-9 h-9 ${platform.color} text-white rounded-lg flex items-center justify-center transition-colors`}
                  >
                    {platform.svg
                      ? <svg className="w-4 h-4" fill="currentColor" viewBox={platform.svg.props.viewBox}>{platform.svg.props.children}</svg>
                      : <Globe className="w-4 h-4" />
                    }
                  </a>
                );
              })()}
            </div>
          </div>
        )}

        {/* Delivery Services */}
        {(business.uber_eats_url || business.postmates_url || business.toast_url || business.grubhub_url || business.instacart_url || business.doordash_url || business.k1_url) && (
          <div className="pt-4 border-t">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Place an Order</h3>
            <div className="grid grid-cols-3 gap-2">
              {business.uber_eats_url && (
                <a 
                  href={business.uber_eats_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/ff4fb46cd_WhatsAppImage2026-01-27at20333PM5.jpeg"
                    alt="Uber Eats"
                    className="w-14 h-14 object-contain"
                  />
                </a>
              )}
              {business.doordash_url && (
                <a 
                  href={business.doordash_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/dfd802d8e_WhatsAppImage2026-01-27at20333PM4.jpg"
                    alt="DoorDash"
                    className="w-14 h-14 object-contain"
                  />
                </a>
              )}
              {business.toast_url && (
                <a 
                  href={business.toast_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/d0602ba11_WhatsAppImage2026-01-27at20333PM3.jpeg"
                    alt="Toast"
                    className="w-14 h-14 object-contain"
                  />
                </a>
              )}
              {business.grubhub_url && (
                <a 
                  href={business.grubhub_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/2ed93e6bf_WhatsAppImage2026-01-27at20333PM2.jpeg"
                    alt="Grubhub"
                    className="w-14 h-14 object-contain"
                  />
                </a>
              )}
              {business.postmates_url && (
                <a 
                  href={business.postmates_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/23d48c7ee_WhatsAppImage2026-01-27at20333PM1.jpeg"
                    alt="Postmates"
                    className="w-14 h-14 object-contain"
                  />
                </a>
              )}
              {business.instacart_url && (
                <a 
                  href={business.instacart_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/2f48bb371_WhatsAppImage2026-01-27at20333PM.jpg"
                    alt="Instacart"
                    className="w-14 h-14 object-contain"
                  />
                </a>
              )}
              {business.k1_url && (
                <a 
                  href={business.k1_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <Package className="w-14 h-14 text-blue-600" />
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}