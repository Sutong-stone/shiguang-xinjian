import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import Navigation from "@/components/custom/Navigation";
import PasswordGate from "@/components/custom/PasswordGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles, Smile, RotateCw, Mic, Footprints, ArrowUp, Star, Baby, Clock,
  Plus, Trash2, Pencil, Check, XCircle, Lock,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  star: <Star className="w-6 h-6" />, smile: <Smile className="w-6 h-6" />, rotate: <RotateCw className="w-6 h-6" />,
  mic: <Mic className="w-6 h-6" />, footprints: <Footprints className="w-6 h-6" />,
  "arrow-up": <ArrowUp className="w-6 h-6" />, sparkles: <Sparkles className="w-6 h-6" />, baby: <Baby className="w-6 h-6" />,
};

const ICON_OPTIONS = [
  { key: "smile", label: "微笑" }, { key: "rotate", label: "翻身" }, { key: "mic", label: "说话" },
  { key: "footprints", label: "爬行" }, { key: "arrow-up", label: "站立" },
  { key: "star", label: "星星" }, { key: "baby", label: "宝宝" }, { key: "sparkles", label: "闪耀" },
];

function TimelineCard({ ms, index, isVerified, onDelete, onEdit }: {
  ms: { id: number; title: string; description: string | null; date: string; icon: string }; index: number;
  isVerified: boolean; onDelete: () => void; onEdit: () => void;
}) {
  const isLeft = index % 2 === 0;
  return (
    <motion.div initial={{ opacity: 0, x: isLeft ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
      <div className={`flex flex-col md:flex-row items-start gap-6 md:gap-12 ${isLeft ? "" : "md:flex-row-reverse"}`}>
        <div className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 inline-block text-left max-w-md w-full relative group">
            {isVerified && (
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="w-7 h-7 rounded-full bg-[#FDECE4] flex items-center justify-center text-[#8C7B72] hover:text-[#D4A78C] transition-colors">
                  <Pencil className="w-3 h-3" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="w-7 h-7 rounded-full bg-[#FDECE4] flex items-center justify-center text-[#8C7B72] hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" /></button>
              </div>
            )}
            <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-[#D4A78C]" />
              <span className="text-xs text-[#D4A78C] tracking-wider">{ms.date}</span></div>
            <h3 className="text-xl font-medium text-[#8C7B72] mb-2">{ms.title}</h3>
            {ms.description && <p className="text-sm text-[#8C7B72]/60 leading-relaxed">{ms.description}</p>}
          </motion.div>
        </div>
        <div className="flex flex-col items-center flex-shrink-0 relative">
          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}
            className="w-14 h-14 rounded-full bg-white shadow-soft flex items-center justify-center text-[#D4A78C] z-10">
            {iconMap[ms.icon] || <Star className="w-6 h-6" />}</motion.div>
          <div className="w-px flex-1 min-h-[60px] bg-gradient-to-b from-[#D4A78C]/30 to-transparent mt-2" />
        </div>
        <div className="hidden md:block flex-1" />
      </div>
    </motion.div>
  );
}

function MilestoneForm({ initial, onSave, onClose }: {
  initial?: { id: number; title: string; description: string | null; date: string; icon: string };
  onSave: (data: { title: string; description: string; date: string; icon: string }) => void; onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [date, setDate] = useState(initial?.date || "");
  const [icon, setIcon] = useState(initial?.icon || "star");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-soft-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-light text-[#8C7B72] mb-6">{initial ? "编辑成长记录" : "添加成长记录"}</h3>
        <div className="space-y-4">
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">标题 *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：第一次走路"
              className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] text-[#8C7B72]" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">日期 *</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-[#FDECE4] focus:border-[#D4A78C] text-[#8C7B72]" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="记录这个特别的时刻..."
              className="w-full px-3 py-2 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none text-sm text-[#8C7B72] resize-none bg-transparent" /></div>
          <div><label className="text-xs text-[#8C7B72]/60 mb-1.5 block">图标</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button key={opt.key} onClick={() => setIcon(opt.key)}
                  className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                    icon === opt.key ? "bg-[#D4A78C] text-white" : "bg-[#FDECE4] text-[#8C7B72] hover:bg-[#D4A78C]/20"
                  }`}>{iconMap[opt.key]} {opt.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-full border-[#FDECE4] text-[#8C7B72]"><XCircle className="w-4 h-4 mr-2" />取消</Button>
          <Button onClick={() => onSave({ title: title.trim(), description: description.trim(), date, icon })}
            disabled={!title.trim() || !date} className="flex-1 rounded-full bg-[#D4A78C] hover:bg-[#C49A7D] text-white">
            <Check className="w-4 h-4 mr-2" />保存</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TimelinePage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true });
  const { isVerified, showDialog, setShowDialog, error, verify } = usePasswordAuth();
  const { data: milestones, isLoading } = trpc.milestone.list.useQuery();
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<NonNullable<typeof milestones>[0] | null>(null);

  const createMs = trpc.milestone.create.useMutation({
    onSuccess: () => { utils.milestone.list.invalidate(); setShowForm(false); },
    onError: (err) => { alert(err.message || "添加失败"); },
  });
  const updateMs = trpc.milestone.update.useMutation({
    onSuccess: () => { utils.milestone.list.invalidate(); setEditingMilestone(null); },
    onError: (err) => { alert(err.message || "更新失败"); },
  });
  const deleteMs = trpc.milestone.delete.useMutation({
    onSuccess: () => { utils.milestone.list.invalidate(); },
    onError: (err) => { alert(err.message || "删除失败"); },
  });

  const handleDelete = (id: number) => { if (window.confirm("确定要删除这条成长记录吗？")) deleteMs.mutate({ id }); };

  const handleSave = (data: { title: string; description: string; date: string; icon: string }) => {
    if (editingMilestone) {
      const payload: Record<string, unknown> = { id: editingMilestone.id };
      if (data.title) payload.title = data.title;
      if (data.description !== undefined) payload.description = data.description || undefined;
      if (data.date) payload.date = data.date;
      if (data.icon) payload.icon = data.icon;
      updateMs.mutate(payload as { id: number; title?: string; description?: string; date?: string; icon?: string });
    } else {
      createMs.mutate({ title: data.title, description: data.description || undefined, date: data.date, icon: data.icon });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      <Navigation />
      <div ref={headerRef} className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#D4A78C]" />
              <span className="text-sm text-[#D4A78C] tracking-wider">GROWTH JOURNEY</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light mb-4" style={{ color: "#8C7B72" }}>成长记录</h1>
            <p className="text-sm text-[#8C7B72]/60 max-w-lg mx-auto mb-8">生命中的每一个第一次都值得被铭记</p>
            {isVerified ? (
              <Button onClick={() => setShowForm(true)} className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-6 shadow-soft transition-all">
                <Plus className="w-4 h-4 mr-2" />添加新记录
              </Button>
            ) : (
              <Button onClick={() => setShowDialog(true)} variant="outline" className="rounded-full border-[#D4A78C] text-[#D4A78C] hover:bg-[#FDECE4] px-6">
                <Lock className="w-4 h-4 mr-2" />输入密码添加记录
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-20"><div className="w-8 h-8 border-2 border-[#D4A78C] border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-sm text-[#8C7B72]/60 mt-4">加载中...</p></div>
        ) : milestones && milestones.length > 0 ? (
          <div className="space-y-8">
            {milestones.map((ms, idx) => (
              <TimelineCard key={ms.id} ms={ms} index={idx} isVerified={isVerified}
                onDelete={() => handleDelete(ms.id)} onEdit={() => setEditingMilestone(ms)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20"><Baby className="w-12 h-12 text-[#D4A78C]/30 mx-auto mb-4" /><p className="text-[#8C7B72]/60">还没有成长记录，添加第一个里程碑吧</p></div>
        )}
      </div>

      <AnimatePresence>
        {(showForm || editingMilestone) && (
          <MilestoneForm initial={editingMilestone || undefined} onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingMilestone(null); }} />
        )}
      </AnimatePresence>
      <PasswordGate isOpen={showDialog} onClose={() => setShowDialog(false)} onVerify={verify} error={error} isLoading={false} />
    </div>
  );
}
