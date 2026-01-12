import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function Step5Gallery({ data, onChange }) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  
  const logo = data.logo_url || "";
  const cover = data.cover_image_url || "";
  const gallery = data.gallery_images || [];
  const isPaid = data.listing_tier === "pro" || data.listing_tier === "premium";
  const maxGalleryImages = isPaid ? 999 : 3;

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange({
        ...data,
        logo_url: file_url,
      });
      toast.success("לוגו הועלה בהצלחה!");
    } catch (error) {
      console.error("Logo upload failed:", error);
      toast.error("העלאת הלוגו נכשלה");
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleCoverUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange({
        ...data,
        cover_image_url: file_url,
      });
      toast.success("תמונת שער הועלתה בהצלחה!");
    } catch (error) {
      console.error("Cover upload failed:", error);
      toast.error("העלאת תמונת השער נכשלה");
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalWillBe = gallery.length + files.length;
    if (totalWillBe > maxGalleryImages) {
      toast.error(`אתה יכול להעלות עד ${maxGalleryImages} תמונות בסך הכל`);
      return;
    }

    setIsUploadingGallery(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange({
        ...data,
        gallery_images: [...gallery, ...uploadedUrls],
      });
      toast.success(`${uploadedUrls.length} תמונ${uploadedUrls.length === 1 ? 'ה' : 'ות'} הועל${uploadedUrls.length === 1 ? 'תה' : 'ו'} בהצלחה`);
    } catch (error) {
      console.error("Gallery upload failed:", error);
      toast.error("העלאת התמונות נכשלה");
    } finally {
      setIsUploadingGallery(false);
      e.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    onChange({
      ...data,
      logo_url: "",
    });
  };

  const handleRemoveCover = () => {
    onChange({
      ...data,
      cover_image_url: "",
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = gallery.filter((_, index) => index !== indexToRemove);
    onChange({
      ...data,
      gallery_images: updatedImages,
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-600" />
            תמונה ראשונה: לוגו העסק (חובה)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            העלו את הלוגו של העסק שלכם.
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
                    {isUploadingLogo ? "מעלה..." : "העלו לוגו"}
                  </h3>
                  <p className="text-sm text-gray-600">לחצו כדי לבחור תמונה</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-cyan-500">
                <img
                  src={logo}
                  alt="Business Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleRemoveLogo}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
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

      {/* Cover Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-600" />
            תמונה שניה: תמונת שער (חובה)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            העלו תמונת שער של העסק שלכם - זו תהיה התמונה המרכזית שתופיע בדף העסק.
          </p>

          {!cover ? (
            <div className="border-2 border-dashed border-cyan-300 rounded-lg p-8 text-center bg-cyan-50">
              <input
                type="file"
                id="cover-upload"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                disabled={isUploadingCover}
              />
              <label
                htmlFor="cover-upload"
                className={`cursor-pointer ${isUploadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isUploadingCover ? "מעלה..." : "העלו תמונת שער"}
                  </h3>
                  <p className="text-sm text-gray-600">לחצו כדי לבחור תמונה</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative inline-block">
              <div className="w-full max-w-xs h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-cyan-500">
                <img
                  src={cover}
                  alt="Cover Image"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleRemoveCover}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">תמונת שער הועלתה בהצלחה</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-600" />
            גלריית תמונות נוספות ({gallery.length}/{maxGalleryImages})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            הוסיפו תמונות נוספות של העסק, המוצרים או השירותים שלכם {isPaid ? '(ללא הגבלה)' : '(עד 3 תמונות)'}.
          </p>

          {gallery.length < maxGalleryImages && (
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
                  <p className="text-sm text-gray-600">לחצו כדי לבחור או גררו תמונות</p>
                </div>
              </label>
            </div>
          )}

          {gallery.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
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
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>עדיין לא הועלו תמונות</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}