"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [{ href: "/", label: "Home" }, { href: "/oferta", label: "Oferta" }, { href: "/portfolio", label: "Portfolio" }, { href: "/cennik", label: "Cennik" }, { href: "/kontakt", label: "Kontakt" }, { href: "/rezerwacje", label: "Rezerwacje" }];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9000] transition-all duration-500" style={{ background: scrolled ? "rgba(5,8,16,0.87)" : "transparent", backdropFilter: scrolled ? "blur(24px) saturate(1.2)" : "none", borderBottom: scrolled ? "1px solid #1A1F2B" : "1px solid transparent" }}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-2 h-2 bg-cs-gold rounded-full" style={{ boxShadow: "0 0 12px rgba(196,151,103,0.4)" }} />
          <span className="font-display text-[15px] font-semibold text-cs-white tracking-[0.15em] uppercase">Caseout</span>
          <span className="font-mono text-[9px] text-cs-dim ml-1">STUDIO</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {pages.map(p => (
            <Link key={p.href} href={p.href} className="relative px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] no-underline transition-colors duration-300" style={{ color: pathname === p.href ? "#C49767" : "#706860" }}>
              {p.label}
              {pathname === p.href && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[3px] h-[3px] bg-cs-gold rounded-full" style={{ boxShadow: "0 0 6px #C49767" }} />}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
