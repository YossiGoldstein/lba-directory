import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Phone, Globe, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";

export default function EditBusinessTab({ business, onBusinessUpdate }) {
  const [formData, setFormData] = useState({
    business_name: business.business_name || "",
    category_id: business.category_id || "",
    short_description: business.short_description || "",
    long_description: business.long_description || "",
    address_line1: business.address_line1 || "",
    address_line2: business.address_line2 || "",
    city: business.city || "",
    state: business.state || "",
    zip_code: business.zip_code || "",
    phone: business.phone || "",
    whatsapp_number: business.whatsapp_number || "",
    email: business.email || "",
    website_url: business.website_url || "",
    facebook_url: business.facebook_url || "",
    instagram_url: business.instagram_url || "",
    other_social_url: business.other_social_url || "",
    tags: business.tags ? business.tags.join(", ") : "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.filter(c => c.is_active);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validation
      if (!formData.business_name.trim()) {
        toast.error("Business name is required");
        setIsSaving(false);
        return;
      }

      if (!formData.category_id) {
        toast.error("Category is required");
        setIsSaving(false);
        return;
      }

      if (!formData.city.trim()) {
        toast.error("City is required");
        setIsSaving(false);
        return;
      }

      // Phone validation (US format)
      if (formData.phone && !/^[\d\s\-\(\)]+$/.test(formData.phone)) {
        toast.error("Please enter a valid US phone number");
        setIsSaving(false);
        return;
      }

      // Process tags
      const tagsArray = formData.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const updateData = {
        ...formData,
        tags: tagsArray,
      };

      await base44.entities.Business.update(business.id, updateData);
      
      toast.success("Business information updated successfully!");
      if (onBusinessUpdate) {
        onBusinessUpdate();
      }
    } catch (error) {
      console.error("Failed to update business:", error);
      toast.error("Failed to update business. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({...formData, business_name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({...formData, category_id: value})}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => setFormData({...formData, short_description: e.target.value})}
              placeholder="Brief description (shows in search results)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="long_description">Full Description</Label>
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => setFormData({...formData, long_description: e.target.value})}
              placeholder="Detailed business description"
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_line1">Street Address</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
              placeholder="123 Main Street"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line2">Apartment, Suite, etc.</Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
              placeholder="Suite 200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Lakewood"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="NJ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                placeholder="08701"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 (732) 555-0123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                placeholder="+1 (732) 555-0123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="info@business.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Online Presence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Online Presence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({...formData, website_url: e.target.value})}
              placeholder="https://www.business.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook_url">Facebook Page</Label>
            <Input
              id="facebook_url"
              type="url"
              value={formData.facebook_url}
              onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
              placeholder="https://facebook.com/business"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram Profile</Label>
            <Input
              id="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
              placeholder="https://instagram.com/business"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="other_social_url">Other Social Media</Label>
            <Input
              id="other_social_url"
              type="url"
              value={formData.other_social_url}
              onChange={(e) => setFormData({...formData, other_social_url: e.target.value})}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            Tags & Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Textarea
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="kosher, catering, delivery, parking"
              rows={2}
            />
            <p className="text-xs text-gray-500">
              Add relevant keywords to help customers find your business
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-700 px-8"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}