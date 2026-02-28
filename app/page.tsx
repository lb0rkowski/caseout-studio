"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GlowBtn, GlitchText, ScrambleText, RevealDiv, SectionHead, Sect, MarqueeBand } from "@/components/ui";
import ServiceCard from "@/components/service-card";
import { SERVICES, MARQUEE_GEAR } from "@/lib/data";

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);
  useEffect(() => { const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY }); window.addEventListener("mousemove", h); return () => window.removeEventListener("mousemove", h); }, []);

  return (
    <div>
      {/* HERO */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.025) 0%, transparent 60%)", left: mouse.x - 400, top: mouse.y - 400, transition: "left 2s ease, top 2s ease", filter: "blur(60px)" }} />
        <div className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.016) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] grid-bg" />

        <div className="text-center relative z-[2] px-6">
          <div className="w-[120px] h-[120px] mx-auto mb-10 rounded-full relative flex items-center justify-center" style={{ opacity: loaded ? 1 : 0, transform: loaded ? "scale(1)" : "scale(0.8)", transition: "all 1.2s cubic-bezier(0.16,1,0.3,1)" }}>
            <div className="absolute -inset-5 rounded-full" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.08) 0%, transparent 70%)", animation: "pulseSlow 4s ease-in-out infinite" }} />
            <div className="w-20 h-20 rounded-full border border-cs-gold/20 flex items-center justify-center" style={{ animation: "borderGlow 3s ease infinite" }}>
              {/* LOGO: zamień na <Image src="/logo.svg" width={80} height={80} alt="Caseout" /> */}
              <div className="font-display text-3xl text-cs-gold font-light">CS</div>
            </div>
          </div>

          <div className="overflow-hidden mb-2">
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(100%)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s" }}>
              <span className="font-mono text-[11px] text-cs-gold-dim tracking-[0.3em] uppercase">Warszawa · Kopernika 30</span>
            </div>
          </div>

          <h1 className="font-display font-bold text-cs-white uppercase leading-[0.95] my-4" style={{ fontSize: "clamp(52px, 10vw, 100px)", letterSpacing: "0.02em", opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(60px)", transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.5s" }}>
            <GlitchText>Caseout</GlitchText><br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px #C49767" }}>Studio</span>
          </h1>

          <p className="font-body text-cs-muted max-w-[440px] mx-auto mt-5 leading-relaxed" style={{ fontSize: "clamp(13px, 1.5vw, 16px)", opacity: loaded ? 1 : 0, transition: "opacity 1s ease 0.9s" }}>
            Underground z klasą. Nagrania, mix, master i produkcja<br />w sercu Warszawy.
          </p>

          <div className="flex gap-4 justify-center mt-10 flex-wrap" style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease 1.2s" }}>
            <Link href="/rezerwacje"><GlowBtn>Zarezerwuj Sesję</GlowBtn></Link>
            <Link href="/portfolio"><GlowBtn ghost>Portfolio →</GlowBtn></Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ opacity: loaded ? 0.3 : 0, transition: "opacity 1s ease 1.5s" }}>
          <span className="font-mono text-[9px] text-cs-dim tracking-[0.2em]" style={{ writingMode: "vertical-lr" }}>SCROLL</span>
          <div className="w-px h-[50px]" style={{ background: "linear-gradient(to bottom, #90714F, transparent)" }} />
        </div>
      </div>

      <MarqueeBand items={MARQUEE_GEAR} speed={40} />

      {/* SERVICES */}
      <Sect>
        <SectionHead title="Co Robimy" sub="services" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICES.slice(0, 3).map((s, i) => <RevealDiv key={i} delay={i * 120}><ServiceCard service={s} index={i} /></RevealDiv>)}
        </div>
        <div className="text-center mt-12"><Link href="/oferta"><GlowBtn ghost>Pełna Oferta →</GlowBtn></Link></div>
      </Sect>

      {/* STATS */}
      <div className="bg-cs-card border-y border-cs-line">
        <Sect className="!py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ n: "500+", l: "Sesji" }, { n: "120+", l: "Artystów" }, { n: "50+", l: "Albumów" }, { n: "5 lat", l: "Na scenie" }].map((s, i) => (
              <RevealDiv key={i} delay={i * 100}>
                <div className="font-display font-bold text-cs-gold" style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>{s.n}</div>
                <div className="font-mono text-[10px] text-cs-dim mt-2 uppercase tracking-[0.15em]">{s.l}</div>
              </RevealDiv>
            ))}
          </div>
        </Sect>
      </div>

      {/* CTA */}
      <Sect className="text-center !py-28">
        <RevealDiv>
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.025) 0%, transparent 50%)" }} />
            <div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.3em] mb-4">// READY?</div>
            <h2 className="font-display text-cs-white uppercase mb-5" style={{ fontSize: "clamp(28px, 5vw, 50px)" }}><ScrambleText text="Gotowy Na Sesję?" /></h2>
            <p className="font-body text-cs-muted max-w-[380px] mx-auto mb-9 leading-relaxed text-sm">Wybierz termin. Dobierz pakiet. Nagrywaj.</p>
            <Link href="/rezerwacje"><GlowBtn>Rezerwuj Teraz</GlowBtn></Link>
          </div>
        </RevealDiv>
      </Sect>
    </div>
  );
}
