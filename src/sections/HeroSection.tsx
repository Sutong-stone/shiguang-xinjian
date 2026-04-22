import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

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
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    glRef.current = gl;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vertexShader);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    const posAttr = gl.getAttribLocation(program, "position");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, "resolution");
    const timeLoc = gl.getUniformLocation(program, "uTime");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = w / h;
      let a1 = 1, a2 = 1;
      if (aspect > 1) { a1 = 1; a2 = aspect; }
      else { a1 = 1 / aspect; a2 = 1; }
      gl.uniform4f(resLoc, w, h, a1, a2);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      gl.uniform1f(timeLoc, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}

const bounceTransition = {
  duration: 1.4,
  ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number],
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const wordVariants = {
  hidden: { y: "130%", rotate: 20, scale: 0.8, opacity: 0 },
  visible: { y: "0%", rotate: 0, scale: 1, opacity: 1, transition: bounceTransition },
};

export default function HeroSection() {
  const lines = [
    ["To", "my", "dearest"],
    ["Time", "is", "a", "gift"],
    ["You", "are", "our", "treasure"],
  ];

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <PeachWaves />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Bouncy text */}
        <motion.div
          className="text-center mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {lines.map((line, lineIdx) => (
            <div key={lineIdx} className="overflow-hidden mb-1">
              <div className="flex justify-center gap-x-3">
                {line.map((word, wordIdx) => (
                  <motion.span
                    key={wordIdx}
                    variants={wordVariants}
                    className="inline-block text-3xl md:text-5xl lg:text-6xl font-light tracking-wide"
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      color: "#8C7B72",
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Hero illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          className="w-full max-w-2xl mx-auto"
        >
          <img
            src="/images/hero-illustration.jpg"
            alt="温馨的手绘插画"
            className="w-full h-auto object-contain"
            style={{ maxHeight: "45vh" }}
          />
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs tracking-widest text-[#8C7B72]/60">
              SCROLL
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-[#D4A78C] to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
