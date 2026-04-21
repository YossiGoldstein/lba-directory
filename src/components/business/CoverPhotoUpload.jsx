import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, X, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

export default function CoverPhotoUpload({ value, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");

  const validateImage = (file) => {
    return new Promise((resolve) => {
      if (file.size > 5 * 1024 * 1024) {
        resolve({ error: "Image must be under 5MB.", warning: "" });
        return;
      }
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        let warn = "";
        if (img.width < 1200 || ratio < 4 / 3) {
          warn = "This image may appear cropped or low-quality on the listing page. We recommend uploading a landscape image of at least 1600×900 pixels.";
        }
        URL.revokeObjectURL(img.src);
        resolve({ error: "", warning: warn });
      };
      img.onerror = () => resolve({ error: "", warning: "" });
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setWarning("");

    const { error: err, warning: warn } = await validateImage(file);
    if (err) { setError(err); e.target.value = ""; return; }
    if (warn) setWarning(warn);

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
      toast.success("Cover photo uploaded!");
    } catch {
      toast.error("Cover photo upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Info box */}
      <div className="border border-blue-200 bg-blue-50 rounded-lg px-4 py-3 flex gap-2 text-sm text-blue-800">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Recommended: 1600 × 900 pixels (landscape)</p>
          <p className="text-blue-700">Keep important content in the <strong>top half</strong> of the image — the bottom is covered by your business info on the listing page. This image also appears when your listing is shared on WhatsApp, Facebook, and other social apps.</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Warning */}
      {warning && (
        <div className="flex items-center gap-2 text-yellow-700 text-sm bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {warning}
        </div>
      )}

      {!value ? (
        <div className="border-2 border-dashed border-cyan-300 rounded-lg p-6 text-center bg-cyan-50">
          <input type="file" id="cover-photo-upload" accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
          <label htmlFor="cover-photo-upload" className={`cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">{isUploading ? "Uploading..." : "Upload Cover Photo"}</p>
            <p className="text-xs text-gray-500 mt-1">Max 5MB · JPG, PNG, WEBP</p>
          </label>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border-2 border-cyan-400" style={{ aspectRatio: "16/9" }}>
          <img src={value} alt="Cover photo preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => { onChange(""); setWarning(""); setError(""); }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-3 py-1 text-center">
            Cover Photo Preview
          </div>
        </div>
      )}
    </div>
  );
}