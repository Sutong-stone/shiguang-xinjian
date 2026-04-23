import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, ImagePlus, X, Loader2, Video, FileImage } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  acceptVideo?: boolean;
}

// Compress image using canvas to reduce file size for mobile uploads
function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Use JPEG for smaller size; fallback to PNG if image has transparency
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error("Image load failed for compression"));
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function FileUpload({ onUploadSuccess, acceptVideo = true }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileType, setFileType] = useState<"image" | "video" | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, []);

  const processFile = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setUploadError("请选择图片或视频文件");
      return;
    }
    if (isVideo && !acceptVideo) {
      setUploadError("此位置不支持视频上传");
      return;
    }

    // Size limits before compression: images 20MB, videos 50MB
    const maxSize = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(isVideo ? "视频大小不能超过 50MB" : "图片大小不能超过 20MB");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      let dataUrl: string;
      if (isImage) {
        // Compress image on client side to avoid iOS POST size limits
        dataUrl = await compressImage(file, 1200, 0.8);
      } else {
        // Video: read as data URL (keep original, but warn if too large)
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("视频读取失败"));
          reader.readAsDataURL(file);
        });
      }
      setPreviewUrl(dataUrl);
      setFileType(isVideo ? "video" : "image");
      setIsUploading(false);
      onUploadSuccess(dataUrl);
    } catch (err: any) {
      setUploadError(err?.message || "文件处理失败，请重试");
      setIsUploading(false);
    }
  };

  const acceptTypes = acceptVideo ? "image/*,video/*" : "image/*";

  return (
    <div className="space-y-4">
      {/* Preview */}
      {previewUrl && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-2xl overflow-hidden">
          {fileType === "video" ? (
            <video src={previewUrl} controls className="w-full h-48 object-cover" />
          ) : (
            <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          <button onClick={() => { setPreviewUrl(""); setFileType(""); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
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
            isDragging ? "border-[#D4A78C] bg-[#FDECE4]/40" : "border-[#FDECE4] hover:border-[#D4A78C]/50 bg-white/50"
          }`}
        >
          <Input ref={fileInputRef} type="file" accept={acceptTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? "bg-[#D4A78C]" : "bg-[#FDECE4]"
            }`}>
              {isDragging ? <ImagePlus className="w-5 h-5 text-white" /> : <Upload className="w-5 h-5 text-[#D4A78C]" />}
            </div>
            <div>
              <p className="text-sm text-[#8C7B72]">点击或拖拽上传</p>
              <p className="text-xs text-[#8C7B72]/50 mt-1">
                {acceptVideo ? (
                  <span className="flex items-center justify-center gap-1">
                    <FileImage className="w-3 h-3" />图片 <Video className="w-3 h-3 ml-1" />视频
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <FileImage className="w-3 h-3" />图片
                  </span>
                )}
              </p>
              <p className="text-xs text-[#8C7B72]/50 mt-1">
                图片会自动压缩，视频最大 50MB
              </p>
              <p className="text-xs text-[#D4A78C]/70 mt-1">
                手机可直接拍照或从相册选择
              </p>
              {acceptVideo && (
                <p className="text-xs text-amber-500/80 mt-1">
                  提示：部分视频格式可能无法播放，建议上传 MP4(H.264) 格式
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 text-center">{uploadError}</motion.p>
      )}
    </div>
  );
}
