"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";

interface ProfilePictureUploadProps {
  currentPicture?: string | null;
  onUploadSuccess: (url: string) => void;
}

export default function ProfilePictureUpload({ currentPicture, onUploadSuccess }: ProfilePictureUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentPicture || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (currentPicture) {
      setPreview(currentPicture);
    }
  }, [currentPicture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setFile(selected);
    setError("");
    setZoom(1);
    setPosition({ x: 0, y: 0 });

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cropAndUpload = async () => {
    if (!file || !preview || !canvasRef.current || !imageRef.current) return;

    setLoading(true);
    setError("");

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const size = 400;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const img = imageRef.current;
      const aspectRatio = img.width / img.height;
      let drawWidth, drawHeight;

      if (aspectRatio > 1) {
        drawHeight = size * zoom;
        drawWidth = drawHeight * aspectRatio;
      } else {
        drawWidth = size * zoom;
        drawHeight = drawWidth / aspectRatio;
      }

      const x = (size - drawWidth) / 2 + position.x;
      const y = (size - drawHeight) / 2 + position.y;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError("Failed to process image");
          setLoading(false);
          return;
        }

        try {
          const formData = new FormData();
          formData.append("file", blob, "profile-picture.png");

          const uploadData = await api.upload("/upload", formData);
          const pictureUrl = (uploadData as any).url;

          await api.put("/auth/profile", {
            profilePicture: pictureUrl,
          });

          onUploadSuccess(pictureUrl);
          setPreview(pictureUrl);
          setFile(null);
        } catch {
          setError("Failed to upload profile picture");
        } finally {
          setLoading(false);
        }
      }, "image/png");
    } catch {
      setError("Failed to process image");
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#F5EFE6] cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {preview ? (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${preview})`,
                backgroundSize: `${zoom * 100}%`,
                backgroundPosition: `${50 + position.x / 2}% ${50 + position.y / 2}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-[#A6987F]" />
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 p-2 bg-[#4A3428] text-white rounded-full shadow-md hover:bg-[#3A2E22] transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview && file && (
        <div className="w-full max-w-xs space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#3A2E22]">Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <p className="text-[10px] text-[#A6987F] text-center">
            Drag to reposition • Use slider to zoom
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleRemove}
              className="flex-1 py-2 border border-[#EDE3D3] text-[#3A2E22] rounded-xl text-xs font-medium hover:bg-[#F5EFE6] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={cropAndUpload}
              disabled={loading}
              className="flex-1 py-2 bg-[#4A3428] text-white rounded-xl text-xs font-medium hover:bg-[#3A2E22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1">
                  <Loader2 className="animate-spin h-3 w-3" />
                  Uploading...
                </span>
              ) : (
                "Save Photo"
              )}
            </button>
          </div>
        </div>
      )}

      {!preview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-[#8B5E3C] hover:text-[#4A3428] font-medium transition-colors"
        >
          Upload Profile Picture
        </button>
      )}

      {preview && !file && (
        <button
          onClick={handleRemove}
          className="text-xs text-red-600 hover:text-red-700 transition-colors"
        >
          Remove Picture
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <canvas ref={canvasRef} className="hidden" />
      {preview && <img ref={imageRef} src={preview} className="hidden" crossOrigin="anonymous" />}
    </div>
  );
}
