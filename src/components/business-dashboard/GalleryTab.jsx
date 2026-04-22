import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import CoverPhotoUpload from "@/components/business/CoverPhotoUpload";
import VideoManager from "@/components/business/VideoManager";

export default function GalleryTab({ business, onBusinessUpdate }) {
  const [images, setImages] = useState(business.gallery_images || []);
  const [logoUrl, setLogoUrl] = useState(business.logo_url || "");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(business.cover_photo_url || "");
  const [videos, setVideos] = useState(business.videos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(file_url);
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.Business.update(business.id, {
        gallery_images: images,
        logo_url: logoUrl,
        cover_photo_url: coverPhotoUrl,
        videos: videos,
      });
      toast.success("Gallery saved successfully!");
      if (onBusinessUpdate) onBusinessUpdate();
    } catch (error) {
      toast.error("Failed to save gallery");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="w-5 h-5" />
            Business Logo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>
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
                <Button asChild variant="outline" className="cursor-pointer" disabled={isUploadingLogo}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB. Shown as circular icon.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="w-5 h-5" />
            Cover Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CoverPhotoUpload value={coverPhotoUrl} onChange={setCoverPhotoUrl} />
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="w-5 h-5" />
            Business Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="gallery-upload"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor="gallery-upload"
              className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isUploading ? "Uploading..." : "Upload Images"}
                </h3>
                <p className="text-gray-600 mb-2">Click to select images or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
              </div>
            </label>
          </div>

          {/* Image Gallery */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent">
                    <img src={imageUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>No images uploaded yet</p>
              <p className="text-sm mt-1">Add images to showcase your business</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              className="bg-cyan-600 hover:bg-cyan-700"
              disabled={isSaving || isUploading || isUploadingLogo}
            >
              {isSaving ? "Saving..." : "Save Gallery"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="w-5 h-5" />
            Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VideoManager value={videos} onChange={setVideos} />
          <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
            <Button
              onClick={handleSave}
              className="bg-cyan-600 hover:bg-cyan-700"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Videos"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}