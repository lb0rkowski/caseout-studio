"use client";
import { useState, useEffect } from "react";
import { GlowBtn } from "@/components/ui";
import { useBookings } from "@/lib/store";
import { SESSION_TYPES } from "@/lib/data";

interface Msg { id:number; created_at:string; name:string; email:string; message:string; is_read:number; }

export default function AdminPage() {
  const { bookings, loading, removeBooking, refresh } = useBookings();
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState("dash");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [ml, setMl] = useState(false);

  useEffect(() => { if(auth&&tab==="msg"){setMl(true);fetch("/api/messages").then(r=>r.json()).then(d=>setMsgs(Array.isArray(d)?d:[])).catch(()=>{}).finally(()=>setMl(false));} }, [auth, tab]);

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-cs-card border border-cs-line p-12 w-full max-w-[380px] text-center">
        <div className="w-2.5 h-2.5 bg-cs-gold rounded-full mx-auto mb-5" style={{boxShadow:"0 0 20px rgba(196,151,103,0.25)",animation:"pulseSlow 3s ease infinite"}} />
        <h2 className="font-display text-xl text-cs-white uppercase tracking-[0.1em] mb-1.5">Vault Access</h2>
        <p className="font-mono text-[10px] text-cs-dim mb-6">RESTRICTED AREA</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){pw==="caseout2025"?setAuth(true):setErr(true);}}} placeholder="••••••••" className="w-full p-3.5 bg-cs-deep text-cs-text font-mono text-[13px] text-center outline-none mb-4" style={{border:`1px solid ${err?"#8B3030":"#1A1F2B"}`}} />
        {err && <div className="font-mono text-[10px] text-cs-red mb-3" style={{animation:"flickerIn 0.5s ease"}}>ACCESS DENIED</div>}
        <GlowBtn onClick={()=>pw==="caseout2025"?setAuth(true):setErr(true)} className="w-full">Enter</GlowBtn>
        <p className="font-mono text-[9px] text-cs-dim mt-4">DEMO: caseout2025</p>
      </div>
    </div>
  );

  const today=new Date().toISOString().slice(0,10);
  const mp=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
  const upcoming=bookings.filter(b=>b.date>=today&&b.status==="confirmed").sort((a,b)=>a.date.localeCompare(b.date)||a.hour-b.hour);
  const del=async(id:number)=>{if(!confirm("Usunąć?"))return;await removeBooking(id);};
  const tabs=[["dash","Dashboard"],["book","Rezerwacje"],["msg","Wiadomości"],["set","Ustawienia"]] as const;
  const unread=msgs.filter(m=>!m.is_read).length;

  return (
    <div className="min-h-screen p-8"><div className="max-w-[1100px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 bg-cs-gold rounded-full" /><span className="font-mono text-[11px] text-cs-gold-dim tracking-[0.15em]">CASEOUT ADMIN</span></div>
        <div className="flex gap-2">
          <button onClick={()=>refresh()} className="bg-transparent border border-cs-line text-cs-dim px-3.5 py-1.5 cursor-pointer font-mono text-[10px] hover:text-cs-gold transition-colors">↻ REFRESH</button>
          <button onClick={()=>setAuth(false)} className="bg-transparent border border-cs-line text-cs-dim px-3.5 py-1.5 cursor-pointer font-mono text-[10px] hover:text-cs-gold transition-colors">LOGOUT</button>
        </div>
      </div>

      <div className="flex gap-1 mb-7">{tabs.map(([id,l])=><button key={id} onClick={()=>setTab(id)} className="font-mono text-[10px] tracking-[0.1em] px-4 py-2.5 cursor-pointer transition-all" style={{background:tab===id?"#0E1319":"transparent",border:`1px solid ${tab===id?"#1A1F2B":"transparent"}`,color:tab===id?"#C49767":"#403830"}}>{l}{id==="msg"&&unread>0&&<span className="ml-1.5 bg-cs-gold text-cs-deep text-[8px] px-1 py-0.5 rounded-sm font-bold">{unread}</span>}</button>)}</div>

      {loading&&<div className="text-center py-16"><div className="font-mono text-[10px] text-cs-dim tracking-wider">LOADING...</div></div>}

      {!loading&&tab==="dash"&&<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">{[{l:"TOTAL",v:bookings.length},{l:"UPCOMING",v:upcoming.length},{l:"TODAY",v:bookings.filter(b=>b.date===today).length},{l:"THIS MONTH",v:bookings.filter(b=>b.date?.startsWith(mp)).length}].map((s,i)=><div key={i} className="bg-cs-card border border-cs-line p-5"><div className="font-mono text-[9px] text-cs-dim tracking-[0.15em] mb-2">{s.l}</div><div className="font-display text-[32px] text-cs-gold">{s.v}</div></div>)}</div>
        <div className="font-mono text-[10px] text-cs-dim tracking-[0.15em] mb-3">UPCOMING</div>
        {upcoming.length===0&&<div className="font-body text-[13px] text-cs-dim bg-cs-card p-5 text-center">Brak nadchodzących sesji</div>}
        {upcoming.slice(0,8).map(b=><div key={b.id} className="bg-cs-card border border-cs-line p-3.5 mb-1.5 flex justify-between items-center flex-wrap gap-2"><div><div className="font-body text-sm text-cs-text">{b.name}</div><div className="font-mono text-[10px] text-cs-dim">{b.email}</div></div><div className="text-right"><div className="font-display text-[13px] text-cs-gold">{b.date} · {b.hour}:00</div><div className="font-mono text-[10px] text-cs-dim">{SESSION_TYPES.find(s=>s.id===b.type)?.name} · {b.duration}h</div></div></div>)}
      </>}

      {!loading&&tab==="book"&&<>
        <div className="font-mono text-[10px] text-cs-dim tracking-[0.15em] mb-3">ALL ({bookings.length})</div>
        {bookings.map(b=><div key={b.id} className="bg-cs-card border border-cs-line p-3.5 mb-1.5 flex justify-between items-center flex-wrap gap-2">
          <div className="flex-1"><div className="font-body text-sm text-cs-text font-semibold">{b.name}</div><div className="font-mono text-[10px] text-cs-dim">{b.email} · {b.phone}</div>{b.notes&&<div className="font-body text-[11px] text-cs-dim mt-0.5 italic">→ {b.notes}</div>}</div>
          <div className="text-right"><div className="font-display text-[13px] text-cs-gold">{b.date} · {b.hour}:00–{b.hour+b.duration}:00</div><div className="font-mono text-[10px] text-cs-dim">{SESSION_TYPES.find(s=>s.id===b.type)?.name} · <span className="text-cs-green">{b.status}</span></div></div>
          <button onClick={()=>del(b.id)} className="font-mono text-[9px] text-cs-red px-2.5 py-1.5 cursor-pointer" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.12)"}}>DEL</button>
        </div>)}
      </>}

      {tab==="msg"&&<>
        <div className="font-mono text-[10px] text-cs-dim tracking-[0.15em] mb-3">WIADOMOŚCI ({msgs.length})</div>
        {ml&&<div className="font-mono text-[10px] text-cs-dim py-8 text-center">Loading...</div>}
        {!ml&&msgs.length===0&&<div className="font-body text-[13px] text-cs-dim bg-cs-card p-5 text-center">Brak wiadomości</div>}
        {msgs.map(m=><div key={m.id} className="bg-cs-card border border-cs-line p-4 mb-1.5" style={{borderLeftColor:m.is_read?"#1A1F2B":"#C49767",borderLeftWidth:2}}>
          <div className="flex justify-between items-start mb-2"><div><span className="font-body text-sm text-cs-text font-semibold">{m.name}</span><span className="font-mono text-[10px] text-cs-dim ml-2">{m.email}</span></div><span className="font-mono text-[9px] text-cs-dim">{new Date(m.created_at).toLocaleDateString("pl")}</span></div>
          <p className="font-body text-[13px] text-cs-muted leading-relaxed">{m.message}</p>
        </div>)}
      </>}

      {tab==="set"&&<><div className="font-mono text-[10px] text-cs-dim tracking-[0.15em] mb-3">HOURS</div><div className="bg-cs-card border border-cs-line p-5">{["Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota","Niedziela"].map((d,i)=><div key={d} className="flex justify-between py-2.5 border-b border-cs-line"><span className="font-body text-[13px] text-cs-text">{d}</span><span className="font-mono text-xs" style={{color:i===6?"#8B3030":"#706860"}}>{i===6?"CLOSED":i===5?"12:00–20:00":"10:00–22:00"}</span></div>)}</div></>}
    </div></div>
  );
}
