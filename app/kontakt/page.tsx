"use client";
import { SectionHead, Sect, RevealDiv } from "@/components/ui";

const SOCIALS = [
  { name: "Instagram", url: "https://instagram.com/caseoutstudio", icon: "IG" },
  { name: "TikTok", url: "https://tiktok.com/@caseoutstudio", icon: "TT" },
  { name: "YouTube", url: "https://youtube.com/@caseoutstudio", icon: "YT" },
  { name: "SoundCloud", url: "https://soundcloud.com/caseoutstudio", icon: "SC" },
];

export default function KontaktPage() {
  return (
    <div className="pt-20 md:pt-28">
      <Sect>
        <SectionHead title="Kontakt" sub="get in touch" />

        <div className="max-w-[800px] mx-auto">
          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <RevealDiv>
              <div className="bg-cs-card border border-cs-line rounded-sm p-7 md:p-9">
                <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-4">ADRES</div>
                <div className="font-display text-xl text-cs-white mb-2">Caseout Studio</div>
                <div className="font-body text-base text-cs-muted leading-relaxed">
                  ul. Mikolaja Kopernika 30<br/>
                  00-336 Warszawa
                </div>
                <a href="https://maps.google.com/?q=Kopernika+30+Warszawa" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 font-mono text-[11px] text-cs-gold-dim hover:text-cs-gold transition-colors px-3 py-1.5 rounded-sm border border-cs-line hover:border-cs-gold-dim">Pokaz na mapie &rarr;</a>
              </div>
            </RevealDiv>

            <RevealDiv delay={100}>
              <div className="bg-cs-card border border-cs-line rounded-sm p-7 md:p-9">
                <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-4">KONTAKT</div>
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-[10px] text-cs-dim mb-1">EMAIL</div>
                    <a href="mailto:kontakt@caseoutstudio.pl" className="font-body text-base text-cs-gold hover:text-cs-gold-dim transition-colors">kontakt@caseoutstudio.pl</a>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-cs-dim mb-1">TELEFON</div>
                    <a href="tel:+48600000000" className="font-body text-base text-cs-text hover:text-cs-gold transition-colors">+48 600 000 000</a>
                  </div>
                </div>
              </div>
            </RevealDiv>
          </div>

          {/* Godziny */}
          <RevealDiv delay={150}>
            <div className="bg-cs-card border border-cs-line rounded-sm p-7 md:p-9 mb-10">
              <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-4">GODZINY OTWARCIA</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="font-body text-base text-cs-white mb-1">Poniedzialek - Piatek</div>
                  <div className="font-mono text-sm text-cs-gold">10:00 - 22:00</div>
                </div>
                <div>
                  <div className="font-body text-base text-cs-white mb-1">Sobota</div>
                  <div className="font-mono text-sm text-cs-gold">12:00 - 20:00</div>
                </div>
                <div>
                  <div className="font-body text-base text-cs-white mb-1">Niedziela</div>
                  <div className="font-mono text-sm text-cs-red">Zamkniete</div>
                </div>
              </div>
            </div>
          </RevealDiv>

          {/* Social media */}
          <RevealDiv delay={200}>
            <div className="text-center">
              <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-6">SOCIAL MEDIA</div>
              <div className="flex justify-center gap-4 flex-wrap">
                {SOCIALS.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-4 rounded-sm transition-all duration-300 hover:-translate-y-1"
                    style={{ background: "rgba(14,19,25,0.8)", border: "1px solid #1A1F2B" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,151,103,0.3)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1F2B"; }}>
                    <span className="font-mono text-sm text-cs-gold font-bold">{s.icon}</span>
                    <span className="font-body text-sm text-cs-muted group-hover:text-cs-text transition-colors">{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </RevealDiv>
        </div>
      </Sect>
    </div>
  );
}
