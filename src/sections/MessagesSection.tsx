import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import PasswordGate from "@/components/custom/PasswordGate";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Heart, Lock, Quote, ArrowRight } from "lucide-react";

function MessageCard({ message, index }: { message: { id: number; content: string; authorName: string; createdAt: Date }; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: index * 0.1 }} className="relative">
      <div className="bg-white rounded-2xl p-6 shadow-soft paper-texture">
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#D4A78C]/30 rounded-tl-lg" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#D4A78C]/30 rounded-br-lg" />
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FDECE4] flex items-center justify-center">
            <span className="text-sm text-[#D4A78C] font-medium">{message.authorName.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-[#8C7B72]">{message.authorName}</span>
              <span className="text-xs text-[#D4A78C]">{new Date(message.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="relative">
              <Quote className="absolute -left-1 -top-1.5 w-5 h-5 text-[#FDECE4]" />
              <p className="text-[#8C7B72]/80 text-sm leading-relaxed pl-4 whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MessagesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { isVerified, showDialog, setShowDialog, error, verify } = usePasswordAuth();
  const { data: messages } = trpc.message.list.useQuery();
  const utils = trpc.useUtils();

  const [newMessage, setNewMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMsg = trpc.message.create.useMutation({
    onSuccess: () => { utils.message.list.invalidate(); },
  });

  const handleSubmit = () => {
    if (!newMessage.trim() || !authorName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    createMsg.mutate(
      { content: newMessage.trim(), authorName: authorName.trim() },
      {
        onSuccess: () => { setNewMessage(""); setAuthorName(""); setIsSubmitting(false); },
        onError: () => setIsSubmitting(false),
      }
    );
  };

  const displayMessages = messages?.slice(0, 3) || [];

  return (
    <section ref={sectionRef} className="relative w-full py-24 md:py-40" style={{ background: "linear-gradient(to bottom, #FFF8F0, #FDECE4)" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-[#D4A78C]" />
            <span className="text-sm text-[#D4A78C] tracking-wider">PARENTS' LETTERS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "#8C7B72" }}>父母寄语</h2>
          <p className="text-sm text-[#8C7B72]/60 max-w-md mx-auto">写下想对宝宝说的话，这些温暖的文字将成为TA未来最珍贵的礼物</p>
        </motion.div>

        {isVerified ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-2xl mx-auto mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-[#D4A78C]" fill="currentColor" />
                <span className="text-sm text-[#8C7B72]">给宝贝写一封信...</span>
              </div>
              <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="你的名字（如：妈妈、爸爸）"
                className="w-full mb-3 px-4 py-2.5 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none focus:ring-2 focus:ring-[#D4A78C]/10 text-sm text-[#8C7B72] placeholder:text-[#8C7B72]/40 bg-transparent" />
              <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="写下此刻的心情、对宝宝的祝福，或是想对长大后的TA说的话..."
                className="min-h-[120px] resize-none border-[#FDECE4] focus:border-[#D4A78C] focus:ring-[#D4A78C]/20 text-[#8C7B72] placeholder:text-[#8C7B72]/40 bg-transparent leading-relaxed" />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSubmit} disabled={!newMessage.trim() || !authorName.trim() || isSubmitting}
                  className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-6 shadow-soft transition-all duration-300">
                  <Send className="w-4 h-4 mr-2" />{isSubmitting ? "发送中..." : "发布寄语"}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-md mx-auto mb-16 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft">
              <Lock className="w-8 h-8 text-[#D4A78C] mx-auto mb-4" />
              <p className="text-[#8C7B72] mb-4">输入访问密码后即可撰写寄语，与家人一起记录对宝宝的爱</p>
              <Button onClick={() => setShowDialog(true)} className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-8 shadow-soft">
                <Heart className="w-4 h-4 mr-2" fill="currentColor" />输入密码
              </Button>
            </div>
          </motion.div>
        )}

        <div className="max-w-3xl mx-auto space-y-6">
          {displayMessages.map((msg, idx) => <MessageCard key={msg.id} message={msg} index={idx} />)}
        </div>

        {messages && messages.length > 3 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
            <Link to="/messages" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#8C7B72] text-sm shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:text-[#D4A78C] group">
              查看全部寄语<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>

      <PasswordGate isOpen={showDialog} onClose={() => setShowDialog(false)} onVerify={verify} error={error} isLoading={false} />
    </section>
  );
}
