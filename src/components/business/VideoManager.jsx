import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link, X, Play, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

const PLATFORM_LABELS = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  instagram: "Instagram",
  facebook: "Facebook",
  upload: "Uploaded",
};

const PLATFORM_COLORS = {
  youtube: "bg-red-600",
  vimeo: "bg-blue-500",
  instagram: "bg-pink-600",
  facebook: "bg-blue-700",
  upload: "bg-gray-600",
};

function parseVideoUrl(rawUrl) {
  const url = rawUrl.trim();

  // ── YouTube ──────────────────────────────────────────────────────────
  // Handles: watch?v=, youtu.be/, /shorts/, /embed/ (already formatted)
  const ytPatterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of ytPatterns) {
    const match = url.match(pattern);
    if (match) {
      const id = match[1];
      return {
        type: "youtube",
        url,
        embed_url: `https://www.youtube.com/embed/${id}`,
        thumbnail_url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        title: "",
      };
    }
  }

  // ── Vimeo ─────────────────────────────────────────────────────────────
  // Handles: vimeo.com/123456789, player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      type: "vimeo",
      url,
      embed_url: `https://player.vimeo.com/video/${id}`,
      thumbnail_url: "",
      title: "",
    };
  }

  // ── Instagram ─────────────────────────────────────────────────────────
  // Handles: instagram.com/reel/XXX or instagram.com/p/XXX
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (igMatch) {
    const code = igMatch[1];
    return {
      type: "instagram",
      url,
      embed_url: `https://www.instagram.com/reel/${code}/embed`,
      thumbnail_url: "",
      title: "",
    };
  }

  // ── Facebook ──────────────────────────────────────────────────────────
  if (/facebook\.com\/(watch|video|.*\/videos)/.test(url)) {
    return {
      type: "facebook",
      url,
      embed_url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`,
      thumbnail_url: "",
      title: "",
    };
  }

  return null;
}

export default function VideoManager({ value = [], onChange }) {
  const [tab, setTab] = useState("link"); // "upload" | "link"
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef(null);

  const handleAddLink = () => {
    setLinkError("");
    if (!linkInput.trim()) return;
    const parsed = parseVideoUrl(linkInput);
    if (!parsed) {
      setLinkError("Unsupported video platform. Please use YouTube, Vimeo, Instagram, or Facebook.");
      return;
    }
    onChange([...value, parsed]);
    setLinkInput("");
    toast.success("Video added!");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 50;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${MAX_MB}MB.`);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange([...value, {
        type: "upload",
        url: file_url,
        embed_url: file_url,
        thumbnail_url: "",
        title: "",
      }]);
      toast.success("Video uploaded!");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {/* Info box */}
      <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
        <span>Videos help customers see your business in action. Upload a short video (under 50MB) or paste a link to a YouTube, Vimeo, Instagram, or Facebook video you've already posted. Videos appear in a dedicated section on your listing page.</span>
      </div>

      {/* Tab toggle */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${tab === "upload" ? "bg-cyan-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
        >
          <Upload className="w-4 h-4" />
          Upload Video
        </button>
        <button
          type="button"
          onClick={() => setTab("link")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${tab === "link" ? "bg-cyan-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
        >
          <Link className="w-4 h-4" />
          Paste Link
        </button>
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <div
            onClick={() => !isUploading && fileRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 transition-colors ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <p className="text-sm font-medium">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium">Click to upload a video</p>
                <p className="text-xs text-gray-400">MP4, WebM, MOV — max 50MB</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Link tab */}
      {tab === "link" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={linkInput}
              onChange={(e) => { setLinkInput(e.target.value); setLinkError(""); }}
              placeholder="Paste a YouTube, Vimeo, Instagram, or Facebook video link"
              onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
            />
            <Button type="button" onClick={handleAddLink} className="bg-cyan-600 hover:bg-cyan-700 shrink-0">
              Add Video
            </Button>
          </div>
          {linkError && <p className="text-sm text-red-500">{linkError}</p>}
        </div>
      )}

      {/* Video grid */}
      {value.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {value.map((video, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-900 aspect-video">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt="Video thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Play className="w-8 h-8 text-white opacity-70" />
                  <span className="text-white text-xs opacity-60">VIDEO</span>
                </div>
              )}
              {/* Platform badge */}
              <span className={`absolute bottom-2 left-2 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded ${PLATFORM_COLORS[video.type] || "bg-gray-600"}`}>
                {PLATFORM_LABELS[video.type] || video.type}
              </span>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
          No videos added yet. Upload a file or paste a link above.
        </div>
      )}
    </div>
  );
}