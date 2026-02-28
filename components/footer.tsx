"use client";
import Link from "next/link";
import { MarqueeBand, WaveVisualizer } from "./ui";
import { MARQUEE_SERVICES } from "@/lib/data";

const links = [{ href: "/", label: "Home" }, { href: "/oferta", label: "Oferta" }, { href: "/portfolio", label: "Portfolio" }, { href: "/cennik", label: "Cennik" }, { href: "/kontakt", label: "Kontakt" }, { href: "/rezerwacje", label: "Rezerwacje" }];

export default function Footer() {
  return (
    <footer className="bg-cs-deep border-t border-cs-line">
      <MarqueeBand items={MARQUEE_SERVICES} />
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-16 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
        <div>
          <div className="flex items-center gap-2 mb-5"><div className="w-2 h-2 bg-cs-gold rounded-full" /><span className="font-display text-lg font-semibold text-cs-white tracking-[0.12em]">CASEOUT STUDIO</span></div>
          <p className="font-body text-sm md:text-base text-cs-muted leading-relaxed">Underground z klasą.<br/>Profesjonalne studio nagraniowe w Warszawie.</p>
          <WaveVisualizer bars={30} height={30} className="mt-6" />
        </div>
        <div>
          <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-5">NAWIGACJA</div>
          {links.map(p => <Link key={p.href} href={p.href} className="block font-body text-sm md:text-base text-cs-muted py-1.5 no-underline hover:text-cs-gold transition-colors">{p.label}</Link>)}
        </div>
        <div>
          <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-5">KONTAKT</div>
          <p className="font-body text-sm md:text-base text-cs-muted leading-8">ul. Kopernika 30<br />00-336 Warszawa<br />hello@caseout.pl<br />+48 XXX XXX XXX</p>
        </div>
        <div>
          <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-5">SOCIAL</div>
          {["Instagram", "YouTube", "SoundCloud", "Spotify"].map(s => <div key={s} className="font-body text-sm md:text-base text-cs-muted py-1.5 cursor-pointer hover:text-cs-gold transition-colors">{s}</div>)}
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-6 border-t border-cs-line flex flex-col sm:flex-row justify-between gap-2">
        <span className="font-mono text-[11px] text-cs-dim">© 2025 CASEOUT STUDIO</span>
        <span className="font-mono text-[11px] text-cs-dim">WARSZAWA · PL</span>
      </div>
    </footer>
  );
}
