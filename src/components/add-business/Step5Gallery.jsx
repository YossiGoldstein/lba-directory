import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function Step5Gallery({ data, onChange }) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  
  const logo = data.logo_url || "";
  const images = data.gallery_images || [];

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Set as logo and also add to gallery as first image
      onChange({
        ...data,
        logo_url: file_url,
        gallery_images: [file_url, ...images.filter(img => img !== file_url)],
      });
      
      toast.success("Logo uploaded successfully!");
    } catch (error) {
      console.error("Logo upload failed:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingGallery(true);

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
      toast.success(`${uploadedUrls.length} תמונ${uploadedUrls.length === 1 ? 'ה' : 'ות'} הועל${uploadedUrls.length === 1 ? 'תה' : 'ו'} בהצלחה`);
    } catch (error) {
      console.error("Gallery upload failed:", error);
      toast.error("העלאת התמונות נכשלה");
    } finally {
      setIsUploadingGallery(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    // Remove from logo_url and from gallery
    onChange({
      ...data,
      logo_url: "",
      gallery_images: images.filter(img => img !== logo),
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    const imageToRemove = images[indexToRemove];
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    
    // If removing the logo from gallery, also clear logo_url
    const updatedData = {
      ...data,
      gallery_images: updatedImages,
    };
    
    if (imageToRemove === logo) {
      updatedData.logo_url = "";
    }
    
    onChange(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-600" />
            לוגו העסק (חובה)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            העלו את הלוגו של העסק. זה יהיה גם התמונה הראשית שתופיע בכרטיס העסק.
          </p>

          {!logo ? (
            <div className="border-2 border-dashed border-cyan-300 rounded-lg p-8 text-center bg-cyan-50">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isUploadingLogo}
              />
              <label
                htmlFor="logo-upload"
                className={`cursor-pointer ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isUploadingLogo ? "מעלה לוגו..." : "העלו לוגו"}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    לחצו כאן כדי לבחור קובץ
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG עד 10MB
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative inline-block">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-cyan-500">
                <img
                  src={logo}
                  alt="Business Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleRemoveLogo}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">לוגו הועלה בהצלחה</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-600" />
            גלריית תמונות נוספות (אופציונלי)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            הוסיפו תמונות נוספות של העסק, המוצרים או השירותים שלכם (עד 10 תמונות).
          </p>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="gallery-upload"
              multiple
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
              disabled={isUploadingGallery}
            />
            <label
              htmlFor="gallery-upload"
              className={`cursor-pointer ${isUploadingGallery ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isUploadingGallery ? "מעלה תמונות..." : "הוסיפו תמונות"}
                </h3>
                <p className="text-gray-600 mb-4">
                  לחצו כדי לבחור תמונות או גררו אותן לכאן
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG עד 10MB לכל תמונה
                </p>
              </div>
            </label>
          </div>

          {/* Image Gallery */}
          {images.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  {images.length} תמונ{images.length === 1 ? 'ה' : 'ות'} בגלריה
                </h4>
                {logo && (
                  <div className="text-xs text-gray-500">
                    התמונה הראשונה היא הלוגו שלכם
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className={`aspect-square rounded-lg overflow-hidden bg-gray-100 ${imageUrl === logo ? 'ring-2 ring-cyan-500' : ''}`}>
                      <img
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {imageUrl === logo && (
                        <div className="absolute bottom-0 left-0 right-0 bg-cyan-500 text-white text-xs py-1 text-center font-medium">
                          לוגו
                        </div>
                      )}
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
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>עדיין לא הועלו תמונות</p>
              <p className="text-sm mt-1">הוסיפו תמונות כדי להציג את העסק שלכם</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}