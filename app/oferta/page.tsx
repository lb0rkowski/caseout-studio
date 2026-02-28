"use client";
import Link from "next/link";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";
import ServiceCard from "@/components/service-card";
import { SERVICES, PACKAGES } from "@/lib/data";

export default function OfertaPage() {
  return (
    <div className="pt-20 md:pt-28">
      <Sect>
        <SectionHead title="Pełna Oferta" sub="what we do" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">{SERVICES.map((s, i) => <RevealDiv key={i} delay={i * 80}><ServiceCard service={s} index={i} /></RevealDiv>)}</div>
      </Sect>
      <Sect>
        <SectionHead title="Pakiety" sub="bundles" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">{PACKAGES.map((p, i) => (
          <RevealDiv key={i} delay={i * 100}>
            <div className="bg-cs-card border border-cs-line rounded-sm p-8 md:p-10 text-center">
              <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-3">{p.hours}</div>
              <h3 className="font-display text-2xl md:text-3xl text-cs-white uppercase mb-3">{p.name}</h3>
              <div className="font-display text-4xl md:text-5xl text-cs-gold mb-3">{p.price}</div>
              <p className="font-body text-sm md:text-base text-cs-dim">{p.desc}</p>
              <Link href="/rezerwacje" className="inline-block mt-6"><GlowBtn ghost>Wybierz →</GlowBtn></Link>
            </div>
          </RevealDiv>
        ))}</div>
      </Sect>
    </div>
  );
}
