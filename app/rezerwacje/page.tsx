"use client";
import { useState } from "react";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";
import { useBookings } from "@/lib/store";
import { SESSION_TYPES, DURATIONS, Booking } from "@/lib/data";

const MO=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const DN=["Pn","Wt","Śr","Cz","Pt","Sb","Nd"];

export default function RezerwacjePage(){
  const{bookings,loading,addBooking}=useBookings();
  const[cur,setCur]=useState(new Date());
  const[selDate,setSelDate]=useState<string|null>(null);
  const[selSlot,setSelSlot]=useState<number|null>(null);
  const[step,setStep]=useState(0);
  const[form,setForm]=useState({name:"",email:"",phone:"",type:"recording",duration:2,notes:""});
  const[confirm,setConfirm]=useState<Booking|null>(null);
  const[busy,setBusy]=useState(false);
  const[err,setErr]=useState("");

  const yr=cur.getFullYear(),mo=cur.getMonth(),dim=new Date(yr,mo+1,0).getDate(),fd=(new Date(yr,mo,1).getDay()+6)%7;
  const slots=Array.from({length:12},(_,i)=>i+10);
  const isBooked=(d:string,h:number)=>bookings.some(b=>b.date===d&&h>=b.hour&&h<b.hour+b.duration);
  const today=new Date().toISOString().slice(0,10);

  const clickSlot=(day:number,hour:number)=>{
    const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    if(isBooked(ds,hour))return;setSelDate(ds);setSelSlot(hour);setStep(1);setErr("");
  };

  const book=async()=>{
    if(!form.name||!form.email||!form.phone||!selDate||selSlot===null)return;
    setBusy(true);setErr("");
    const r=await addBooking({date:selDate,hour:selSlot,duration:form.duration,type:form.type,name:form.name,email:form.email,phone:form.phone,notes:form.notes,status:"confirmed"});
    setBusy(false);
    if(r){setConfirm(r);setStep(0);setSelDate(null);setSelSlot(null);setForm({name:"",email:"",phone:"",type:"recording",duration:2,notes:""});}
    else setErr("Nie udało się zapisać. Spróbuj ponownie.");
  };

  const inp="w-full p-3.5 md:p-4 bg-cs-deep border border-cs-line rounded-sm text-cs-text font-body text-sm md:text-base outline-none transition-all duration-300";

  return(
    <div className="pt-20 md:pt-28"><Sect>
      <SectionHead title="Rezerwacje" sub="book a session"/>

      {loading&&<div className="text-center py-20"><div className="inline-block w-8 h-8 border-2 border-cs-gold-dim border-t-cs-gold rounded-full" style={{animation:"spin 0.8s linear infinite"}}/><div className="font-mono text-xs text-cs-dim mt-4 tracking-wider">LOADING...</div></div>}

      {confirm&&<RevealDiv><div className="bg-[rgba(59,107,59,0.06)] border border-[rgba(59,107,59,0.2)] rounded-sm p-8 md:p-10 mb-8 text-center">
        <div className="font-display text-2xl md:text-3xl text-cs-green mb-3">✓ Zarezerwowano!</div>
        <div className="font-body text-base md:text-lg text-cs-muted">{SESSION_TYPES.find(s=>s.id===confirm.type)?.name} · {confirm.date} · {confirm.hour}:00 · {confirm.duration}h</div>
        <div className="font-mono text-xs text-cs-dim mt-3">Potwierdzenie → {confirm.email}</div>
        <GlowBtn ghost onClick={()=>setConfirm(null)} className="mt-5">OK</GlowBtn>
      </div></RevealDiv>}

      {!loading&&<>
        {/* Nav */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>setCur(new Date(yr,mo-1))} className="bg-transparent border border-cs-line text-cs-muted px-4 py-2.5 cursor-pointer font-body text-base rounded-sm hover:border-cs-gold-dim transition-colors">◂</button>
            <span className="font-display text-xl md:text-2xl text-cs-white min-w-[200px] md:min-w-[240px] text-center uppercase tracking-wide">{MO[mo]} {yr}</span>
            <button onClick={()=>setCur(new Date(yr,mo+1))} className="bg-transparent border border-cs-line text-cs-muted px-4 py-2.5 cursor-pointer font-body text-base rounded-sm hover:border-cs-gold-dim transition-colors">▸</button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-cs-card border border-cs-line rounded-sm overflow-hidden">
          <div className="grid grid-cols-7">
            {DN.map(d=><div key={d} className="py-3 px-1 text-center font-mono text-[11px] md:text-xs text-cs-dim border-b border-cs-line font-bold">{d}</div>)}
            {Array.from({length:fd}).map((_,i)=><div key={`e${i}`} className="min-h-[70px] md:min-h-[100px] lg:min-h-[110px] border-b border-cs-line border-r border-r-[rgba(26,31,43,0.05)]"/>)}
            {Array.from({length:dim},(_,i)=>{
              const day=i+1,ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const db=bookings.filter(b=>b.date===ds),di=(fd+i)%7,isSun=di===6;
              const isToday=today===ds,past=new Date(ds)<new Date(today);
              return<div key={day} onClick={()=>!isSun&&!past&&setSelDate(ds)} className="min-h-[70px] md:min-h-[100px] lg:min-h-[110px] p-1.5 md:p-2.5 border-b border-cs-line border-r border-r-[rgba(26,31,43,0.05)] transition-colors hover:bg-[rgba(196,151,103,0.015)]" style={{background:selDate===ds?"rgba(196,151,103,0.04)":"transparent",opacity:past?0.3:1,cursor:isSun||past?"default":"pointer"}}>
                <div className="font-body text-sm md:text-base font-semibold w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center mb-1" style={{color:isToday?"#C49767":isSun?"#403830":"#D8D0C6",background:isToday?"rgba(196,151,103,0.1)":"transparent"}}>{day}</div>
                {db.map((b,bi)=><div key={bi} className="font-mono text-[9px] md:text-[10px] text-cs-gold-dim px-1.5 py-0.5 mb-0.5 rounded-sm truncate" style={{background:"rgba(196,151,103,0.07)",borderLeft:"2px solid rgba(196,151,103,0.3)"}}>{b.hour}:00 {SESSION_TYPES.find(s=>s.id===b.type)?.icon}</div>)}
                {isSun&&<span className="font-mono text-[9px] text-cs-dim">OFF</span>}
              </div>;
            })}
          </div>
        </div>

        {/* Slots */}
        {selDate&&step===0&&<RevealDiv className="mt-6"><div className="bg-cs-card border border-cs-line rounded-sm p-6 md:p-8">
          <h3 className="font-display text-lg md:text-xl text-cs-white uppercase mb-4"><span className="font-mono text-[11px] text-cs-gold-dim mr-3">DOSTĘPNE →</span>{selDate}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">{slots.map(h=>{const bk=isBooked(selDate,h);return<button key={h} onClick={()=>!bk&&clickSlot(parseInt(selDate.split("-")[2]),h)} disabled={bk} className="font-mono text-sm md:text-base transition-all py-3 rounded-sm" style={{background:bk?"rgba(139,48,48,0.05)":"#050810",border:`1px solid ${bk?"rgba(139,48,48,0.15)":"#1A1F2B"}`,color:bk?"#8B3030":"#D8D0C6",opacity:bk?0.4:1,cursor:bk?"not-allowed":"pointer"}}>{h}:00</button>;})}</div>
        </div></RevealDiv>}

        {/* Form */}
        {step===1&&<RevealDiv className="mt-6"><div className="bg-cs-card border border-[rgba(144,113,79,0.15)] rounded-sm p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px" style={{background:"linear-gradient(90deg, transparent, rgba(196,151,103,0.3), transparent)"}}/>
          <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-2">// NOWA REZERWACJA</div>
          <h3 className="font-display text-2xl md:text-3xl text-cs-white uppercase mb-2">Rezerwacja Sesji</h3>
          <div className="font-body text-base md:text-lg text-cs-muted mb-8">{selDate} · {selSlot}:00</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">TYP SESJI</label><select className={`${inp} cursor-pointer`} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{SESSION_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}</select></div>
            <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">CZAS TRWANIA</label><select className={`${inp} cursor-pointer`} value={form.duration} onChange={e=>setForm({...form,duration:parseInt(e.target.value)})}>{DURATIONS.map(d=><option key={d.hours} value={d.hours}>{d.label}</option>)}</select></div>
            <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">IMIĘ *</label><input className={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="—"/></div>
            <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">EMAIL *</label><input className={inp} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="—"/></div>
            <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">TELEFON *</label><input className={inp} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="—"/></div>
            <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">UWAGI</label><input className={inp} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="opcjonalnie"/></div>
          </div>
          {err&&<div className="font-mono text-xs text-cs-red mt-4">{err}</div>}
          <div className="flex gap-4 mt-8"><GlowBtn onClick={book} disabled={busy}>{busy?"Wysyłanie...":"Potwierdź Rezerwację"}</GlowBtn><GlowBtn ghost onClick={()=>{setStep(0);setSelSlot(null);}}>Anuluj</GlowBtn></div>
        </div></RevealDiv>}
      </>}
    </Sect></div>
  );
}
