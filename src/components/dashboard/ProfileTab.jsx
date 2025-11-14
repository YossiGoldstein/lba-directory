import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Globe, Check } from "lucide-react";
import { toast } from "sonner";

export default function ProfileTab({ user, onUserUpdate }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    preferred_language: user?.preferred_language || "he",
    shomer_shabbos: user?.shomer_shabbos !== false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate phone (US format)
      if (formData.phone && !/^[\d\s\-\(\)]+$/.test(formData.phone)) {
        toast.error("Please enter a valid US phone number");
        setIsSaving(false);
        return;
      }

      await base44.auth.updateMe({
        phone: formData.phone,
        preferred_language: formData.preferred_language,
        shomer_shabbos: formData.shomer_shabbos,
      });

      toast.success("Profile updated successfully!");
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
            <p className="text-xs text-gray-500">Contact support to change your name</p>
          </div>

          {/* Email - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
            <p className="text-xs text-gray-500">Contact support to change your email</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (732) 555-0123"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select
              value={formData.preferred_language}
              onValueChange={(value) => setFormData({ ...formData, preferred_language: value })}
            >
              <SelectTrigger id="language">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="he">עברית (Hebrew)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shomer Shabbos */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="shomer_shabbos"
              checked={formData.shomer_shabbos}
              onChange={(e) => setFormData({ ...formData, shomer_shabbos: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="shomer_shabbos" className="cursor-pointer flex-1">
              <span className="font-medium text-gray-900">Shomer Shabbos</span>
              <p className="text-sm text-gray-600 mt-1">
                Help us provide you with more relevant suggestions
              </p>
            </Label>
            {formData.shomer_shabbos && (
              <Check className="w-5 h-5 text-blue-600" />
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}