import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Heart, Mail, Calendar, ArrowUpRight, Shield, Database, ExternalLink, Server, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FooterSection() {
  const [showStorageInfo, setShowStorageInfo] = useState(false);

  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden" style={{ background: "#FDECE4" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-[#D4A78C]" />
              <span className="text-sm text-[#D4A78C] tracking-wider">TIME CAPSULE</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light mb-6 leading-tight" style={{ color: "#8C7B72" }}>
              写一封<br />给未来的信
            </h2>
            <p className="text-[#8C7B72]/70 text-sm leading-relaxed mb-8 max-w-md">
              把此刻的爱与期盼封存在时光胶囊里，等宝宝长大成人时再打开。
              这些文字将成为跨越岁月的最珍贵礼物，让TA感受到从未改变的爱。
            </p>
            <Link to="/messages">
              <Button className="bg-[#D4A78C] hover:bg-[#C49A7D] text-white rounded-full px-8 py-6 shadow-soft-lg hover:shadow-xl transition-all duration-300 text-base">
                <Calendar className="w-4 h-4 mr-2" />
                写一封未来的信
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-soft-lg">
              <img src="/images/family-window.jpg" alt="温馨的家庭时光" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FDECE4]/60 via-transparent to-transparent" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FDECE4] flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-[#D4A78C]" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#8C7B72]">时光胶囊</p>
                    <p className="text-xs text-[#8C7B72]/60">将于 2044 年开启</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Storage info bar */}
      <div className="max-w-[1200px] mx-auto px-6 mt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft">
          <button onClick={() => setShowStorageInfo(!showStorageInfo)}
            className="flex items-center gap-3 w-full text-left group">
            <Shield className="w-5 h-5 text-[#D4A78C]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#8C7B72]">数据安全说明</p>
              <p className="text-xs text-[#8C7B72]/50">点击了解您的数据存储在哪里、是否安全</p>
            </div>
            <ExternalLink className={`w-4 h-4 text-[#8C7B72]/40 transition-transform ${showStorageInfo ? 'rotate-180' : ''}`} />
          </button>

          {showStorageInfo && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="mt-4 pt-4 border-t border-[#FDECE4]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-[#D4A78C]" />
                    <span className="font-medium text-[#8C7B72]">存储位置</span>
                  </div>
                  <p className="text-[#8C7B72]/60 leading-relaxed text-xs">
                    您的照片、视频和文字存储在<b>云端数据库服务器</b>中。
                    这样手机和电脑访问时可以看到同样的内容，实现跨设备同步。
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-[#D4A78C]" />
                    <span className="font-medium text-[#8C7B72]">访问控制</span>
                  </div>
                  <p className="text-[#8C7B72]/60 leading-relaxed text-xs">
                    网站设有访问密码（<b>baby2024</b>），只有知道密码的人才能上传和编辑内容。
                    浏览内容无需密码。建议定期更换密码保障安全。
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-[#D4A78C]" />
                    <span className="font-medium text-[#8C7B72]">隐私建议</span>
                  </div>
                  <p className="text-[#8C7B72]/60 leading-relaxed text-xs">
                    照片和视频以安全方式存储。如需更高隐私保护，建议不上传过于敏感的照片。
                    网站管理员有技术能力访问数据库内容，请知悉。
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-8 border-t border-[#D4A78C]/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#D4A78C]" fill="currentColor" />
            <span className="text-sm text-[#8C7B72]/60">拾光信笺 — 记录成长的每一刻</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/album" className="text-sm text-[#8C7B72]/60 hover:text-[#D4A78C] transition-colors">相册</Link>
            <Link to="/timeline" className="text-sm text-[#8C7B72]/60 hover:text-[#D4A78C] transition-colors">成长记录</Link>
            <Link to="/messages" className="text-sm text-[#8C7B72]/60 hover:text-[#D4A78C] transition-colors">父母寄语</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
