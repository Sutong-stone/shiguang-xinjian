import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import {
  ArrowRight,
  Smile,
  RotateCw,
  Mic,
  Footprints,
  ArrowUp,
  Star,
  Sparkles,
  Baby,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  star: <Star className="w-5 h-5" />,
  smile: <Smile className="w-5 h-5" />,
  rotate: <RotateCw className="w-5 h-5" />,
  mic: <Mic className="w-5 h-5" />,
  footprints: <Footprints className="w-5 h-5" />,
  "arrow-up": <ArrowUp className="w-5 h-5" />,
  sparkles: <Sparkles className="w-5 h-5" />,
  baby: <Baby className="w-5 h-5" />,
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
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`relative flex items-start gap-6 md:gap-12 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      } flex-row`}
    >
      {/* Content */}
      <div
        className={`flex-1 ${
          isLeft ? "md:text-right" : "md:text-left"
        } text-left`}
      >
        <div
          className={`inline-flex items-center gap-2 mb-2 ${
            isLeft ? "md:flex-row-reverse" : ""
          }`}
        >
          <span className="text-xs font-medium text-[#D4A78C] tracking-wider">
            {date}
          </span>
        </div>
        <h3 className="text-lg font-medium text-[#8C7B72] mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-[#8C7B72]/60 leading-relaxed max-w-sm">
            {description}
          </p>
        )}
      </div>

      {/* Center dot */}
      <div className="relative flex flex-col items-center flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-white shadow-soft flex items-center justify-center text-[#D4A78C] z-10">
          {iconMap[icon] || <Star className="w-5 h-5" />}
        </div>
        {index < 4 && (
          <div className="w-px h-20 bg-gradient-to-b from-[#D4A78C]/30 to-transparent mt-2" />
        )}
      </div>

      {/* Spacer for alternating layout */}
      <div className="hidden md:block flex-1" />
    </motion.div>
  );
}

export default function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { data: milestones } = trpc.milestone.list.useQuery();

  const displayMilestones = milestones?.slice(0, 5) || [];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-40"
      style={{ background: "#FFF8F0" }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#D4A78C]" />
            <span className="text-sm text-[#D4A78C] tracking-wider">
              GROWTH JOURNEY
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-light mb-3"
            style={{ color: "#8C7B72" }}
          >
            成长足迹
          </h2>
          <p className="text-sm text-[#8C7B72]/60 max-w-md mx-auto">
            记录生命中的每一个第一次，这些小小的里程碑汇聚成成长的河流
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto space-y-8">
          {displayMilestones.map((ms, idx) => (
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

        {/* View all link */}
        {milestones && milestones.length > 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/timeline"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#8C7B72] text-sm shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:text-[#D4A78C] group"
            >
              查看全部记录
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
