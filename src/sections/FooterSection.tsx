import { motion } from "framer-motion";
import { Link } from "react-router";
import { Heart, Mail, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FooterSection() {
  return (
    <section
      className="relative w-full py-24 md:py-32 overflow-hidden"
      style={{ background: "#FDECE4" }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-[#D4A78C]" />
              <span className="text-sm text-[#D4A78C] tracking-wider">
                TIME CAPSULE
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-light mb-6 leading-tight"
              style={{ color: "#8C7B72" }}
            >
              写一封
              <br />
              给未来的信
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

          {/* Right: Illustration placeholder with decorative elements */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-soft-lg">
              <img
                src="/images/family-window.jpg"
                alt="温馨的家庭时光"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FDECE4]/60 via-transparent to-transparent" />

              {/* Decorative floating card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FDECE4] flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-[#D4A78C]" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#8C7B72]">
                      时光胶囊
                    </p>
                    <p className="text-xs text-[#8C7B72]/60">
                      将于 2044 年开启
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="max-w-[1200px] mx-auto px-6 mt-24 pt-8 border-t border-[#D4A78C]/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#D4A78C]" fill="currentColor" />
            <span className="text-sm text-[#8C7B72]/60">
              拾光信笺 — 记录成长的每一刻
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/album"
              className="text-sm text-[#8C7B72]/60 hover:text-[#D4A78C] transition-colors"
            >
              相册
            </Link>
            <Link
              to="/timeline"
              className="text-sm text-[#8C7B72]/60 hover:text-[#D4A78C] transition-colors"
            >
              成长记录
            </Link>
            <Link
              to="/messages"
              className="text-sm text-[#8C7B72]/60 hover:text-[#D4A78C] transition-colors"
            >
              父母寄语
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
