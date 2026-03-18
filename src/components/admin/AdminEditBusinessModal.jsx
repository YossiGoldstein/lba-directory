import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Upload, Loader2, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminEditBusinessModal({ business, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.filter((c) => c.is_active);
    },
  });

  useEffect(() => {
    if (business) {
      setFormData({
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
        linkedin_url: business.linkedin_url || "",
        youtube_url: business.youtube_url || "",
        other_social_url: business.other_social_url || "",
        uber_eats_url: business.uber_eats_url || "",
        doordash_url: business.doordash_url || "",
        grubhub_url: business.grubhub_url || "",
        postmates_url: business.postmates_url || "",
        instacart_url: business.instacart_url || "",
        toast_url: business.toast_url || "",
        k1_url: business.k1_url || "",
        opening_hours_text: business.opening_hours_text || "",
        logo_url: business.logo_url || "",
        gallery_images: business.gallery_images || [],
        tags: Array.isArray(business.tags) ? business.tags.join(", ") : "",
        status: business.status || "pending",
        listing_tier: business.listing_tier || "free",
      });
    }
  }, [business]);

  const handleSave = async () => {
    if (!formData.business_name?.trim()) {
      toast.error("Business name is required");
      return;
    }

    if (!formData.phone?.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setIsLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const updateData = {
        ...formData,
        tags: tagsArray,
      };

      await base44.entities.Business.update(business.id, updateData);
      toast.success("Business updated successfully!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to update business:", error);
      toast.error("Failed to update business");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({
        ...formData,
        logo_url: file_url,
        gallery_images: [file_url, ...(formData.gallery_images || []).filter((img) => img !== file_url)],
      });
      toast.success("Logo uploaded successfully!");
    } catch (error) {
      console.error("Logo upload failed:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingGallery(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        gallery_images: [...(formData.gallery_images || []), ...uploadedUrls],
      });
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Gallery upload failed:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const imageToRemove = formData.gallery_images[indexToRemove];
    const updatedImages = formData.gallery_images.filter((_, index) => index !== indexToRemove);

    const updatedData = {
      ...formData,
      gallery_images: updatedImages,
    };

    if (imageToRemove === formData.logo_url) {
      updatedData.logo_url = "";
    }

    setFormData(updatedData);
  };

  const handleSetAsCover = (index) => {
    const newGallery = [...formData.gallery_images];
    const [coverImage] = newGallery.splice(index, 1);
    newGallery.unshift(coverImage);
    setFormData({
      ...formData,
      gallery_images: newGallery,
    });
    toast.success("Cover image updated!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Business: {business?.business_name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name || ""}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id || ""}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
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
                value={formData.short_description || ""}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long_description">Full Description</Label>
              <Textarea
                id="long_description"
                value={formData.long_description || ""}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags || ""}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="kosher, delivery, parking"
              />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number || ""}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website_url || ""}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                value={formData.address_line1 || ""}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={formData.address_line2 || ""}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip_code || ""}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Opening Hours</Label>
              <Textarea
                id="hours"
                value={formData.opening_hours_text || ""}
                onChange={(e) => setFormData({ ...formData, opening_hours_text: e.target.value })}
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-6 mt-4">
            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">Social Media</h3>
              
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook_url || ""}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/yourbusiness"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram_url || ""}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/yourbusiness"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin_url || ""}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/company/yourbusiness"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.youtube_url || ""}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/@yourbusiness"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="other_social">Other Social Media</Label>
                <Input
                  id="other_social"
                  value={formData.other_social_url || ""}
                  onChange={(e) => setFormData({ ...formData, other_social_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Delivery & Ordering */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">Online Ordering & Delivery</h3>
              
              <div className="space-y-2">
                <Label htmlFor="uber_eats">Uber Eats</Label>
                <Input
                  id="uber_eats"
                  value={formData.uber_eats_url || ""}
                  onChange={(e) => setFormData({ ...formData, uber_eats_url: e.target.value })}
                  placeholder="https://ubereats.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doordash">DoorDash</Label>
                <Input
                  id="doordash"
                  value={formData.doordash_url || ""}
                  onChange={(e) => setFormData({ ...formData, doordash_url: e.target.value })}
                  placeholder="https://doordash.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grubhub">Grubhub</Label>
                <Input
                  id="grubhub"
                  value={formData.grubhub_url || ""}
                  onChange={(e) => setFormData({ ...formData, grubhub_url: e.target.value })}
                  placeholder="https://grubhub.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postmates">Postmates</Label>
                <Input
                  id="postmates"
                  value={formData.postmates_url || ""}
                  onChange={(e) => setFormData({ ...formData, postmates_url: e.target.value })}
                  placeholder="https://postmates.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instacart">Instacart</Label>
                <Input
                  id="instacart"
                  value={formData.instacart_url || ""}
                  onChange={(e) => setFormData({ ...formData, instacart_url: e.target.value })}
                  placeholder="https://instacart.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toast">Toast</Label>
                <Input
                  id="toast"
                  value={formData.toast_url || ""}
                  onChange={(e) => setFormData({ ...formData, toast_url: e.target.value })}
                  placeholder="https://toasttab.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="k1">K1</Label>
                <Input
                  id="k1"
                  value={formData.k1_url || ""}
                  onChange={(e) => setFormData({ ...formData, k1_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Business Logo</Label>
                <div className="mt-2">
                  {formData.logo_url ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.logo_url}
                        alt="Logo"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, logo_url: "" })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploadingLogo}
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploadingLogo}
                          className="cursor-pointer"
                          asChild
                        >
                          <span>
                            {isUploadingLogo ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Logo
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Gallery Images</Label>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  The first image will be used as the cover image on the business page
                </p>
                <div className="mt-2">
                  <input
                    type="file"
                    id="gallery-upload"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                    disabled={isUploadingGallery}
                  />
                  <label htmlFor="gallery-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingGallery}
                      className="cursor-pointer mb-4"
                      asChild
                    >
                      <span>
                        {isUploadingGallery ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Images
                          </>
                        )}
                      </span>
                    </Button>
                  </label>

                  {(formData.gallery_images || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No images uploaded yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {(formData.gallery_images || []).map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Gallery ${index + 1}`}
                            className={`w-full aspect-square object-cover rounded-lg border-2 ${
                              index === 0 ? 'border-cyan-500' : 'border-gray-200'
                            }`}
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded font-semibold">
                              Cover Image
                            </div>
                          )}
                          {index !== 0 && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetAsCover(index)}
                              className="absolute bottom-2 left-2 right-2 opacity-90 hover:opacity-100"
                            >
                              <ImageIcon className="w-3 h-3 mr-1" />
                              Set as Cover
                            </Button>
                          )}
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="status">Business Status</Label>
              <Select
                value={formData.status || "pending"}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listing_tier">Listing Tier</Label>
              <Select
                value={formData.listing_tier || "free"}
                onValueChange={(value) => setFormData({ ...formData, listing_tier: value })}
              >
                <SelectTrigger id="listing_tier">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Admin can upgrade any business to premium without payment
              </p>
            </div>


          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}