"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";

interface Beat {
  id: number; title: string; bpm: number; key: string; tags: string;
  price: number; audio_url: string; cover_url: string; status: string;
}

type SortKey = "newest" | "price_asc" | "price_desc" | "bpm_asc" | "bpm_desc" | "title";

export default function BeatyPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [durations, setDurations] = useState<Record<number, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [filterTag, setFilterTag] = useState("");
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    fetch("/api/beats")
      .then(r => r.json())
      .then(d => setBeats(Array.isArray(d) ? d.filter((b: Beat) => b.status === "active") : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // All unique tags
  const allTags = useMemo(() => {
    const s = new Set<string>();
    beats.forEach(b => b.tags?.split(",").forEach(t => { const tr = t.trim(); if (tr) s.add(tr); }));
    return Array.from(s).sort();
  }, [beats]);

  // Filtered + sorted
  const displayed = useMemo(() => {
    let list = [...beats];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(b => b.title.toLowerCase().includes(q) || b.tags?.toLowerCase().includes(q) || b.key?.toLowerCase().includes(q));
    }
    if (filterTag) list = list.filter(b => b.tags?.toLowerCase().includes(filterTag.toLowerCase()));
    switch (sortBy) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "bpm_asc": list.sort((a, b) => a.bpm - b.bpm); break;
      case "bpm_desc": list.sort((a, b) => b.bpm - a.bpm); break;
      case "title": list.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: list.sort((a, b) => b.id - a.id); break;
    }
    return list;
  }, [beats, sortBy, filterTag, searchQ]);

  const playBeat = (beat: Beat) => {
    if (!beat.audio_url) return;
    if (playingId === beat.id) { audioRef.current?.pause(); setPlayingId(null); return; }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(beat.audio_url);
    audioRef.current = audio;
    setPlayingId(beat.id);
    audio.addEventListener("timeupdate", () => setProgress(p => ({ ...p, [beat.id]: audio.currentTime })));
    audio.addEventListener("loadedmetadata", () => setDurations(d => ({ ...d, [beat.id]: audio.duration })));
    audio.addEventListener("ended", () => { setPlayingId(null); setProgress(p => ({ ...p, [beat.id]: 0 })); });
    audio.play().catch(() => {});
  };

  const seek = (beatId: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || playingId !== beatId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * (durations[beatId] || 0);
  };

  const fmtTime = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

  useEffect(() => { return () => { audioRef.current?.pause(); }; }, []);

  const sortOpts: { key: SortKey; label: string }[] = [
    { key: "newest", label: "Najnowsze" },
    { key: "price_asc", label: "Cena ↑" },
    { key: "price_desc", label: "Cena ↓" },
    { key: "bpm_asc", label: "BPM ↑" },
    { key: "bpm_desc", label: "BPM ↓" },
    { key: "title", label: "A-Z" },
  ];

  return (
    <div className="pt-20 md:pt-28">
      <Sect>
        <SectionHead title="Beaty" sub="buy exclusive beats" />

        {loading && <div className="text-center py-20"><div className="inline-block w-8 h-8 border-2 border-cs-gold-dim border-t-cs-gold rounded-full" style={{ animation: "spin 0.8s linear infinite" }} /></div>}

        {!loading && beats.length === 0 && (
          <div className="text-center py-20">
            <div className="font-display text-2xl text-cs-dim mb-2">Brak beatow</div>
            <div className="font-mono text-xs text-cs-dim">Wracaj wkrotce — nowe produkcje w drodze</div>
          </div>
        )}

        {!loading && beats.length > 0 && <>
          {/* Search + Sort + Filter bar */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Szukaj beatu..." className="w-full p-3 pl-10 bg-cs-card border border-cs-line rounded-sm text-cs-text font-mono text-sm outline-none focus:border-cs-gold-dim transition-colors" />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cs-dim text-sm">&#128269;</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {sortOpts.map(o => (
                  <button key={o.key} onClick={() => setSortBy(o.key)} className="font-mono text-[10px] px-3 py-2 rounded-sm cursor-pointer transition-all whitespace-nowrap" style={{ background: sortBy === o.key ? "rgba(196,151,103,0.08)" : "transparent", border: "1px solid " + (sortBy === o.key ? "rgba(196,151,103,0.25)" : "#1A1F2B"), color: sortBy === o.key ? "#C49767" : "#706860" }}>{o.label}</button>
                ))}
              </div>
            </div>
            {allTags.length > 0 && <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setFilterTag("")} className="font-mono text-[10px] px-3 py-1.5 rounded-sm cursor-pointer transition-all" style={{ background: !filterTag ? "rgba(196,151,103,0.08)" : "transparent", border: "1px solid " + (!filterTag ? "rgba(196,151,103,0.2)" : "#1A1F2B"), color: !filterTag ? "#C49767" : "#706860" }}>Wszystkie</button>
              {allTags.map(t => (
                <button key={t} onClick={() => setFilterTag(filterTag === t ? "" : t)} className="font-mono text-[10px] px-3 py-1.5 rounded-sm cursor-pointer transition-all" style={{ background: filterTag === t ? "rgba(196,151,103,0.08)" : "transparent", border: "1px solid " + (filterTag === t ? "rgba(196,151,103,0.2)" : "#1A1F2B"), color: filterTag === t ? "#C49767" : "#706860" }}>{t}</button>
              ))}
            </div>}
            {(searchQ || filterTag) && <div className="font-mono text-[11px] text-cs-dim">{displayed.length} {displayed.length === 1 ? "beat" : "beatow"}{filterTag && " · tag: " + filterTag}{searchQ && ' · "' + searchQ + '"'}</div>}
          </div>
        </>}

        <div className="space-y-4">
          {displayed.map((beat, i) => {
            const isPlaying = playingId === beat.id;
            const dur = durations[beat.id] || 0;
            const prog = progress[beat.id] || 0;
            const pct = dur > 0 ? (prog / dur) * 100 : 0;
            const tagList = beat.tags ? beat.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

            return (
              <RevealDiv key={beat.id} delay={i * 40}>
                <div className="bg-cs-card border rounded-sm overflow-hidden transition-all duration-300" style={{ borderColor: isPlaying ? "rgba(196,151,103,0.25)" : "#1A1F2B" }}>
                  <div className="p-5 md:p-7">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                      <button onClick={() => playBeat(beat)} disabled={!beat.audio_url} className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 cursor-pointer" style={{ background: isPlaying ? "rgba(196,151,103,0.12)" : "rgba(14,19,25,0.8)", border: "2px solid " + (isPlaying ? "#C49767" : beat.audio_url ? "rgba(196,151,103,0.2)" : "#1A1F2B"), opacity: beat.audio_url ? 1 : 0.3 }}>
                        {isPlaying ? <div className="flex gap-1"><div className="w-1 h-5 rounded-full" style={{ background: "#C49767" }} /><div className="w-1 h-5 rounded-full" style={{ background: "#C49767" }} /></div>
                          : <div className="w-0 h-0 ml-1" style={{ borderLeft: "12px solid #C49767", borderTop: "7px solid transparent", borderBottom: "7px solid transparent" }} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-display text-xl md:text-2xl text-cs-white uppercase tracking-wide">{beat.title}</h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="font-mono text-[11px] text-cs-gold-dim">{beat.bpm} BPM</span>
                              {beat.key && <span className="font-mono text-[11px] text-cs-dim">{beat.key}</span>}
                              {tagList.map(t => (
                                <button key={t} onClick={() => setFilterTag(filterTag === t ? "" : t)} className="font-mono text-[9px] px-2 py-0.5 rounded-sm cursor-pointer transition-colors" style={{ background: filterTag === t ? "rgba(196,151,103,0.12)" : "rgba(196,151,103,0.06)", border: "1px solid " + (filterTag === t ? "rgba(196,151,103,0.3)" : "rgba(196,151,103,0.1)"), color: "#90714F" }}>{t}</button>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="font-display text-2xl md:text-3xl text-cs-gold font-bold">{beat.price}</div>
                              <div className="font-mono text-[10px] text-cs-dim">PLN</div>
                            </div>
                          </div>
                        </div>
                        <div className="relative h-10 md:h-12 rounded-sm overflow-hidden mt-3 cursor-pointer" style={{ background: "rgba(5,8,16,0.5)", border: "1px solid " + (isPlaying ? "rgba(196,151,103,0.15)" : "#1A1F2B") }} onClick={(e) => seek(beat.id, e)}>
                          <div className="absolute inset-0 flex items-end gap-px px-1 py-1">
                            {Array.from({ length: 80 }, (_, j) => {
                              const h = 15 + Math.sin(j * 0.3 + beat.id) * 25 + Math.cos(j * 0.7) * 20;
                              const filled = pct > (j / 80) * 100;
                              return <div key={j} className="flex-1 rounded-sm transition-colors duration-100" style={{ height: h + "%", background: filled ? "rgba(196,151,103,0.5)" : "rgba(196,151,103,0.08)" }} />;
                            })}
                          </div>
                          {(isPlaying || prog > 0) && <div className="absolute bottom-1 left-2 font-mono text-[10px] text-cs-gold-dim">{fmtTime(prog)}</div>}
                          {dur > 0 && <div className="absolute bottom-1 right-2 font-mono text-[10px] text-cs-dim">{fmtTime(dur)}</div>}
                          {!beat.audio_url && <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-cs-dim">Audio wkrotce</div>}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button className="font-mono text-[11px] px-6 py-2.5 rounded-sm transition-all cursor-pointer" style={{ background: "rgba(196,151,103,0.08)", border: "1px solid rgba(196,151,103,0.25)", color: "#C49767" }}>Kup beat — {beat.price} zl</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealDiv>
            );
          })}
        </div>

        {!loading && displayed.length === 0 && beats.length > 0 && (
          <div className="text-center py-12">
            <div className="font-mono text-sm text-cs-dim mb-2">Brak wynikow</div>
            <button onClick={() => { setSearchQ(""); setFilterTag(""); }} className="font-mono text-[11px] text-cs-gold-dim cursor-pointer">Wyczysc filtry</button>
          </div>
        )}

        {!loading && beats.length > 0 && (
          <div className="mt-12 text-center">
            <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2">PLATNOSC</div>
            <div className="font-body text-sm text-cs-muted">Platnosc online przez Przelewy24 (BLIK, karta, przelew)</div>
            <div className="font-mono text-[10px] text-cs-dim mt-4">Po zakupie otrzymasz pliki WAV + MP3 + stems na email</div>
          </div>
        )}
      </Sect>
    </div>
  );
}
