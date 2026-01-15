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

        {/* Social Media & Links */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900">Social Media</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook</Label>
              <Input
                id="facebook_url"
                type="url"
                value={data.facebook_url || ""}
                onChange={(e) => onChange({ ...data, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram</Label>
              <Input
                id="instagram_url"
                type="url"
                value={data.instagram_url || ""}
                onChange={(e) => onChange({ ...data, instagram_url: e.target.value })}
                placeholder="https://instagram.com/yourbusiness"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={data.linkedin_url || ""}
                onChange={(e) => onChange({ ...data, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/company/yourbusiness"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube</Label>
              <Input
                id="youtube_url"
                type="url"
                value={data.youtube_url || ""}
                onChange={(e) => onChange({ ...data, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@yourbusiness"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Ordering */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900">Online Ordering & Delivery</h3>
          <p className="text-sm text-gray-600">Add links to your ordering/delivery platforms</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uber_eats_url">Uber Eats</Label>
              <Input
                id="uber_eats_url"
                type="url"
                value={data.uber_eats_url || ""}
                onChange={(e) => onChange({ ...data, uber_eats_url: e.target.value })}
                placeholder="https://ubereats.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doordash_url">DoorDash</Label>
              <Input
                id="doordash_url"
                type="url"
                value={data.doordash_url || ""}
                onChange={(e) => onChange({ ...data, doordash_url: e.target.value })}
                placeholder="https://doordash.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grubhub_url">Grubhub</Label>
              <Input
                id="grubhub_url"
                type="url"
                value={data.grubhub_url || ""}
                onChange={(e) => onChange({ ...data, grubhub_url: e.target.value })}
                placeholder="https://grubhub.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postmates_url">Postmates</Label>
              <Input
                id="postmates_url"
                type="url"
                value={data.postmates_url || ""}
                onChange={(e) => onChange({ ...data, postmates_url: e.target.value })}
                placeholder="https://postmates.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instacart_url">Instacart</Label>
              <Input
                id="instacart_url"
                type="url"
                value={data.instacart_url || ""}
                onChange={(e) => onChange({ ...data, instacart_url: e.target.value })}
                placeholder="https://instacart.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toast_url">Toast</Label>
              <Input
                id="toast_url"
                type="url"
                value={data.toast_url || ""}
                onChange={(e) => onChange({ ...data, toast_url: e.target.value })}
                placeholder="https://toasttab.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="k1_url">K1</Label>
              <Input
                id="k1_url"
                type="url"
                value={data.k1_url || ""}
                onChange={(e) => onChange({ ...data, k1_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}