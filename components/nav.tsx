"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [{ href: "/", label: "Home" }, { href: "/oferta", label: "Oferta" }, { href: "/portfolio", label: "Portfolio" }, { href: "/cennik", label: "Cennik" }, { href: "/kontakt", label: "Kontakt" }, { href: "/rezerwacje", label: "Rezerwacje" }];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[9000] transition-all duration-500" style={{ background: scrolled || open ? "rgba(5,8,16,0.94)" : "transparent", backdropFilter: scrolled ? "blur(24px) saturate(1.2)" : "none", borderBottom: scrolled ? "1px solid #1A1F2B" : "1px solid transparent" }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 md:h-20 px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline z-50">
            <div className="w-2.5 h-2.5 bg-cs-gold rounded-full" style={{ boxShadow: "0 0 12px rgba(196,151,103,0.4)" }} />
            <span className="font-display text-lg md:text-xl font-semibold text-cs-white tracking-[0.15em] uppercase">Caseout</span>
            <span className="font-mono text-[10px] text-cs-dim ml-1">STUDIO</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {pages.map(p => (
              <Link key={p.href} href={p.href} className="relative px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] no-underline transition-colors duration-300 hover:text-cs-gold" style={{ color: pathname === p.href ? "#C49767" : "#706860" }}>
                {p.label}
                {pathname === p.href && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cs-gold rounded-full" style={{ boxShadow: "0 0 6px #C49767" }} />}
              </Link>
            ))}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden z-50 w-10 h-10 flex flex-col items-center justify-center gap-[5px] bg-transparent border-none cursor-pointer">
            <span className="block w-5 h-[1.5px] bg-cs-white transition-all duration-300" style={{ transform: open ? "rotate(45deg) translateY(6.5px)" : "none" }} />
            <span className="block w-5 h-[1.5px] bg-cs-white transition-all duration-300" style={{ opacity: open ? 0 : 1 }} />
            <span className="block w-5 h-[1.5px] bg-cs-white transition-all duration-300" style={{ transform: open ? "rotate(-45deg) translateY(-6.5px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className="fixed inset-0 z-[8999] md:hidden transition-all duration-500" style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", background: "rgba(5,8,16,0.97)" }}>
        <div className="flex flex-col items-center justify-center h-full gap-2">
          {pages.map((p, i) => (
            <Link key={p.href} href={p.href} className="font-display text-3xl uppercase tracking-[0.1em] no-underline py-3 transition-all duration-500"
              style={{ color: pathname === p.href ? "#C49767" : "#706860", transform: open ? "translateY(0)" : "translateY(20px)", opacity: open ? 1 : 0, transitionDelay: `${i * 60}ms` }}>
              {p.label}
            </Link>
          ))}
          <div className="mt-8 font-mono text-[10px] text-cs-dim tracking-[0.2em]">KOPERNIKA 30 · WARSZAWA</div>
        </div>
      </div>
    </>
  );
}
