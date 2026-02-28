"use client";
import { useState } from "react";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";

export default function KontaktPage() {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const send = async () => {
    if (!form.name || !form.email || !form.msg) return;
    setStatus("sending");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, message: form.msg }) });
      if (!r.ok) throw new Error();
      setStatus("sent"); setForm({ name: "", email: "", msg: "" }); setTimeout(() => setStatus("idle"), 4000);
    } catch { setStatus("error"); setTimeout(() => setStatus("idle"), 3000); }
  };

  const inp = "w-full p-3.5 bg-cs-deep border border-cs-line rounded-sm text-cs-text font-body text-sm outline-none transition-all duration-300";

  return (
    <div className="pt-24">
      <Sect>
        <SectionHead title="Kontakt" sub="get in touch" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <RevealDiv>
            <div className="mb-9"><div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.2em] mb-3.5">ADRES</div><p className="font-body text-[15px] text-cs-text leading-relaxed">Caseout Studio<br />ul. Mikołaja Kopernika 30<br />00-336 Warszawa</p></div>
            <div className="mb-9"><div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.2em] mb-3.5">GODZINY</div><p className="font-body text-[15px] text-cs-text leading-relaxed">Pon–Pt: 10:00 – 22:00<br />Sob: 12:00 – 20:00<br />Nd: Zamknięte</p></div>
            <div className="mb-9"><div className="font-mono text-[10px] text-cs-gold-dim tracking-[0.2em] mb-3.5">EMAIL / TEL</div><p className="font-body text-[15px] text-cs-text leading-relaxed">hello@caseoutstudio.pl<br />+48 XXX XXX XXX</p></div>
            <div className="h-[180px] bg-cs-card border border-cs-line flex items-center justify-center relative overflow-hidden"><div className="absolute inset-0 opacity-[0.04] grid-bg" style={{ backgroundSize: "20px 20px" }} /><span className="font-mono text-[10px] text-cs-dim">🗺 GOOGLE MAPS · KOPERNIKA 30</span></div>
          </RevealDiv>
          <RevealDiv delay={150}>
            <div className="flex flex-col gap-4">
              <div><label className="font-mono text-[10px] text-cs-dim tracking-[0.15em] mb-2 block">IMIĘ</label><input className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="—" /></div>
              <div><label className="font-mono text-[10px] text-cs-dim tracking-[0.15em] mb-2 block">EMAIL</label><input className={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="—" /></div>
              <div><label className="font-mono text-[10px] text-cs-dim tracking-[0.15em] mb-2 block">WIADOMOŚĆ</label><textarea className={`${inp} min-h-[160px] resize-y`} value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })} placeholder="Opisz swój projekt..." /></div>
              <GlowBtn onClick={send} disabled={status === "sending"} className="self-start">{status === "sending" ? "Wysyłanie..." : "Wyślij"}</GlowBtn>
              {status === "sent" && <div className="font-mono text-[11px] text-cs-green">✓ Wiadomość wysłana</div>}
              {status === "error" && <div className="font-mono text-[11px] text-cs-red">✗ Błąd — spróbuj ponownie</div>}
            </div>
            <div className="mt-8 flex gap-2 flex-wrap">{["IG", "YT", "SC", "Spotify", "TikTok"].map(s => <div key={s} className="px-3.5 py-2 border border-cs-line font-mono text-[10px] text-cs-dim cursor-pointer tracking-[0.1em] hover:text-cs-gold transition-colors">{s}</div>)}</div>
          </RevealDiv>
        </div>
      </Sect>
    </div>
  );
}
