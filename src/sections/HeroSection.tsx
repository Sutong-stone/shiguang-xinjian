import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import FileUpload from "@/components/custom/FileUpload";
import { Camera, Check, XCircle, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const vertexShader = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform vec4 resolution;
  uniform float uTime;

  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }

  float wavy(vec2 p, float repx) {
    p.x = mod(p.x, repx) - repx * 0.5;
    float wavy =
      (sin(p.x * 1.20 + p.y * 3.0 + uTime * 0.5) * 0.05 +
       sin(p.x * 2.0 + p.y * 7.5 + uTime * 1.2) * 0.02 +
       sin(p.x * 5.5 - p.y * 2.0 + uTime * 2.5) * 0.01 +
       0.5 + p.y * 0.2);
    return wavy;
  }

  void main() {
    vec2 uv = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    float aspect = resolution.x / resolution.y;
    vec2 uvAspect = uv * vec2(aspect, 1.0);
    vec3 normal = vec3(0.0, 0.0, 1.0);
    float eps = 0.01;
    float repx = 2.5;
    float w0 = wavy(uvAspect, repx);
    vec2 noiseUV = uvAspect * 15.0 + uTime * 0.2;
    vec2 noise = hash22(floor(noiseUV));
    normal.x += (noise.x - 0.5) * 0.5;
    normal.y += (noise.y - 0.5) * 0.5;
    float w1 = wavy(uvAspect + vec2(eps, 0.0), repx);
    float w2 = wavy(uvAspect + vec2(0.0, eps), repx);
    float wx = (w1 - w0) / eps;
    float wy = (w2 - w0) / eps;
    normal = normalize(normal + vec3(-wx * 0.2, -wy * 0.2, 0.0));
    vec3 viewDir = normalize(vec3(0.5 - uv.x, 0.5 - uv.y, 1.0));
    vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
    vec3 halfDir = normalize(lightDir + viewDir);
    float NdotH = max(dot(normal, halfDir), 0.0);
    float pearl = pow(NdotH, 30.0);
    vec3 pearlColor = vec3(1.0, 0.8, 0.9) * pearl * 0.8;
    vec3 reflectDir = reflect(-viewDir, normal);
    float spec = pow(max(dot(reflectDir, lightDir), 0.0), 40.0);
    vec3 specColor = vec3(1.0, 0.95, 0.9) * spec * 0.5;
    vec3 layer1 = vec3(1.00, 0.88, 0.80) * smoothstep(w0, w0 + 0.05, uv.y);
    vec3 layer2 = vec3(1.00, 0.80, 0.75) * smoothstep(w0, w0 + 0.05, uv.y);
    vec3 col = layer1;
    col = mix(col, layer2, 0.3);
    col += specColor;
    col += pearlColor;
    float vignette = smoothstep(1.2, 0.3, length(uv - 0.5));
    col *= 0.85 + vignette * 0.15;
    col = col / (1.0 + col * 0.2);
    col = pow(col, vec3(0.95));
    gl_FragColor = vec4(col, 1.0);
  }
