import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Step3Location({ data, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location & Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Address</h3>
          
          <div className="space-y-2">
            <Label htmlFor="address_line1">Street Address</Label>
            <Input
              id="address_line1"
              value={data.address_line1 || ""}
              onChange={(e) => onChange({ ...data, address_line1: e.target.value })}
              placeholder="123 Main Street"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line2">Apartment, Suite, etc.</Label>
            <Input
              id="address_line2"
              value={data.address_line2 || ""}
              onChange={(e) => onChange({ ...data, address_line2: e.target.value })}
              placeholder="Suite 200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.city || "Lakewood"}
                onChange={(e) => onChange({ ...data, city: e.target.value })}
                placeholder="Lakewood"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={data.state || "NJ"}
                onChange={(e) => onChange({ ...data, state: e.target.value })}
                placeholder="NJ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={data.zip_code || ""}
                onChange={(e) => onChange({ ...data, zip_code: e.target.value })}
                placeholder="08701"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900">Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone || ""}
                onChange={(e) => onChange({ ...data, phone: e.target.value })}
                placeholder="+1 (732) 555-0123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                value={data.whatsapp_number || ""}
                onChange={(e) => onChange({ ...data, whatsapp_number: e.target.value })}
                placeholder="+1 (732) 555-0123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email || ""}
              onChange={(e) => onChange({ ...data, email: e.target.value })}
              placeholder="info@business.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input
              id="website_url"
              type="url"
              value={data.website_url || ""}
              onChange={(e) => onChange({ ...data, website_url: e.target.value })}
              placeholder="https://www.business.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}