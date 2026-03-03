"use client";
import Link from "next/link";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";
import { PACKAGES, HOURLY_RATE, WEEKEND_SURCHARGE, Package } from "@/lib/data";

export default function CennikPage() {
  return (
    <div className="pt-20 md:pt-28">
      {/* Stawka godzinowa */}
      <Sect>
        <SectionHead title="Cennik" sub="pricing" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-[800px] mx-auto">
          <RevealDiv>
            <div className="bg-cs-card border border-[rgba(144,113,79,0.2)] rounded-sm text-center relative overflow-hidden" style={{padding:"clamp(32px,4vw,52px) clamp(24px,3vw,36px)"}}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg, transparent, #C49767, transparent)"}}/>
              <h3 className="font-display text-xl md:text-2xl text-cs-muted uppercase tracking-[0.15em] mb-5">Pon - Pt</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="font-display font-bold text-cs-gold" style={{fontSize:"clamp(48px,7vw,72px)"}}>{HOURLY_RATE}</span>
                <span className="font-mono text-sm text-cs-dim">zl / h</span>
              </div>
              <div className="font-mono text-xs text-cs-dim mb-6">10:00 - 22:00</div>
              <div className="border-t border-cs-line pt-5 space-y-3">
                <div className="font-body text-sm md:text-base text-cs-muted flex items-center gap-3"><span className="text-cs-gold-dim text-[10px]">&#9670;</span> Profesjonalne studio nagraniowe</div>
                <div className="font-body text-sm md:text-base text-cs-muted flex items-center gap-3"><span className="text-cs-gold-dim text-[10px]">&#9670;</span> Inzynier dzwieku w cenie</div>
                <div className="font-body text-sm md:text-base text-cs-muted flex items-center gap-3"><span className="text-cs-gold-dim text-[10px]">&#9670;</span> Dostep do pelnego sprzetu</div>
                <div className="font-body text-sm md:text-base text-cs-muted flex items-center gap-3"><span className="text-cs-gold-dim text-[10px]">&#9670;</span> WAV + MP3 export</div>
              </div>
              <Link href="/rezerwacje" className="inline-block w-full mt-8"><GlowBtn className="w-full">Zarezerwuj</GlowBtn></Link>
            </div>
          </RevealDiv>

          <RevealDiv delay={120}>
            <div className="bg-cs-card border border-cs-line rounded-sm text-center" style={{padding:"clamp(32px,4vw,52px) clamp(24px,3vw,36px)"}}>
              <h3 className="font-display text-xl md:text-2xl text-cs-muted uppercase tracking-[0.15em] mb-5">Sobota</h3>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="font-display font-bold text-cs-gold" style={{fontSize:"clamp(48px,7vw,72px)"}}>{HOURLY_RATE + WEEKEND_SURCHARGE}</span>
                <span className="font-mono text-sm text-cs-dim">zl / h</span>
              </div>
              <div className="font-mono text-[11px] text-cs-gold-dim mb-4">+{WEEKEND_SURCHARGE} zl/h doplata weekendowa</div>
              <div className="font-mono text-xs text-cs-dim mb-6">12:00 - 20:00</div>
              <div className="border-t border-cs-line pt-5 space-y-3">
                <div className="font-body text-sm md:text-base text-cs-muted flex items-center gap-3"><span className="text-cs-gold-dim text-[10px]">&#9670;</span> Wszystko co w tygodniu</div>
                <div className="font-body text-sm md:text-base text-cs-muted flex items-center gap-3"><span className="text-cs-gold-dim text-[10px]">&#9670;</span> Spokojna atmosfera weekendu</div>
                <div className="font-body text-sm md:text-base text-cs-muted flex items-center gap-3"><span className="text-cs-gold-dim text-[10px]">&#9670;</span> Pelna dyspozycyjnosc studia</div>
              </div>
              <Link href="/rezerwacje" className="inline-block w-full mt-8"><GlowBtn ghost className="w-full">Zarezerwuj</GlowBtn></Link>
            </div>
          </RevealDiv>
        </div>
      </Sect>

      {/* Pakiety */}
      <Sect>
        <SectionHead title="Pakiety" sub="bundles" />
        <p className="font-body text-base md:text-lg text-cs-muted text-center max-w-[600px] mx-auto mb-10">Zamow pakiet godzin i zaoszczedz. Pakiety mozna wykorzystac w dowolnym terminie.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">{PACKAGES.map((p, i) => {
          const priceNum = p.price;
          const hoursNum = p.hours;
          const perHour = Math.round(priceNum / hoursNum);
          const saved = (HOURLY_RATE * hoursNum) - priceNum;
          return (
            <RevealDiv key={i} delay={i * 80}>
              <div className="bg-cs-card border border-cs-line rounded-sm p-7 md:p-9 relative overflow-hidden">
                {i === 2 && <div className="absolute -top-px left-1/2 -translate-x-1/2 font-mono text-[9px] text-cs-deep bg-cs-gold px-4 py-1 tracking-[0.2em] font-bold">BEST VALUE</div>}
                <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.15em] mb-2">{p.hours}H STUDIO TIME</div>
                <h3 className="font-display text-xl md:text-2xl text-cs-white uppercase mb-4">{p.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-3xl md:text-4xl text-cs-gold font-bold">{priceNum}</span>
                  <span className="font-mono text-sm text-cs-dim">zl</span>
                </div>
                <div className="font-mono text-[11px] text-cs-gold-dim mb-1">{perHour} zl/h</div>
                <div className="font-mono text-[11px] text-cs-green mb-4">Oszczedzasz {saved} zl</div>
                <p className="font-body text-sm md:text-base text-cs-dim">{p.desc}</p>
                <Link href={"/rezerwacje?package="+p.id} className="inline-block w-full mt-6"><GlowBtn ghost className="w-full">Wybierz pakiet</GlowBtn></Link>
              </div>
            </RevealDiv>
          );
        })}</div>
      </Sect>

      {/* Info */}
      <Sect>
        <div className="bg-cs-card border border-cs-line rounded-sm p-8 md:p-12 text-center max-w-[700px] mx-auto">
          <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-3">PLATNOSCI</div>
          <p className="font-body text-base md:text-lg text-cs-muted">Platnosc online przez PayU (BLIK, karta, przelew). Mozliwosc platnosci na miejscu gotowka lub karta.</p>
        </div>
      </Sect>
    </div>
  );
}
