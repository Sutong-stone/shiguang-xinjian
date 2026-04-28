import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { ArrowRight, ImagePlus } from "lucide-react";

function GalleryCard({ album, index }: { album: { id: number; title: string; description: string | null; imageUrl: string; date: string | null }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  return (
    <motion.div ref={ref} style={{ y, rotateX, scale, opacity }} className="gallery-item mb-6">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft group cursor-pointer">
        <div className="overflow-hidden">
          <img src={album.imageUrl} alt={album.title} className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105" loading={index < 3 ? "eager" : "lazy"} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          {album.date && <span className="text-xs text-white/80 tracking-wider">{album.date}</span>}
          <h3 className="text-lg font-medium text-white mt-1">{album.title}</h3>
          {album.description && <p className="text-sm text-white/80 mt-1 line-clamp-2">{album.description}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export default function GallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { data: albums, isLoading } = trpc.album.list.useQuery();
  const [dialogText, setDialogText] = useState("");
  const fullText = "今天是你满月的日子，看着你熟睡的小脸，觉得整个世界都安静了下来...";

  useEffect(() => {
    if (!isInView) return;
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) { setDialogText(fullText.slice(0, index)); index++; }
      else clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, [isInView]);

  // Only show latest 6 albums on homepage to reduce data transfer
  const items = (albums || []).slice(0, 6);
  const column1 = items.filter((_, i) => i % 3 === 0);
  const column2 = items.filter((_, i) => i % 3 === 1);
  const column3 = items.filter((_, i) => i % 3 === 2);
  const columns = [column1, column2, column3];

  return (
    <section ref={sectionRef} className="relative w-full py-24 md:py-40" style={{ background: "#FFF8F0" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-[1200px] mx-auto px-6 mb-16 flex justify-end">
        <div className="relative bg-white rounded-3xl rounded-br-md px-6 py-5 max-w-md shadow-soft">
          <p className="text-[#8C7B72] text-sm leading-relaxed min-h-[3rem]">{dialogText}<span className="animate-pulse-soft inline-block w-0.5 h-4 bg-[#D4A78C] ml-1 align-middle" /></p>
          <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white rotate-45 shadow-soft" />
        </div>
      </motion.div>

      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "#8C7B72" }}>成长画廊</h2>
          <p className="text-sm text-[#D4A78C]">每一张照片，都是时光的标本</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4A78C] border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-[#8C7B72]/60">照片加载中...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ImagePlus className="w-10 h-10 text-[#D4A78C]/30 mx-auto mb-3" />
            <p className="text-sm text-[#8C7B72]/50">相册还是空的，去上传第一张照片吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="space-y-6" style={{ transform: `translateY(${colIdx * 40}px)` }}>
                {col.map((album, idx) => <GalleryCard key={album.id} album={album} index={colIdx * col.length + idx} />)}
              </div>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }} className="text-center mt-16">
          <Link to="/album" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#8C7B72] text-sm shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:text-[#D4A78C] group">
            查看全部照片<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
