"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GlowBtn, GlitchText, ScrambleText, RevealDiv, SectionHead, Sect, MarqueeBand, WaveVisualizer } from "@/components/ui";
import ServiceCard from "@/components/service-card";
import { SERVICES, MARQUEE_GEAR } from "@/lib/data";

/* Studio gallery — podmień src na swoje zdjęcia w public/studio/ */
const GALLERY = [
  { src: "/studio/studio-1.jpg", alt: "Studio — główna sala nagrań", label: "LIVE ROOM" },
  { src: "/studio/studio-2.jpg", alt: "Studio — stanowisko inżyniera", label: "CONTROL ROOM" },
  { src: "/studio/studio-3.jpg", alt: "Studio — mikrofony i sprzęt", label: "GEAR WALL" },
  { src: "/studio/studio-4.jpg", alt: "Studio — kabina wokalna", label: "VOCAL BOOTH" },
  { src: "/studio/studio-5.jpg", alt: "Studio — widok ogólny", label: "LOUNGE" },
  { src: "/studio/studio-6.jpg", alt: "Studio — analogowy sprzęt", label: "OUTBOARD" },
];

function GalleryImage({ item, index }: { item: typeof GALLERY[0]; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const [hover, setHover] = useState(false);
  const tall = index === 0 || index === 3;

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={`relative overflow-hidden rounded-sm cursor-pointer group ${tall ? "md:row-span-2" : ""}`}
      style={{ minHeight: tall ? "100%" : "clamp(200px, 25vw, 320px)" }}
    >
      {/* Placeholder shimmer — zniknie po wgraniu zdjęć */}
      <div className={`absolute inset-0 img-placeholder transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl mb-3 opacity-20">📷</div>
          <div className="font-mono text-[10px] text-cs-dim tracking-widest">{item.label}</div>
          <div className="font-mono text-[9px] text-cs-dim mt-1 opacity-50">Wgraj zdjęcie →</div>
          <div className="font-mono text-[8px] text-cs-dim mt-0.5 opacity-30">{item.src}</div>
        </div>
      </div>

      {/* Actual image — pojawi się po wgraniu plików */}
      <img
        src={item.src}
        alt={item.alt}
        onLoad={() => setLoaded(true)}
        onError={() => {}}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
        style={{ transform: hover ? "scale(1.05)" : "scale(1)", opacity: loaded ? 1 : 0 }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 transition-all duration-500" style={{ background: hover ? "rgba(5,8,16,0.3)" : "rgba(5,8,16,0.55)" }} />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <div className="font-mono text-[10px] md:text-[11px] text-cs-gold tracking-[0.2em] transition-all duration-500" style={{ transform: hover ? "translateY(0)" : "translateY(4px)", opacity: hover ? 1 : 0.7 }}>
          {item.label}
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-3 right-3 w-6 h-6 border-t border-r transition-all duration-500" style={{ borderColor: hover ? "rgba(196,151,103,0.4)" : "rgba(196,151,103,0.1)" }} />
    </div>
  );
}

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);
  useEffect(() => { const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY }); window.addEventListener("mousemove", h); return () => window.removeEventListener("mousemove", h); }, []);

  return (
    <div>
      {/* ══ HERO ══ */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.03) 0%, transparent 60%)", left: mouse.x - 400, top: mouse.y - 400, transition: "left 2s ease, top 2s ease", filter: "blur(60px)" }} />
        <div className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.02) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] grid-bg" />

        <div className="text-center relative z-[2] px-5 md:px-8">
          {/* Logo */}
          <div className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-8 md:mb-12 rounded-full relative flex items-center justify-center" style={{ opacity: loaded ? 1 : 0, transform: loaded ? "scale(1)" : "scale(0.8)", transition: "all 1.2s cubic-bezier(0.16,1,0.3,1)" }}>
            <div className="absolute -inset-6 rounded-full" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.08) 0%, transparent 70%)", animation: "pulseSlow 4s ease-in-out infinite" }} />
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border border-cs-gold/20 flex items-center justify-center" style={{ animation: "borderGlow 3s ease infinite" }}>
              <div className="font-display text-3xl md:text-5xl text-cs-gold font-light">CS</div>
            </div>
          </div>

          {/* Location */}
          <div className="overflow-hidden mb-3">
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(100%)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s" }}>
              <span className="font-mono text-xs md:text-sm text-cs-gold-dim tracking-[0.3em] uppercase">Warszawa · Kopernika 30</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-cs-white uppercase leading-[0.92] my-4" style={{ fontSize: "clamp(56px, 12vw, 140px)", letterSpacing: "0.02em", opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(60px)", transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.5s" }}>
            <GlitchText>Caseout</GlitchText><br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px #C49767" }}>Studio</span>
          </h1>

          {/* Desc */}
          <p className="font-body text-base md:text-lg lg:text-xl text-cs-muted max-w-[520px] mx-auto mt-5 md:mt-7 leading-relaxed" style={{ opacity: loaded ? 1 : 0, transition: "opacity 1s ease 0.9s" }}>
            Underground z klasą. Nagrania, mix, master i produkcja<br className="hidden md:block" /> w sercu Warszawy.
          </p>

          {/* CTA */}
          <div className="flex gap-4 justify-center mt-10 md:mt-12 flex-wrap" style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease 1.2s" }}>
            <Link href="/rezerwacje"><GlowBtn>Zarezerwuj Sesję</GlowBtn></Link>
            <Link href="/portfolio"><GlowBtn ghost>Portfolio →</GlowBtn></Link>
          </div>
        </div>

        {/* Scroll */}
        <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-3 hidden md:flex" style={{ opacity: loaded ? 0.3 : 0, transition: "opacity 1s ease 1.5s" }}>
          <span className="font-mono text-[9px] text-cs-dim tracking-[0.2em]" style={{ writingMode: "vertical-lr" }}>SCROLL</span>
          <div className="w-px h-[50px]" style={{ background: "linear-gradient(to bottom, #90714F, transparent)" }} />
        </div>
      </div>

      <MarqueeBand items={MARQUEE_GEAR} speed={40} />

      {/* ══ STUDIO GALLERY ══ */}
      <Sect>
        <SectionHead title="Nasze Studio" sub="the space" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" style={{ gridAutoRows: "clamp(180px, 20vw, 260px)" }}>
          {GALLERY.map((item, i) => (
            <RevealDiv key={i} delay={i * 80}>
              <GalleryImage item={item} index={i} />
            </RevealDiv>
          ))}
        </div>
        <div className="mt-8 md:mt-10 flex items-center gap-4 justify-center">
          <WaveVisualizer bars={20} height={24} />
          <span className="font-mono text-[11px] text-cs-dim tracking-[0.15em]">AKUSTYCZNIE WYCISZONE · KLIMATYZOWANE · 24/7</span>
          <WaveVisualizer bars={20} height={24} />
        </div>
      </Sect>

      {/* ══ SERVICES ══ */}
      <Sect>
        <SectionHead title="Co Robimy" sub="services" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {SERVICES.slice(0, 3).map((s, i) => <RevealDiv key={i} delay={i * 120}><ServiceCard service={s} index={i} /></RevealDiv>)}
        </div>
        <div className="text-center mt-12 md:mt-14"><Link href="/oferta"><GlowBtn ghost>Pełna Oferta →</GlowBtn></Link></div>
      </Sect>

      {/* ══ STATS ══ */}
      <div className="bg-cs-card border-y border-cs-line">
        <Sect className="!py-14 md:!py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[{ n: "500+", l: "Sesji" }, { n: "120+", l: "Artystów" }, { n: "50+", l: "Albumów" }, { n: "5 lat", l: "Na scenie" }].map((s, i) => (
              <RevealDiv key={i} delay={i * 100}>
                <div className="font-display font-bold text-cs-gold" style={{ fontSize: "clamp(32px, 5vw, 56px)" }}>{s.n}</div>
                <div className="font-mono text-[11px] md:text-xs text-cs-dim mt-2 uppercase tracking-[0.15em]">{s.l}</div>
              </RevealDiv>
            ))}
          </div>
        </Sect>
      </div>

      {/* ══ CTA ══ */}
      <Sect className="text-center !py-24 md:!py-36">
        <RevealDiv>
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.03) 0%, transparent 50%)" }} />
            <div className="font-mono text-xs text-cs-gold-dim tracking-[0.3em] mb-5">// READY?</div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cs-white uppercase mb-6"><ScrambleText text="Gotowy Na Sesję?" /></h2>
            <p className="font-body text-base md:text-lg text-cs-muted max-w-[400px] mx-auto mb-10 leading-relaxed">Wybierz termin. Dobierz pakiet. Nagrywaj.</p>
            <Link href="/rezerwacje"><GlowBtn>Rezerwuj Teraz</GlowBtn></Link>
          </div>
        </RevealDiv>
      </Sect>
    </div>
  );
}
