"use client";
import { useState } from "react";
import { Service } from "@/lib/data";

export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} className="bg-cs-card rounded-sm cursor-pointer relative overflow-hidden transition-all duration-500"
      style={{ padding: "36px 28px", border: `1px solid ${h ? "rgba(144,113,79,0.2)" : "#1A1F2B"}`, transform: h ? "translateY(-2px)" : "none" }}>
      {h && <div className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,151,103,0.03) 0%, transparent 70%)" }} />}
      <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500" style={{ background: "linear-gradient(90deg, transparent, rgba(196,151,103,0.25), transparent)", opacity: h ? 1 : 0 }} />
      <div className="flex justify-between items-start mb-5">
        <span className="text-2xl">{service.icon}</span>
        <span className="font-mono text-[9px] text-cs-gold-dim tracking-[0.15em] border border-cs-line px-2 py-[3px]">{service.tag}</span>
      </div>
      <h3 className="font-display text-xl text-cs-white uppercase tracking-wide mb-2.5">{service.title}</h3>
      <p className="font-body text-[13px] text-cs-muted leading-relaxed mb-5">{service.desc}</p>
      <div className="font-display text-base text-cs-gold">{service.price}</div>
      <div className="absolute bottom-4 right-5 font-display text-5xl font-bold text-cs-line leading-none">{String(index + 1).padStart(2, "0")}</div>
    </div>
  );
}
