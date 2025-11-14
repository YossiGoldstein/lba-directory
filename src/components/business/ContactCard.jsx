import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Globe, MessageCircle, Facebook, Instagram, MapPin, ExternalLink } from "lucide-react";

export default function ContactCard({ business }) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        {business.phone && (
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

        {/* Contact Details */}
        <div className="space-y-3 pt-4 border-t">
          {business.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${business.phone}`} className="text-gray-700 hover:text-cyan-600">
                {business.phone}
              </a>
            </div>
          )}

          {business.whatsapp_number && (
            <div className="flex items-center gap-3 text-sm">
              <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a 
                href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-cyan-600"
              >
                WhatsApp
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

          {business.website_url && (
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a 
                href={business.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-cyan-600 flex items-center gap-1"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Social Media */}
        {(business.facebook_url || business.instagram_url || business.other_social_url) && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-3">Follow Us</p>
            <div className="flex gap-2">
              {business.facebook_url && (
                <Button 
                  asChild 
                  size="icon" 
                  variant="outline"
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <a href={business.facebook_url} target="_blank" rel="noopener noreferrer">
                    <Facebook className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {business.instagram_url && (
                <Button 
                  asChild 
                  size="icon" 
                  variant="outline"
                  className="hover:bg-pink-50 hover:text-pink-600"
                >
                  <a href={business.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {business.address_line1 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Location</p>
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

        {/* Opening Hours */}
        {business.opening_hours_text && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Opening Hours</p>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {business.opening_hours_text}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}