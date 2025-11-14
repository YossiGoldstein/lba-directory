import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function Step5Gallery({ data, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const images = data.gallery_images || [];

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
      onChange({
        ...data,
        gallery_images: [...images, ...uploadedUrls],
      });
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    onChange({
      ...data,
      gallery_images: images.filter((_, index) => index !== indexToRemove),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Gallery</CardTitle>
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
              <p className="text-gray-600 mb-4">
                Click to select images or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG up to 10MB each
              </p>
            </div>
          </label>
        </div>

        {/* Image Gallery */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>No images uploaded yet</p>
            <p className="text-sm mt-1">Add images to showcase your business</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}