import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/custom/Navigation";
import {
  Sparkles,
  Smile,
  RotateCw,
  Mic,
  Footprints,
  ArrowUp,
  Star,
  Baby,
  Clock,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  star: <Star className="w-6 h-6" />,
  smile: <Smile className="w-6 h-6" />,
  rotate: <RotateCw className="w-6 h-6" />,
  mic: <Mic className="w-6 h-6" />,
  footprints: <Footprints className="w-6 h-6" />,
  "arrow-up": <ArrowUp className="w-6 h-6" />,
  sparkles: <Sparkles className="w-6 h-6" />,
  baby: <Baby className="w-6 h-6" />,
};

function TimelineCard({
  title,
  description,
  date,
  icon,
  index,
}: {
  title: string;
  description?: string | null;
  date: string;
  icon: string;
  index: number;
}) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="relative"
    >
      <div
        className={`flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
          isLeft ? "" : "md:flex-row-reverse"
        }`}
      >
        {/* Content card */}
        <div
          className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}
        >
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 inline-block text-left max-w-md w-full"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#D4A78C]" />
              <span className="text-xs text-[#D4A78C] tracking-wider">
                {date}
              </span>
            </div>
            <h3 className="text-xl font-medium text-[#8C7B72] mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-[#8C7B72]/60 leading-relaxed">
                {description}
              </p>
            )}
          </motion.div>
        </div>

        {/* Center icon */}
        <div className="flex flex-col items-center flex-shrink-0 relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="w-14 h-14 rounded-full bg-white shadow-soft flex items-center justify-center text-[#D4A78C] z-10"
          >
            {iconMap[icon] || <Star className="w-6 h-6" />}
          </motion.div>
          {index < 99 && (
            <div className="w-px flex-1 min-h-[60px] bg-gradient-to-b from-[#D4A78C]/30 to-transparent mt-2" />
          )}
        </div>

        {/* Spacer */}
        <div className="hidden md:block flex-1" />
      </div>
    </motion.div>
  );
}

export default function TimelinePage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true });
  const { data: milestones, isLoading } = trpc.milestone.list.useQuery();

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      <Navigation />

      {/* Header */}
      <div ref={headerRef} className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#D4A78C]" />
              <span className="text-sm text-[#D4A78C] tracking-wider">
                GROWTH JOURNEY
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-light mb-4"
              style={{ color: "#8C7B72" }}
            >
              成长记录
            </h1>
            <p className="text-sm text-[#8C7B72]/60 max-w-lg mx-auto">
              生命中的每一个第一次都值得被铭记，这些小小的里程碑见证了宝宝的成长轨迹
            </p>
          </motion.div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-[900px] mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4A78C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#8C7B72]/60 mt-4">加载中...</p>
          </div>
        ) : milestones && milestones.length > 0 ? (
          <div className="space-y-8">
            {milestones.map((ms, idx) => (
              <TimelineCard
                key={ms.id}
                title={ms.title}
                description={ms.description}
                date={ms.date}
                icon={ms.icon}
                index={idx}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Baby className="w-12 h-12 text-[#D4A78C]/30 mx-auto mb-4" />
            <p className="text-[#8C7B72]/60">
              还没有成长记录
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
