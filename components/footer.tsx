"use client";
import Link from "next/link";
import { MarqueeBand, WaveVisualizer } from "./ui";
import { MARQUEE_SERVICES } from "@/lib/data";

const links = [{ href: "/", label: "Home" }, { href: "/oferta", label: "Oferta" }, { href: "/portfolio", label: "Portfolio" }, { href: "/cennik", label: "Cennik" }, { href: "/kontakt", label: "Kontakt" }, { href: "/rezerwacje", label: "Rezerwacje" }];

export default function Footer() {
  return (
    <footer className="bg-cs-deep border-t border-cs-line">
      <MarqueeBand items={MARQUEE_SERVICES} />
      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4"><div className="w-1.5 h-1.5 bg-cs-gold rounded-full" /><span className="font-display text-base font-semibold text-cs-white tracking-[0.12em]">CASEOUT STUDIO</span></div>
          <p className="font-body text-[13px] text-cs-muted leading-relaxed">Underground z klasą.</p>
          <WaveVisualizer bars={30} height={30} className="mt-5" />
        </div>
        <div>
          <div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.2em] mb-4">NAV</div>
          {links.map(p => <Link key={p.href} href={p.href} className="block font-body text-[13px] text-cs-muted py-[5px] no-underline hover:text-cs-gold transition-colors">{p.label}</Link>)}
        </div>
        <div>
          <div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.2em] mb-4">KONTAKT</div>
          <p className="font-body text-[13px] text-cs-muted leading-8">Kopernika 30<br />Warszawa<br />hello@caseout.pl</p>
        </div>
        <div>
          <div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.2em] mb-4">SOCIAL</div>
          {["Instagram", "YouTube", "SoundCloud", "Spotify"].map(s => <div key={s} className="font-body text-[13px] text-cs-muted py-[5px] cursor-pointer hover:text-cs-gold transition-colors">{s}</div>)}
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-5 border-t border-cs-line flex justify-between">
        <span className="font-mono text-[10px] text-cs-dim">© 2025 CASEOUT STUDIO</span>
        <span className="font-mono text-[10px] text-cs-dim">WARSZAWA · PL</span>
      </div>
    </footer>
  );
}
