"use client";
import { useState, useEffect, useRef, ReactNode } from "react";

export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold }); obs.observe(el); return () => obs.disconnect(); }, [threshold]);
  return { ref, vis };
}

export function GlowBtn({ children, onClick, ghost = false, disabled = false, className = "" }: { children: ReactNode; onClick?: () => void; ghost?: boolean; disabled?: boolean; className?: string }) {
  const [h, setH] = useState(false);
  return (
    <button disabled={disabled} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className={`relative font-display text-sm md:text-base font-bold uppercase tracking-[0.15em] overflow-hidden ${className}`}
      style={{ padding: ghost ? "14px 32px" : "16px 40px", background: ghost ? "transparent" : h ? "#D4A87A" : "#C49767", color: ghost ? (h ? "#C49767" : "#90714F") : "#050810", border: ghost ? `1px solid ${h ? "#C4976780" : "#90714F50"}` : "none", borderRadius: 2, cursor: disabled ? "not-allowed" : "pointer", boxShadow: h && !ghost ? "0 0 40px rgba(196,151,103,0.2)" : "none", opacity: disabled ? 0.4 : 1, transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      {h && !ghost && <div className="absolute top-0 -left-full w-[200%] h-full pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", animation: "marquee 0.6s linear" }} />}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function RevealDiv({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, vis } = useReveal(0.1);
  return <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>{children}</div>;
}

export function SectionHead({ title, sub, align = "center" }: { title: string; sub?: string; align?: "center" | "left" }) {
  const { ref, vis } = useReveal();
  return (
    <div ref={ref} className="mb-12 md:mb-16" style={{ textAlign: align, opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: "all 0.8s ease" }}>
      <div className="font-mono text-xs md:text-sm text-cs-gold-dim uppercase tracking-[0.25em] mb-3">{"// "}{sub || title}</div>
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cs-white uppercase tracking-wide leading-tight">{title}</h2>
      <div className="h-px w-12 bg-cs-gold opacity-60" style={{ margin: align === "center" ? "24px auto 0" : "24px 0 0" }} />
    </div>
  );
}

export function Sect({ children, id, className = "" }: { children: ReactNode; id?: string; className?: string }) {
  return <section id={id} className={`py-20 md:py-28 lg:py-32 px-5 md:px-8 max-w-[1400px] mx-auto relative ${className}`}>{children}</section>;
}

export function GlitchText({ children }: { children: ReactNode }) {
  const [g, setG] = useState(false);
  useEffect(() => { const iv = setInterval(() => { setG(true); setTimeout(() => setG(false), 200); }, 4000 + Math.random() * 3000); return () => clearInterval(iv); }, []);
  return (
    <span className="relative inline-block">{children}
      {g && <><span className="absolute top-0 left-[2px] text-cs-gold opacity-70" style={{ animation: "glitchClip 0.2s steps(1) infinite" }} aria-hidden="true">{children}</span><span className="absolute top-0 -left-[2px] text-cs-gold-dim opacity-50" style={{ animation: "glitchClip 0.2s steps(1) infinite reverse" }} aria-hidden="true">{children}</span></>}
    </span>
  );
}

export function ScrambleText({ text }: { text: string }) {
  const [d, setD] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#アイウエオカキ";
  const scramble = () => { let iter = 0; const iv = setInterval(() => { setD(text.split("").map((c, i) => i < iter ? text[i] : chars[Math.floor(Math.random() * chars.length)]).join("")); if (++iter > text.length) { clearInterval(iv); setD(text); } }, 30); };
  return <span onMouseEnter={scramble} className="cursor-default">{d}</span>;
}

export function WaveVisualizer({ bars = 40, height = 60, className = "" }: { bars?: number; height?: number; className?: string }) {
  return <div className={`flex items-end gap-[2px] opacity-25 ${className}`} style={{ height }}>{Array.from({ length: bars }, (_, i) => <div key={i} className="rounded-sm bg-cs-gold" style={{ width: 2, height: `${20 + Math.random() * 80}%`, animation: `waveBar ${0.8 + Math.random() * 0.8}s ease-in-out ${i * 0.03}s infinite alternate` }} />)}</div>;
}

export function MarqueeBand({ items, speed = 30 }: { items: string[]; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap border-y border-cs-line py-5">
      <div className="inline-block" style={{ animation: `marquee ${speed}s linear infinite` }}>
        {[...items, ...items].map((t, i) => <span key={i} className="font-display text-sm md:text-base text-cs-dim uppercase tracking-[0.2em] mr-12 md:mr-16">{t} <span className="text-cs-gold-dim mx-4 md:mx-6">◆</span></span>)}
      </div>
    </div>
  );
}

export function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!; let anim: number;
    interface P { x: number; y: number; vx: number; vy: number; s: number; a: number }
    const ps: P[] = [];
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 50; i++) ps.push({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, s: Math.random() * 1.2 + 0.3, a: Math.random() * 0.25 + 0.03 });
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0; if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fillStyle = `rgba(196,151,103,${p.a})`; ctx.fill(); });
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y, dist = Math.sqrt(dx * dx + dy * dy); if (dist < 100) { ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.strokeStyle = `rgba(196,151,103,${0.03 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke(); } }
      anim = requestAnimationFrame(draw);
    }; draw();
    return () => { cancelAnimationFrame(anim); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
}
