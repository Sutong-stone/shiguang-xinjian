import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import Navigation from "@/components/custom/Navigation";
import PasswordGate from "@/components/custom/PasswordGate";
import FileUpload from "@/components/custom/FileUpload";
import { Heart, X, Calendar, Tag, Plus, ImagePlus, Loader2, Trash2, Pencil, Check, XCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AlbumCard({ album, index, isVerified, onDelete, onEdit }: {
  album: { id: number; title: string; description: string | null; imageUrl: string; isVideo: number | null; date: string | null; category: string | null };
  index: number; isVerified: boolean; onDelete: () => void; onEdit: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isVideoFile = album.isVideo === 1 || album.imageUrl.startsWith("data:video");

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.08 }} className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft hover:shadow-soft-lg transition-all duration-500">
        <div className="overflow-hidden aspect-[4/3] relative">
          {!imgLoaded && !isVideoFile && <div className="w-full h-full bg-[#FDECE4]/50 animate-pulse" />}
          {isVideoFile ? (
            <video
              src={album.imageUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
              muted
            />
          ) : (
            <img src={album.imageUrl} alt={album.title} onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} loading="lazy" />
          )}
          {isVideoFile && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 flex items-center gap-1">
              <Video className="w-3 h-3 text-white" /><span className="text-xs text-white">视频</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          {album.date && <span className="text-xs text-white/80 flex items-center gap-1"><Calendar className="w-3 h-3" />{album.date}</span>}
          <h3 className="text-lg font-medium text-white mt-1">{album.title}</h3>
          {album.description && <p className="text-sm text-white/80 mt-1 line-clamp-2">{album.description}</p>}
        </div>
        {isVerified && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#8C7B72] hover:text-[#D4A78C] hover:bg-white shadow-soft transition-all"
              title="编辑">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#8C7B72] hover:text-red-500 hover:bg-white shadow-soft transition-all"
              title="删除">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Lightbox({ album, onClose }: { album: { id: number; title: string; description: string | null; imageUrl: string; isVideo: number | null; date: string | null; category: string | null }; onClose: () => void }) {
  const isVideoFile = album.isVideo === 1 || album.imageUrl.startsWith("data:video");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#8C7B72] hover:bg-white shadow-soft">
          <X className="w-5 h-5" />
        </button>
        <div className="aspect-[16/10] overflow-hidden bg-black">
          {isVideoFile ? (
            <video src={album.imageUrl} className="w-full h-full" controls playsInline autoPlay muted />
          ) : (
            <img src={album.imageUrl} alt={album.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-3">
            {album.date && <span className="text-xs text-[#D4A78C] flex items-center gap-1"><Calendar className="w-3 h-3" />{album.date}</span>}
            {album.category && <span className="text-xs text-[#D4A78C] flex items-center gap-1"><Tag className="w-3 h-3" />{album.category}</span>}
          </div>
          <h3 className="text-2xl font-light text-[#8C7B72] mb-3">{album.title}</h3>
          {album.description && <p className="text-[#8C7B72]/70 text-sm leading-relaxed">{album.description}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditAlbumModal({ album, onSave, onClose }: {
  album: { id: number; title: string; description: string | null; imageUrl: string; date: string | null; category: string | null };
  onSave: (updates: { title: string; description: string | null; date: string | null; category: string | null }) => void; onClose: () => void;
}) {
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description || "");
  const [date, setDate] = useState(album.date || "");
  const [category, setCategory] = useState(album.category || "");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-soft-lg">
        <h3 className="text-xl font-light text-[#8C7B72] mb-6">编辑照片信息</h3>
        <div className="space-y-4">
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">标题</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] text-[#8C7B72]" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">日期</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] text-[#8C7B72]" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">分类</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] text-[#8C7B72]" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none text-sm text-[#8C7B72] resize-none bg-transparent" /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-full border-[#FDECE4] text-[#8C7B72]"><XCircle className="w-4 h-4 mr-2" />取消</Button>
          <Button onClick={() => onSave({ title, description: description || null, date: date || null, category: category || null })}
            className="flex-1 rounded-full bg-[#D4A78C] hover:bg-[#C49A7D] text-white"><Check className="w-4 h-4 mr-2" />保存</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UploadPanel({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isVideo, setIsVideo] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const createAlbum = trpc.album.create.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = () => {
    if (!title.trim() || !imageUrl || isSubmitting) return;
    setIsSubmitting(true);
    setUploadError("");
    createAlbum.mutate(
      { title: title.trim(), description: description.trim() || undefined, imageUrl, isVideo, date: date || undefined, category: category || undefined },
      {
        onSuccess: () => {
          utils.album.list.invalidate();
          setTitle(""); setDescription(""); setDate(""); setCategory(""); setImageUrl(""); setIsVideo(0); setIsSubmitting(false);
          onSuccess();
        },
        onError: (err) => {
          setIsSubmitting(false);
          setUploadError(err.message || "上传失败，请检查图片大小（不超过5MB）或刷新页面重试");
        },
      }
    );
  };

  const handleUpload = (url: string) => {
    setImageUrl(url);
    setIsVideo(url.startsWith("data:video") ? 1 : 0);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-6 md:p-8 shadow-soft mb-12">
      <div className="flex items-center gap-2 mb-6"><ImagePlus className="w-5 h-5 text-[#D4A78C]" /><span className="text-[#8C7B72] font-medium">添加新照片</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FileUpload onUploadSuccess={handleUpload} />
          {imageUrl && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2"><Heart className="w-3 h-3" fill="currentColor" />{isVideo ? "视频" : "图片"}已准备好！</motion.div>}
        </div>
        <div className="space-y-4">
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">照片标题 *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：宝贝的第一百天"
              className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] text-[#8C7B72] placeholder:text-[#8C7B72]/40" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">日期</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] text-[#8C7B72]" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">分类</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="如：满月、百天、生日"
              className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] text-[#8C7B72] placeholder:text-[#8C7B72]/40" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="写下这张照片背后的故事..." rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none text-sm text-[#8C7B72] resize-none bg-transparent" /></div>
          {uploadError && (
            <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {uploadError}
            </div>
          )}
          <Button onClick={handleSubmit} disabled={!title.trim() || !imageUrl || isSubmitting}
            className="w-full bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full shadow-soft transition-all duration-300">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />保存中...</> : <><Plus className="w-4 h-4 mr-2" />添加到相册</>}
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
  const { isVerified, showDialog, setShowDialog, error, verify } = usePasswordAuth();
  const [selectedAlbum, setSelectedAlbum] = useState<NonNullable<typeof albums>[0] | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<NonNullable<typeof albums>[0] | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const utils = trpc.useUtils();

  const deleteAlbumMut = trpc.album.delete.useMutation({
    onSuccess: () => { utils.album.list.invalidate(); setSelectedAlbum(null); },
  });
  const updateAlbumMut = trpc.album.update.useMutation({
    onSuccess: () => { utils.album.list.invalidate(); setEditingAlbum(null); },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("确定要删除这张照片吗？")) deleteAlbumMut.mutate({ id });
  };

  const handleEditSave = (updates: { title: string; description: string | null; date: string | null; category: string | null }) => {
    if (editingAlbum) {
      const payload: Record<string, unknown> = { id: editingAlbum.id, title: updates.title };
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.category !== undefined) payload.category = updates.category;
      updateAlbumMut.mutate(payload as { id: number; title?: string; description?: string; imageUrl?: string; date?: string; category?: string });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      <Navigation />
      <div ref={headerRef} className="pt-24 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-[#D4A78C]" fill="currentColor" />
              <span className="text-sm text-[#D4A78C] tracking-wider">PHOTO ALBUM</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light mb-4" style={{ color: "#8C7B72" }}>成长相册</h1>
            <p className="text-sm text-[#8C7B72]/60 max-w-md mx-auto mb-8">每一张照片都承载着一段回忆</p>
            {isVerified ? (
              <Button onClick={() => setShowUpload(!showUpload)} className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-6 shadow-soft transition-all duration-300">
                {showUpload ? "取消上传" : <><ImagePlus className="w-4 h-4 mr-2" />上传新照片</>}
              </Button>
            ) : (
              <Button onClick={() => setShowDialog(true)} variant="outline" className="rounded-full border-[#D4A78C] text-[#D4A78C] hover:bg-[#FDECE4] px-6">
                <ImagePlus className="w-4 h-4 mr-2" />输入密码上传照片
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        <AnimatePresence>
          {isVerified && showUpload && <UploadPanel onSuccess={() => setShowUpload(false)} />}
        </AnimatePresence>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-20"><div className="w-8 h-8 border-2 border-[#D4A78C] border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-sm text-[#8C7B72]/60 mt-4">加载中...</p></div>
        ) : albums && albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album, idx) => (
              <AlbumCard key={album.id} album={album} index={idx} isVerified={isVerified}
                onDelete={() => handleDelete(album.id)} onEdit={() => setEditingAlbum(album)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20"><ImagePlus className="w-12 h-12 text-[#D4A78C]/30 mx-auto mb-4" /><p className="text-[#8C7B72]/60">相册还是空的，上传第一张照片吧</p></div>
        )}
      </div>

      <AnimatePresence>
        {selectedAlbum && <Lightbox album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editingAlbum && <EditAlbumModal album={editingAlbum} onSave={handleEditSave} onClose={() => setEditingAlbum(null)} />}
      </AnimatePresence>
      <PasswordGate isOpen={showDialog} onClose={() => setShowDialog(false)} onVerify={verify} error={error} isLoading={false} />
    </div>
  );
}