`;

function PeachWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      return shader;
    };
    const vs = compileShader(gl.VERTEX_SHADER, vertexShader);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const posAttr = gl.getAttribLocation(program, "position");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, "resolution");
    const timeLoc = gl.getUniformLocation(program, "uTime");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = w / h; let a1 = 1, a2 = 1;
      if (aspect > 1) { a1 = 1; a2 = aspect; } else { a1 = 1 / aspect; a2 = 1; }
      gl.uniform4f(resLoc, w, h, a1, a2);
    };
    resize(); window.addEventListener("resize", resize);
    const startTime = Date.now();
    let animId = 0;
    const render = () => {
      gl.uniform1f(timeLoc, (Date.now() - startTime) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }} />;
}

const bounceTransition = { duration: 1.4, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] };
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const wordVariants = {
  hidden: { y: "130%", rotate: 20, scale: 0.8, opacity: 0 },
  visible: { y: "0%", rotate: 0, scale: 1, opacity: 1, transition: bounceTransition },
};

function CoverEditor({ cover, onSave, onClose }: {
  cover: { imageUrl: string; title: string; subtitle: string }; onSave: (c: typeof cover) => void; onClose: () => void;
}) {
  const [title, setTitle] = useState(cover.title);
  const [subtitle, setSubtitle] = useState(cover.subtitle);
  const [imageUrl, setImageUrl] = useState(cover.imageUrl);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-soft-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-light text-[#8C7B72] mb-6 flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#D4A78C]" />自定义封面
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#8C7B72]/60 mb-1.5 block">封面照片</label>
            {imageUrl && imageUrl !== "/images/hero-illustration.jpg" && (
              <img src={imageUrl} alt="封面" className="w-full h-40 object-cover rounded-xl mb-3" />
            )}
            <FileUpload onUploadSuccess={(url) => setImageUrl(url)} acceptVideo={false} />
          </div>
          <div>
            <label className="text-xs text-[#8C7B72]/60 mb-1.5 block">主标题</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none text-sm text-[#8C7B72] bg-transparent" />
          </div>
          <div>
            <label className="text-xs text-[#8C7B72]/60 mb-1.5 block">副标题</label>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FDECE4] focus:border-[#D4A78C] focus:outline-none text-sm text-[#8C7B72] bg-transparent" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-full border-[#FDECE4] text-[#8C7B72]">
            <XCircle className="w-4 h-4 mr-2" />取消
          </Button>
          <Button onClick={() => onSave({ imageUrl, title, subtitle })}
            className="flex-1 rounded-full bg-[#D4A78C] hover:bg-[#C49A7D] text-white">
            <Check className="w-4 h-4 mr-2" />保存
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const lines = [["To", "my", "dearest"], ["Time", "is", "a", "gift"], ["You", "are", "our", "treasure"]];
  const { isVerified } = usePasswordAuth();
  const { data: coverData } = trpc.cover.get.useQuery();
  const updateCoverMut = trpc.cover.update.useMutation();
  const utils = trpc.useUtils();

  const [showEditor, setShowEditor] = useState(false);

  // Use server data or defaults
  const cover = coverData || { imageUrl: "/images/hero-illustration.jpg", title: "拾光信笺", subtitle: "记录成长的每一刻" };
  const isCustomCover = cover.imageUrl && cover.imageUrl !== "/images/hero-illustration.jpg";

  const handleSaveCover = (newCover: { imageUrl: string; title: string; subtitle: string }) => {
    updateCoverMut.mutate(newCover, {
      onSuccess: () => { utils.cover.get.invalidate(); setShowEditor(false); },
    });
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <PeachWaves />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Bouncy text */}
        <motion.div className="text-center mb-6" variants={containerVariants} initial="hidden" animate="visible">
          {lines.map((line, lineIdx) => (
            <div key={lineIdx} className="overflow-hidden mb-1">
              <div className="flex justify-center gap-x-3">
                {line.map((word, wordIdx) => (
                  <motion.span key={wordIdx} variants={wordVariants}
                    className="inline-block text-3xl md:text-5xl lg:text-6xl font-light tracking-wide"
                    style={{ fontFamily: '"Playfair Display", serif', color: "#8C7B72" }}>
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Cover image */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          className="w-full max-w-2xl mx-auto relative">
          <div className="relative rounded-3xl overflow-hidden shadow-soft-lg">
            {isCustomCover ? (
              <img src={cover.imageUrl} alt="宝宝封面" className="w-full h-auto object-contain max-h-[40vh]" />
            ) : (
              <img src="/images/hero-illustration.jpg" alt="温馨插画" className="w-full h-auto object-contain" style={{ maxHeight: "45vh" }} />
            )}
          </div>
          {(cover.title !== "拾光信笺" || cover.subtitle !== "记录成长的每一刻") && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <h2 className="text-2xl md:text-3xl font-light text-white drop-shadow-lg" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                {cover.title}
              </h2>
              <p className="text-sm text-white/90 drop-shadow" style={{ textShadow: "0 1px 5px rgba(0,0,0,0.3)" }}>{cover.subtitle}</p>
            </div>
          )}
          {isVerified && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              onClick={() => setShowEditor(true)}
              className="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-[#8C7B72] text-xs shadow-soft hover:bg-white hover:text-[#D4A78C] transition-all flex items-center gap-1.5">
              <ImagePlus className="w-3.5 h-3.5" />更换封面
            </motion.button>
          )}
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs tracking-widest text-[#8C7B72]/60">SCROLL</span>
            <div className="w-px h-8 bg-gradient-to-b from-[#D4A78C] to-transparent" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showEditor && <CoverEditor cover={cover} onSave={handleSaveCover} onClose={() => setShowEditor(false)} />}
      </AnimatePresence>
    </section>
  );
}
