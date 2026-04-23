import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import Navigation from "@/components/custom/Navigation";
import PasswordGate from "@/components/custom/PasswordGate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle, Send, Heart, Lock, Quote, Trash2, PenLine, Check, XCircle,
} from "lucide-react";

function MessageCard({ message, index, isVerified, onDelete, onEdit }: {
  message: { id: number; content: string; authorName: string; createdAt: Date }; index: number;
  isVerified: boolean; onDelete: () => void; onEdit: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (index % 10) * 0.08 }} className="relative">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft paper-texture">
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#D4A78C]/20 rounded-tl-xl" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#D4A78C]/20 rounded-br-xl" />
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FDECE4] flex items-center justify-center">
            <span className="text-sm text-[#D4A78C] font-medium">{message.authorName.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#8C7B72]">{message.authorName}</span>
                <span className="text-xs text-[#D4A78C]">{new Date(message.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              {isVerified && (
                <div className="flex gap-1">
                  <button onClick={onEdit} className="p-2 rounded-full text-[#8C7B72]/30 hover:text-[#D4A78C] hover:bg-[#FDECE4] transition-all"><PenLine className="w-4 h-4" /></button>
                  <button onClick={onDelete} className="p-2 rounded-full text-[#8C7B72]/30 hover:text-red-400 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <div className="relative">
              <Quote className="absolute -left-1 -top-2 w-6 h-6 text-[#FDECE4]" />
              <p className="text-[#8C7B72]/80 text-sm leading-relaxed pl-5 whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EditMessageModal({ message, onSave, onClose }: {
  message: { id: number; content: string; authorName: string }; onSave: (content: string, authorName: string) => void; onClose: () => void;
}) {
  const [content, setContent] = useState(message.content);
  const [authorName, setAuthorName] = useState(message.authorName);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-soft-lg">
        <h3 className="text-xl font-light text-[#8C7B72] mb-6">编辑寄语</h3>
        <div className="space-y-4">
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">署名</label>
            <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none text-sm text-[#8C7B72] bg-transparent" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">内容</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
              className="w-full px-3 py-2 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none text-sm text-[#8C7B72] resize-none bg-transparent leading-relaxed" /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-full border-[#FDECE4] text-[#8C7B72]"><XCircle className="w-4 h-4 mr-2" />取消</Button>
          <Button onClick={() => onSave(content, authorName)} className="flex-1 rounded-full bg-[#D4A78C] hover:bg-[#C49A7D] text-white"><Check className="w-4 h-4 mr-2" />保存</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MessagesPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true });
  const { isVerified, showDialog, setShowDialog, error, verify } = usePasswordAuth();
  const { data: messages, isLoading } = trpc.message.list.useQuery();
  const utils = trpc.useUtils();

  const [newMessage, setNewMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMessage, setEditingMessage] = useState<NonNullable<typeof messages>[0] | null>(null);

  const createMsg = trpc.message.create.useMutation({
    onSuccess: () => { utils.message.list.invalidate(); setNewMessage(""); setAuthorName(""); setIsSubmitting(false); },
    onError: () => setIsSubmitting(false),
  });
  const updateMsg = trpc.message.update.useMutation({
    onSuccess: () => { utils.message.list.invalidate(); setEditingMessage(null); },
    onError: (err) => { alert(err.message || "更新失败"); },
  });
  const deleteMsg = trpc.message.delete.useMutation({
    onSuccess: () => { utils.message.list.invalidate(); },
    onError: (err) => { alert(err.message || "删除失败"); },
  });

  const handleSubmit = () => {
    if (!newMessage.trim() || !authorName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    createMsg.mutate({ content: newMessage.trim(), authorName: authorName.trim() });
  };

  const handleDelete = (id: number) => { if (window.confirm("确定要删除这条寄语吗？")) deleteMsg.mutate({ id }); };

  const handleEditSave = (content: string, authorName: string) => {
    if (editingMessage) updateMsg.mutate({ id: editingMessage.id, content: content.trim(), authorName: authorName.trim() });
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      <Navigation />
      <div ref={headerRef} className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#D4A78C]" />
              <span className="text-sm text-[#D4A78C] tracking-wider">PARENTS' LETTERS</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light mb-4" style={{ color: "#8C7B72" }}>父母寄语</h1>
            <p className="text-sm text-[#8C7B72]/60 max-w-lg mx-auto">这些文字承载着父母最深沉的爱与期盼</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mb-16">
        {isVerified ? (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft">
              <div className="flex items-center gap-2 mb-5"><PenLine className="w-5 h-5 text-[#D4A78C]" /><span className="text-[#8C7B72] font-medium">写一封信给宝贝...</span></div>
              <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="你的名字（如：妈妈、爸爸）"
                className="w-full mb-4 px-4 py-2.5 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none focus:ring-2 focus:ring-[#D4A78C]/10 text-sm text-[#8C7B72] placeholder:text-[#8C7B72]/40 bg-transparent" />
              <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="写下此刻的心情、对宝宝的祝福..."
                className="min-h-[160px] resize-none border-[#FDECE4] focus:border-[#D4A78C] focus:ring-[#D4A78C]/20 text-[#8C7B72] placeholder:text-[#8C7B72]/40 bg-transparent leading-relaxed" />
              <div className="flex justify-between items-center mt-5">
                <span className="text-xs text-[#8C7B72]/40">{newMessage.length} / 2000 字</span>
                <Button onClick={handleSubmit} disabled={!newMessage.trim() || !authorName.trim() || isSubmitting}
                  className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-8 shadow-soft transition-all duration-300">
                  <Send className="w-4 h-4 mr-2" />{isSubmitting ? "发送中..." : "发布寄语"}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-10 shadow-soft max-w-md mx-auto">
              <Lock className="w-10 h-10 text-[#D4A78C] mx-auto mb-5" />
              <h3 className="text-lg font-medium text-[#8C7B72] mb-2">输入密码即可留言</h3>
              <p className="text-sm text-[#8C7B72]/60 mb-6">向家人分享访问密码，大家都可以在这里记录对宝宝的爱</p>
              <Button onClick={() => setShowDialog(true)} className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-10 shadow-soft">
                <Heart className="w-4 h-4 mr-2" fill="currentColor" />输入密码
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24 space-y-6">
        {isLoading ? (
          <div className="text-center py-20"><div className="w-8 h-8 border-2 border-[#D4A78C] border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-sm text-[#8C7B72]/60 mt-4">加载中...</p></div>
        ) : messages && messages.length > 0 ? messages.map((msg, idx) => (
          <MessageCard key={msg.id} message={msg} index={idx} isVerified={isVerified}
            onDelete={() => handleDelete(msg.id)} onEdit={() => setEditingMessage(msg)} />
        )) : (
          <div className="text-center py-20"><MessageCircle className="w-12 h-12 text-[#D4A78C]/30 mx-auto mb-4" /><p className="text-[#8C7B72]/60">还没有寄语，来写第一封信吧</p></div>
        )}
      </div>

      <AnimatePresence>
        {editingMessage && <EditMessageModal message={editingMessage}
          onSave={handleEditSave} onClose={() => setEditingMessage(null)} />}
      </AnimatePresence>
      <PasswordGate isOpen={showDialog} onClose={() => setShowDialog(false)} onVerify={verify} error={error} isLoading={false} />
    </div>
  );
}
