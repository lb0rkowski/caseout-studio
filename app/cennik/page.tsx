"use client";
import { useState } from "react";
import Link from "next/link";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";
import { PRICING, PACKAGES } from "@/lib/data";

function PriceCard({ plan }: { plan: typeof PRICING[0] }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} className="rounded-sm text-center relative overflow-hidden transition-all duration-500"
      style={{ padding: "clamp(32px, 4vw, 52px) clamp(24px, 3vw, 36px)", background: plan.highlight ? "linear-gradient(180deg, rgba(196,151,103,0.03), #0E1319)" : "#0E1319", border: `1px solid ${plan.highlight ? "rgba(144,113,79,0.25)" : "#1A1F2B"}`, transform: h ? "translateY(-4px)" : "none" }}>
      {plan.highlight && <><div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #C49767, transparent)" }} /><div className="absolute -top-px left-1/2 -translate-x-1/2 font-mono text-[10px] text-cs-deep bg-cs-gold px-5 py-1.5 tracking-[0.2em] font-bold">POPULAR</div></>}
      <h3 className="font-display text-xl md:text-2xl text-cs-muted uppercase tracking-[0.15em] mb-5" style={{ marginTop: plan.highlight ? 16 : 0 }}>{plan.name}</h3>
      <div className="flex items-baseline justify-center gap-2 mb-8"><span className="font-display font-bold text-cs-gold" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>{plan.price}</span><span className="font-mono text-sm text-cs-dim">{plan.unit}</span></div>
      <div className="border-t border-cs-line pt-6">{plan.features.map((f, i) => <div key={i} className="font-body text-sm md:text-base text-cs-muted py-3 flex items-center gap-3"><span className="text-cs-gold-dim text-[10px]">◆</span> {f}</div>)}</div>
      <Link href="/rezerwacje" className="inline-block w-full mt-8"><GlowBtn ghost={!plan.highlight} className="w-full">{plan.highlight ? "Wybierz Pro" : "Wybierz"}</GlowBtn></Link>
    </div>
  );
}

export default function CennikPage() {
  return (
    <div className="pt-20 md:pt-28">
      <Sect><SectionHead title="Cennik" sub="pricing" /><div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">{PRICING.map((p, i) => <RevealDiv key={i} delay={i * 120}><PriceCard plan={p} /></RevealDiv>)}</div></Sect>
      <Sect><SectionHead title="Pakiety Sesyjne" sub="bundles" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">{PACKAGES.map((p, i) => (
        <RevealDiv key={i} delay={i * 80}><div className="bg-cs-card border border-cs-line rounded-sm p-7 md:p-9"><div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.15em] mb-2">{p.hours}</div><h3 className="font-display text-xl md:text-2xl text-cs-white uppercase mb-3">{p.name}</h3><div className="font-display text-3xl md:text-4xl text-cs-gold">{p.price}</div><p className="font-body text-sm md:text-base text-cs-dim mt-3">{p.desc}</p></div></RevealDiv>
      ))}</div></Sect>
    </div>
  );
}
