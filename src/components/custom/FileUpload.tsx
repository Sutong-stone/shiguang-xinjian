import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, ImagePlus, X, Loader2, Video, FileImage } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  acceptVideo?: boolean;
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

  const processFile = (file: File) => {
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

    // Size limits: images 5MB, videos 10MB (localStorage is limited)
    const maxSize = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(isVideo ? "视频大小不能超过 10MB" : "图片大小不能超过 5MB");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      setFileType(isVideo ? "video" : "image");
      setIsUploading(false);
      onUploadSuccess(dataUrl);
    };
    reader.onerror = () => { setUploadError("文件读取失败"); setIsUploading(false); };
    reader.readAsDataURL(file);
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
            {...(acceptVideo ? { capture: "environment" } : {})}
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
                图片最大 5MB，视频最大 10MB
              </p>
              <p className="text-xs text-[#D4A78C]/70 mt-1">手机上可直接拍照或从相册选择</p>
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
