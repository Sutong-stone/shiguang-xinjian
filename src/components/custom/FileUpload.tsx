import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, ImagePlus, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  onUploadSuccess?: (url: string) => void;
  password: string;
}

export default function FileUpload({
  onUploadSuccess,
  password,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    []
  );

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("请选择图片文件（JPG、PNG 等）");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("图片大小不能超过 10MB");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "上传失败");
      }

      onUploadSuccess?.(result.url);
      setPreviewUrl("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "上传失败";
      setUploadError(message);
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      {previewUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          <button
            onClick={() => setPreviewUrl("")}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Upload area */}
      {!previewUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-[#D4A78C] bg-[#FDECE4]/40"
              : "border-[#FDECE4] hover:border-[#D4A78C]/50 bg-white/50"
          }`}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isDragging ? "bg-[#D4A78C]" : "bg-[#FDECE4]"
              }`}
            >
              {isDragging ? (
                <ImagePlus className="w-5 h-5 text-white" />
              ) : (
                <Upload className="w-5 h-5 text-[#D4A78C]" />
              )}
            </div>
            <div>
              <p className="text-sm text-[#8C7B72]">
                点击或拖拽上传照片
              </p>
              <p className="text-xs text-[#8C7B72]/50 mt-1">
                支持 JPG、PNG 格式，最大 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-red-400 text-center"
        >
          {uploadError}
        </motion.p>
      )}
    </div>
  );
}
