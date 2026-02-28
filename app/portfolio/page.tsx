"use client";
import { useState } from "react";
import { SectionHead, Sect, RevealDiv, WaveVisualizer } from "@/components/ui";
import { PORTFOLIO } from "@/lib/data";

function Card({ item, i }: { item: typeof PORTFOLIO[0]; i: number }) {
  const [h, setH] = useState(false);
  const [playing, setPlaying] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} className="bg-cs-card rounded-sm overflow-hidden transition-all duration-500"
      style={{ border: `1px solid ${h ? "rgba(144,113,79,0.2)" : "#1A1F2B"}`, transform: h ? "translateY(-3px)" : "none" }}>
      <div className="h-[220px] relative overflow-hidden" style={{ background: `linear-gradient(135deg, #050810, hsl(${item.hue}, 20%, 12%))` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[140px] font-bold select-none" style={{ color: `hsl(${item.hue}, 15%, 15%)` }}>{item.artist.charAt(0)}</div>
        <div className="absolute top-4 left-4 font-mono text-[10px] text-cs-dim">[{String(i + 1).padStart(2, "0")}]</div>
        <button onClick={() => setPlaying(!playing)} className="absolute bottom-4 right-4 w-11 h-11 bg-cs-gold border-none rounded-full flex items-center justify-center transition-all duration-400"
          style={{ transform: h ? "scale(1)" : "scale(0.8) translateY(8px)", opacity: h ? 1 : 0, boxShadow: "0 0 30px rgba(196,151,103,0.2)", cursor: "pointer" }}>
          <span className="text-cs-deep text-sm font-bold" style={{ marginLeft: playing ? 0 : 2 }}>{playing ? "❚❚" : "▶"}</span>
        </button>
      </div>
      <div className="p-5 pb-6">
        <div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.15em] mb-1.5">{item.type} · {item.year}</div>
        <h3 className="font-display text-xl text-cs-white uppercase mb-1">{item.title}</h3>
        <div className="font-body text-sm text-cs-muted">{item.artist}</div>
        {playing && <div className="mt-3.5"><WaveVisualizer bars={50} height={28} className="!opacity-50" /><div className="flex justify-between mt-1.5"><span className="font-mono text-[9px] text-cs-dim">01:24</span><span className="font-mono text-[9px] text-cs-dim">03:45</span></div></div>}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <div className="pt-24">
      <Sect>
        <SectionHead title="Realizacje" sub="portfolio" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{PORTFOLIO.map((item, i) => <RevealDiv key={i} delay={i * 100}><Card item={item} i={i} /></RevealDiv>)}</div>
      </Sect>
    </div>
  );
}
