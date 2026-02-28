"use client";
import { useState } from "react";
import Link from "next/link";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";
import { PRICING, PACKAGES } from "@/lib/data";

function PriceCard({ plan }: { plan: typeof PRICING[0] }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} className="rounded-sm text-center relative overflow-hidden transition-all duration-500"
      style={{ padding: "40px 28px", background: plan.highlight ? "linear-gradient(180deg, rgba(196,151,103,0.02), #0E1319)" : "#0E1319", border: `1px solid ${plan.highlight ? "rgba(144,113,79,0.2)" : "#1A1F2B"}`, transform: h ? "translateY(-3px)" : "none" }}>
      {plan.highlight && <><div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #C49767, transparent)" }} /><div className="absolute -top-px left-1/2 -translate-x-1/2 font-mono text-[9px] text-cs-deep bg-cs-gold px-4 py-1 tracking-[0.2em]">POPULAR</div></>}
      <h3 className="font-display text-lg text-cs-muted uppercase tracking-[0.15em] mb-4" style={{ marginTop: plan.highlight ? 12 : 0 }}>{plan.name}</h3>
      <div className="flex items-baseline justify-center gap-1 mb-7"><span className="font-display text-5xl font-bold text-cs-gold">{plan.price}</span><span className="font-mono text-xs text-cs-dim">{plan.unit}</span></div>
      <div className="border-t border-cs-line pt-5">{plan.features.map((f, i) => <div key={i} className="font-body text-[13px] text-cs-muted py-2.5 flex items-center gap-2"><span className="text-cs-gold-dim text-[8px]">◆</span> {f}</div>)}</div>
      <Link href="/rezerwacje" className="inline-block w-full mt-6"><GlowBtn ghost={!plan.highlight} className="w-full">{plan.highlight ? "Wybierz Pro" : "Wybierz"}</GlowBtn></Link>
    </div>
  );
}

export default function CennikPage() {
  return (
    <div className="pt-24">
      <Sect><SectionHead title="Cennik" sub="pricing" /><div className="grid grid-cols-1 md:grid-cols-3 gap-5">{PRICING.map((p, i) => <RevealDiv key={i} delay={i * 120}><PriceCard plan={p} /></RevealDiv>)}</div></Sect>
      <Sect><SectionHead title="Pakiety Sesyjne" sub="bundles" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{PACKAGES.map((p, i) => (
        <RevealDiv key={i} delay={i * 80}><div className="bg-cs-card border border-cs-line rounded-sm p-7"><div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.15em] mb-1.5">{p.hours}</div><h3 className="font-display text-xl text-cs-white uppercase mb-2">{p.name}</h3><div className="font-display text-3xl text-cs-gold">{p.price}</div><p className="font-body text-[13px] text-cs-dim mt-2">{p.desc}</p></div></RevealDiv>
      ))}</div></Sect>
    </div>
  );
}
