"use client";
import { useState } from "react";
import { Service } from "@/lib/data";

export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} className="bg-cs-card rounded-sm cursor-pointer relative overflow-hidden transition-all duration-500"
      style={{ padding: "clamp(28px, 3vw, 44px) clamp(24px, 2.5vw, 36px)", border: `1px solid ${h ? "rgba(144,113,79,0.2)" : "#1A1F2B"}`, transform: h ? "translateY(-3px)" : "none" }}>
      {h && <div className="absolute -top-[50px] -right-[50px] w-[250px] h-[250px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.04) 0%, transparent 70%)" }} />}
      <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500" style={{ background: "linear-gradient(90deg, transparent, rgba(196,151,103,0.3), transparent)", opacity: h ? 1 : 0 }} />
      <div className="flex justify-between items-start mb-5 md:mb-6">
        <span className="text-3xl md:text-4xl">{service.icon}</span>
        <span className="font-mono text-[10px] md:text-[11px] text-cs-gold-dim tracking-[0.15em] border border-cs-line px-2.5 py-1">{service.tag}</span>
      </div>
      <h3 className="font-display text-xl md:text-2xl text-cs-white uppercase tracking-wide mb-3">{service.title}</h3>
      <p className="font-body text-sm md:text-base text-cs-muted leading-relaxed mb-6">{service.desc}</p>
      <div className="font-display text-lg md:text-xl text-cs-gold">{service.price}</div>
      <div className="absolute bottom-4 right-5 font-display text-6xl md:text-7xl font-bold text-cs-line leading-none opacity-50">{String(index + 1).padStart(2, "0")}</div>
    </div>
  );
}
