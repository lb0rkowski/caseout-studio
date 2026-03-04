"use client";
import { useState, useEffect, useRef } from "react";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";

interface Beat {
  id: number; title: string; bpm: number; key: string; tags: string;
  price: number; audio_url: string; cover_url: string; status: string;
}

export default function BeatyPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [durations, setDurations] = useState<Record<number, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/beats")
      .then(r => r.json())
      .then(d => setBeats(Array.isArray(d) ? d.filter((b: Beat) => b.status === "active") : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const playBeat = (beat: Beat) => {
    if (!beat.audio_url) return;

    if (playingId === beat.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(beat.audio_url);
    audioRef.current = audio;
    setPlayingId(beat.id);

    audio.addEventListener("timeupdate", () => {
      setProgress(p => ({ ...p, [beat.id]: audio.currentTime }));
    });
    audio.addEventListener("loadedmetadata", () => {
      setDurations(d => ({ ...d, [beat.id]: audio.duration }));
    });
    audio.addEventListener("ended", () => {
      setPlayingId(null);
      setProgress(p => ({ ...p, [beat.id]: 0 }));
    });
    audio.play().catch(() => {});
  };

  const seek = (beatId: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || playingId !== beatId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * (durations[beatId] || 0);
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + String(sec).padStart(2, "0");
  };

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

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

        <div className="space-y-4">
          {beats.map((beat, i) => {
            const isPlaying = playingId === beat.id;
            const dur = durations[beat.id] || 0;
            const prog = progress[beat.id] || 0;
            const pct = dur > 0 ? (prog / dur) * 100 : 0;
            const tagList = beat.tags ? beat.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

            return (
              <RevealDiv key={beat.id} delay={i * 60}>
                <div
                  className="bg-cs-card border rounded-sm overflow-hidden transition-all duration-300"
                  style={{ borderColor: isPlaying ? "rgba(196,151,103,0.25)" : "#1A1F2B" }}
                >
                  <div className="p-5 md:p-7">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                      {/* Play button */}
                      <button
                        onClick={() => playBeat(beat)}
                        disabled={!beat.audio_url}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 cursor-pointer"
                        style={{
                          background: isPlaying ? "rgba(196,151,103,0.12)" : "rgba(14,19,25,0.8)",
                          border: "2px solid " + (isPlaying ? "#C49767" : beat.audio_url ? "rgba(196,151,103,0.2)" : "#1A1F2B"),
                          opacity: beat.audio_url ? 1 : 0.3,
                        }}
                      >
                        {isPlaying
                          ? <div className="flex gap-1"><div className="w-1 h-5 rounded-full" style={{ background: "#C49767" }} /><div className="w-1 h-5 rounded-full" style={{ background: "#C49767" }} /></div>
                          : <div className="w-0 h-0 ml-1" style={{ borderLeft: "12px solid #C49767", borderTop: "7px solid transparent", borderBottom: "7px solid transparent" }} />}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-display text-xl md:text-2xl text-cs-white uppercase tracking-wide">{beat.title}</h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="font-mono text-[11px] text-cs-gold-dim">{beat.bpm} BPM</span>
                              {beat.key && <span className="font-mono text-[11px] text-cs-dim">{beat.key}</span>}
                              {tagList.map(t => (
                                <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded-sm" style={{ background: "rgba(196,151,103,0.06)", border: "1px solid rgba(196,151,103,0.1)", color: "#90714F" }}>
                                  {t}
                                </span>
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

                        {/* Waveform / progress */}
                        <div
                          className="relative h-10 md:h-12 rounded-sm overflow-hidden mt-3 cursor-pointer group"
                          style={{ background: "rgba(5,8,16,0.5)", border: "1px solid " + (isPlaying ? "rgba(196,151,103,0.15)" : "#1A1F2B") }}
                          onClick={(e) => seek(beat.id, e)}
                        >
                          {/* Fake waveform bars */}
                          <div className="absolute inset-0 flex items-end gap-px px-1 py-1">
                            {Array.from({ length: 80 }, (_, j) => {
                              const h = 15 + Math.sin(j * 0.3 + beat.id) * 25 + Math.cos(j * 0.7) * 20 + Math.random() * 5;
                              const filled = pct > (j / 80) * 100;
                              return <div key={j} className="flex-1 rounded-sm transition-colors duration-100" style={{ height: h + "%", background: filled ? "rgba(196,151,103,0.5)" : "rgba(196,151,103,0.08)" }} />;
                            })}
                          </div>
                          {/* Time */}
                          {(isPlaying || prog > 0) && <div className="absolute bottom-1 left-2 font-mono text-[10px] text-cs-gold-dim">{fmtTime(prog)}</div>}
                          {dur > 0 && <div className="absolute bottom-1 right-2 font-mono text-[10px] text-cs-dim">{fmtTime(dur)}</div>}
                          {!beat.audio_url && <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-cs-dim">Audio wkrotce</div>}
                        </div>

                        {/* Buy button */}
                        <div className="mt-4 flex justify-end">
                          <button className="font-mono text-[11px] px-6 py-2.5 rounded-sm transition-all cursor-pointer" style={{ background: "rgba(196,151,103,0.08)", border: "1px solid rgba(196,151,103,0.25)", color: "#C49767" }}>
                            Kup beat — {beat.price} zl
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealDiv>
            );
          })}
        </div>

        {/* Info */}
        {!loading && beats.length > 0 && (
          <div className="mt-12 text-center">
            <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2">PLATNOSC</div>
            <div className="font-body text-sm text-cs-muted">Platnosc online przez PayU (BLIK, karta, przelew)</div>
            <div className="font-mono text-[10px] text-cs-dim mt-4">Po zakupie otrzymasz pliki WAV + MP3 + stems na email</div>
          </div>
        )}
      </Sect>
    </div>
  );
}
