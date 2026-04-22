import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import Navigation from "@/components/custom/Navigation";
import PasswordGate from "@/components/custom/PasswordGate";
import FileUpload from "@/components/custom/FileUpload";
import {
  Heart,
  X,
  Calendar,
  Tag,
  Plus,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AlbumCard({
  album,
  index,
  onClick,
}: {
  album: {
    id: number;
    title: string;
    description?: string | null;
    imageUrl: string;
    date?: string | null;
    category?: string | null;
  };
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft hover:shadow-soft-lg transition-all duration-500">
        <div className="overflow-hidden aspect-[4/3]">
          <img
            src={album.imageUrl}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-2 mb-1">
            {album.date && (
              <span className="text-xs text-white/80 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {album.date}
              </span>
            )}
            {album.category && (
              <span className="text-xs text-white/80 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {album.category}
              </span>
            )}
          </div>
          <h3 className="text-lg font-medium text-white">{album.title}</h3>
          {album.description && (
            <p className="text-sm text-white/80 mt-1 line-clamp-2">
              {album.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Lightbox({
  album,
  onClose,
}: {
  album: {
    id: number;
    title: string;
    description?: string | null;
    imageUrl: string;
    date?: string | null;
    category?: string | null;
  };
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#8C7B72] hover:bg-white transition-colors shadow-soft"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={album.imageUrl}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-3">
            {album.date && (
              <span className="text-xs text-[#D4A78C] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {album.date}
              </span>
            )}
            {album.category && (
              <span className="text-xs text-[#D4A78C] flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {album.category}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-light text-[#8C7B72] mb-3">
            {album.title}
          </h3>
          {album.description && (
            <p className="text-[#8C7B72]/70 text-sm leading-relaxed">
              {album.description}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function UploadPanel({
  password,
  onSuccess,
}: {
  password: string;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();

  const createAlbum = trpc.album.create.useMutation({
    onSuccess: () => {
      utils.album.list.invalidate();
      setTitle("");
      setDescription("");
      setDate("");
      setCategory("");
      setImageUrl("");
      setIsSubmitting(false);
      onSuccess();
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !imageUrl || isSubmitting) return;
    setIsSubmitting(true);
    createAlbum.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      imageUrl,
      date: date || undefined,
      category: category || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-6 md:p-8 shadow-soft mb-12"
    >
      <div className="flex items-center gap-2 mb-6">
        <ImagePlus className="w-5 h-5 text-[#D4A78C]" />
        <span className="text-[#8C7B72] font-medium">添加新照片</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: File upload */}
        <div>
          <FileUpload
            password={password}
            onUploadSuccess={(url) => setImageUrl(url)}
          />
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2"
            >
              <Heart className="w-3 h-3" fill="currentColor" />
              图片上传成功！
            </motion.div>
          )}
        </div>

        {/* Right: Photo info */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#8C7B72]/60 mb-1.5 block">
              照片标题 *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：宝贝的第一百天"
              className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] focus:ring-[#D4A78C]/20 text-[#8C7B72] placeholder:text-[#8C7B72]/40"
            />
          </div>
          <div>
            <label className="text-xs text-[#8C7B72]/60 mb-1.5 block">
              日期
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] focus:ring-[#D4A78C]/20 text-[#8C7B72]"
            />
          </div>
          <div>
            <label className="text-xs text-[#8C7B72]/60 mb-1.5 block">
              分类
            </label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="如：满月、百天、生日"
              className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] focus:ring-[#D4A78C]/20 text-[#8C7B72] placeholder:text-[#8C7B72]/40"
            />
          </div>
          <div>
            <label className="text-xs text-[#8C7B72]/60 mb-1.5 block">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="写下这张照片背后的故事..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none focus:ring-2 focus:ring-[#D4A78C]/10 text-sm text-[#8C7B72] placeholder:text-[#8C7B72]/40 resize-none bg-transparent"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !imageUrl || isSubmitting}
            className="w-full bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full shadow-soft transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                添加到相册
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AlbumPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true });
  const { data: albums, isLoading } = trpc.album.list.useQuery();
  const [selectedAlbum, setSelectedAlbum] = useState<{
    id: number;
    title: string;
    description: string | null;
    imageUrl: string;
    date: string | null;
    category: string | null;
    createdAt: Date;
  } | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const {
    isVerified,
    showDialog,
    setShowDialog,
    error,
    verify,
    isLoading: verifyLoading,
    password,
  } = usePasswordAuth();

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      <Navigation />

      {/* Header */}
      <div ref={headerRef} className="pt-24 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-[#D4A78C]" fill="currentColor" />
              <span className="text-sm text-[#D4A78C] tracking-wider">
                PHOTO ALBUM
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-light mb-4"
              style={{ color: "#8C7B72" }}
            >
              成长相册
            </h1>
            <p className="text-sm text-[#8C7B72]/60 max-w-md mx-auto mb-8">
              每一张照片都承载着一段回忆，翻阅这些画面，就像重新走过了那些温暖的时光
            </p>

            {/* Upload toggle */}
            {isVerified ? (
              <Button
                onClick={() => setShowUpload(!showUpload)}
                className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-6 shadow-soft transition-all duration-300"
              >
                {showUpload ? (
                  "取消上传"
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4 mr-2" />
                    上传新照片
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setShowDialog(true)}
                variant="outline"
                className="rounded-full border-[#D4A78C] text-[#D4A78C] hover:bg-[#FDECE4] px-6"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                输入密码上传照片
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Upload panel */}
      <div className="max-w-[1200px] mx-auto px-6">
        <AnimatePresence>
          {isVerified && showUpload && password && (
            <UploadPanel
              password={password}
              onSuccess={() => setShowUpload(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-[1200px] mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4A78C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#8C7B72]/60 mt-4">加载中...</p>
          </div>
        ) : albums && albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album, idx) => (
              <AlbumCard
                key={album.id}
                album={album}
                index={idx}
                onClick={() => setSelectedAlbum(album)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ImagePlus className="w-12 h-12 text-[#D4A78C]/30 mx-auto mb-4" />
            <p className="text-[#8C7B72]/60">相册还是空的，上传第一张照片吧</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedAlbum && (
          <Lightbox
            album={selectedAlbum}
            onClose={() => setSelectedAlbum(null)}
          />
        )}
      </AnimatePresence>

      {/* Password Dialog */}
      <PasswordGate
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onVerify={verify}
        error={error}
        isLoading={verifyLoading}
      />
    </div>
  );
}
