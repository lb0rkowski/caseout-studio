"use client";
import { useState, useEffect } from "react";
import { GlowBtn } from "@/components/ui";
import { useBookings } from "@/lib/store";
import { SESSION_TYPES } from "@/lib/data";

interface Msg { id:number; created_at:string; name:string; email:string; message:string; is_read:number; }

export default function AdminPage(){
  const{bookings,loading,removeBooking,refresh}=useBookings();
  const[auth,setAuth]=useState(false);
  const[pw,setPw]=useState("");
  const[err,setErr]=useState(false);
  const[tab,setTab]=useState("dash");
  const[msgs,setMsgs]=useState<Msg[]>([]);
  const[ml,setMl]=useState(false);

  useEffect(()=>{if(auth&&tab==="msg"){setMl(true);fetch("/api/messages").then(r=>r.json()).then(d=>setMsgs(Array.isArray(d)?d:[])).catch(()=>{}).finally(()=>setMl(false));}},[auth,tab]);

  if(!auth) return(
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="bg-cs-card border border-cs-line p-10 md:p-14 w-full max-w-[420px] text-center rounded-sm">
        <div className="w-3 h-3 bg-cs-gold rounded-full mx-auto mb-6" style={{boxShadow:"0 0 20px rgba(196,151,103,0.3)",animation:"pulseSlow 3s ease infinite"}}/>
        <h2 className="font-display text-2xl md:text-3xl text-cs-white uppercase tracking-[0.1em] mb-2">Vault Access</h2>
        <p className="font-mono text-[11px] text-cs-dim mb-8">RESTRICTED AREA</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){pw==="caseout2025"?setAuth(true):setErr(true);}}} placeholder="••••••••" className="w-full p-4 bg-cs-deep text-cs-text font-mono text-base text-center outline-none mb-5 rounded-sm" style={{border:`1px solid ${err?"#8B3030":"#1A1F2B"}`}}/>
        {err&&<div className="font-mono text-[11px] text-cs-red mb-4" style={{animation:"flickerIn 0.5s ease"}}>ACCESS DENIED</div>}
        <GlowBtn onClick={()=>pw==="caseout2025"?setAuth(true):setErr(true)} className="w-full">Enter</GlowBtn>
        <p className="font-mono text-[10px] text-cs-dim mt-5">DEMO: caseout2025</p>
      </div>
    </div>
  );

  const today=new Date().toISOString().slice(0,10);
  const mp=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
  const upcoming=bookings.filter(b=>b.date>=today&&b.status==="confirmed").sort((a,b)=>a.date.localeCompare(b.date)||a.hour-b.hour);
  const del=async(id:number)=>{if(!confirm("Usunąć tę rezerwację?"))return;await removeBooking(id);};
  const tabs=[["dash","Dashboard"],["book","Rezerwacje"],["msg","Wiadomości"],["set","Ustawienia"]] as const;
  const unread=msgs.filter(m=>!m.is_read).length;

  return(
    <div className="min-h-screen p-5 md:p-10"><div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3"><div className="w-2 h-2 bg-cs-gold rounded-full"/><span className="font-mono text-xs md:text-sm text-cs-gold-dim tracking-[0.15em]">CASEOUT ADMIN</span></div>
        <div className="flex gap-2">
          <button onClick={()=>refresh()} className="bg-transparent border border-cs-line text-cs-dim px-4 py-2 cursor-pointer font-mono text-[11px] hover:text-cs-gold hover:border-cs-gold-dim transition-colors rounded-sm">↻ REFRESH</button>
          <button onClick={()=>setAuth(false)} className="bg-transparent border border-cs-line text-cs-dim px-4 py-2 cursor-pointer font-mono text-[11px] hover:text-cs-gold hover:border-cs-gold-dim transition-colors rounded-sm">LOGOUT</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1">{tabs.map(([id,l])=><button key={id} onClick={()=>setTab(id)} className="font-mono text-[11px] md:text-xs tracking-[0.1em] px-5 py-3 cursor-pointer transition-all rounded-sm whitespace-nowrap" style={{background:tab===id?"#0E1319":"transparent",border:`1px solid ${tab===id?"#1A1F2B":"transparent"}`,color:tab===id?"#C49767":"#403830"}}>
        {l}{id==="msg"&&unread>0&&<span className="ml-2 bg-cs-gold text-cs-deep text-[9px] px-1.5 py-0.5 rounded-sm font-bold">{unread}</span>}
      </button>)}</div>

      {loading&&<div className="text-center py-20"><div className="font-mono text-xs text-cs-dim tracking-wider">LOADING...</div></div>}

      {/* DASHBOARD */}
      {!loading&&tab==="dash"&&<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">{[
          {l:"TOTAL",v:bookings.length,icon:"📊"},
          {l:"UPCOMING",v:upcoming.length,icon:"📅"},
          {l:"TODAY",v:bookings.filter(b=>b.date===today).length,icon:"🎙"},
          {l:"THIS MONTH",v:bookings.filter(b=>b.date?.startsWith(mp)).length,icon:"📈"},
        ].map((s,i)=><div key={i} className="bg-cs-card border border-cs-line p-5 md:p-7 rounded-sm">
          <div className="flex justify-between items-start"><div className="font-mono text-[10px] md:text-[11px] text-cs-dim tracking-[0.15em]">{s.l}</div><span className="text-lg">{s.icon}</span></div>
          <div className="font-display text-4xl md:text-5xl text-cs-gold mt-2">{s.v}</div>
        </div>)}</div>

        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4">NADCHODZĄCE SESJE</div>
        {upcoming.length===0&&<div className="font-body text-base text-cs-dim bg-cs-card border border-cs-line p-8 text-center rounded-sm">Brak nadchodzących sesji</div>}
        <div className="space-y-2">{upcoming.slice(0,10).map(b=><div key={b.id} className="bg-cs-card border border-cs-line p-4 md:p-5 rounded-sm flex flex-col sm:flex-row justify-between gap-3">
          <div><div className="font-body text-base md:text-lg text-cs-text font-medium">{b.name}</div><div className="font-mono text-[11px] text-cs-dim mt-0.5">{b.email} · {b.phone}</div>{b.notes&&<div className="font-body text-sm text-cs-dim mt-1 italic">→ {b.notes}</div>}</div>
          <div className="sm:text-right flex-shrink-0"><div className="font-display text-base md:text-lg text-cs-gold">{b.date} · {b.hour}:00–{b.hour+b.duration}:00</div><div className="font-mono text-[11px] text-cs-dim mt-0.5">{SESSION_TYPES.find(s=>s.id===b.type)?.icon} {SESSION_TYPES.find(s=>s.id===b.type)?.name} · {b.duration}h</div></div>
        </div>)}</div>
      </>}

      {/* ALL BOOKINGS */}
      {!loading&&tab==="book"&&<>
        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4">WSZYSTKIE REZERWACJE ({bookings.length})</div>
        <div className="space-y-2">{bookings.map(b=><div key={b.id} className="bg-cs-card border border-cs-line p-4 md:p-5 rounded-sm flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex-1"><div className="font-body text-base text-cs-text font-semibold">{b.name}</div><div className="font-mono text-[11px] text-cs-dim mt-0.5">{b.email} · {b.phone}</div>{b.notes&&<div className="font-body text-sm text-cs-dim mt-1 italic">→ {b.notes}</div>}</div>
          <div className="flex items-center gap-4">
            <div className="sm:text-right"><div className="font-display text-base text-cs-gold">{b.date} · {b.hour}:00–{b.hour+b.duration}:00</div><div className="font-mono text-[11px] text-cs-dim">{SESSION_TYPES.find(s=>s.id===b.type)?.name} · <span className="text-cs-green">{b.status}</span></div></div>
            <button onClick={()=>del(b.id)} className="font-mono text-[10px] text-cs-red px-3 py-2 cursor-pointer rounded-sm hover:bg-[rgba(139,48,48,0.12)] transition-colors" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>USUŃ</button>
          </div>
        </div>)}</div>
      </>}

      {/* MESSAGES */}
      {tab==="msg"&&<>
        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4">WIADOMOŚCI ({msgs.length})</div>
        {ml&&<div className="font-mono text-xs text-cs-dim py-12 text-center">Loading...</div>}
        {!ml&&msgs.length===0&&<div className="font-body text-base text-cs-dim bg-cs-card border border-cs-line p-8 text-center rounded-sm">Brak wiadomości</div>}
        <div className="space-y-2">{msgs.map(m=><div key={m.id} className="bg-cs-card border border-cs-line p-5 md:p-6 rounded-sm" style={{borderLeftColor:m.is_read?"#1A1F2B":"#C49767",borderLeftWidth:3}}>
          <div className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
            <div><span className="font-body text-base md:text-lg text-cs-text font-semibold">{m.name}</span><span className="font-mono text-[11px] text-cs-dim ml-3">{m.email}</span></div>
            <span className="font-mono text-[11px] text-cs-dim flex-shrink-0">{new Date(m.created_at).toLocaleDateString("pl")} · {new Date(m.created_at).toLocaleTimeString("pl",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
          <p className="font-body text-base text-cs-muted leading-relaxed">{m.message}</p>
        </div>)}</div>
      </>}

      {/* SETTINGS */}
      {tab==="set"&&<>
        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4">GODZINY PRACY</div>
        <div className="bg-cs-card border border-cs-line p-5 md:p-8 rounded-sm">{["Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota","Niedziela"].map((d,i)=><div key={d} className="flex justify-between py-3 md:py-4 border-b border-cs-line last:border-0"><span className="font-body text-base md:text-lg text-cs-text">{d}</span><span className="font-mono text-sm md:text-base" style={{color:i===6?"#8B3030":"#706860"}}>{i===6?"ZAMKNIĘTE":i===5?"12:00 – 20:00":"10:00 – 22:00"}</span></div>)}</div>

        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4 mt-10">INFORMACJE</div>
        <div className="bg-cs-card border border-cs-line p-5 md:p-8 rounded-sm space-y-3">
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Wersja</span><span className="font-mono text-sm text-cs-gold">1.0.0</span></div>
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Baza danych</span><span className="font-mono text-sm text-cs-green">MySQL · home.pl</span></div>
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Hosting</span><span className="font-mono text-sm text-cs-text">Vercel</span></div>
        </div>
      </>}
    </div></div>
  );
}
