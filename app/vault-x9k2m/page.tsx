"use client";
import { useState, useEffect } from "react";
import { GlowBtn } from "@/components/ui";
import { useBookings } from "@/lib/store";
import { SESSION_TYPES } from "@/lib/data";


function makeGCalUrl(b: any) {
  const d = (b.date || "").replace(/-/g, "");
  const sh = String(b.hour).padStart(2, "0");
  const eh = String(b.hour + b.duration).padStart(2, "0");
  const start = d + "T" + sh + "0000";
  const end = d + "T" + eh + "0000";
  const typeName = SESSION_TYPES.find((s: any) => s.id === b.type)?.name || b.type;
  const title = encodeURIComponent("Caseout Studio - " + typeName);
  const details = encodeURIComponent("Klient: " + b.name + "\nEmail: " + b.email + "\nTelefon: " + b.phone + (b.notes ? "\nUwagi: " + b.notes : ""));
  const location = encodeURIComponent("Caseout Studio, ul. Kopernika 30, Warszawa");
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + title + "&dates=" + start + "/" + end + "&details=" + details + "&location=" + location + "&ctz=Europe/Warsaw";
}

const DEFAULT_HOURS: Record<string, [string, string] | null> = {
  "Poniedzialek": ["10:00", "22:00"],
  "Wtorek": ["10:00", "22:00"],
  "Sroda": ["10:00", "22:00"],
  "Czwartek": ["10:00", "22:00"],
  "Piatek": ["10:00", "22:00"],
  "Sobota": ["12:00", "20:00"],
  "Niedziela": null,
};

export default function AdminPage(){
  const{bookings,loading,removeBooking,refresh}=useBookings();
  const[auth,setAuth]=useState(false);
  const[pw,setPw]=useState("");
  const[pwErr,setPwErr]=useState(false);
  const[tab,setTab]=useState("dash");
  
  
  const[sortField,setSortField]=useState<"date"|"name"|"type">("date");
  const[sortDir,setSortDir]=useState<"asc"|"desc">("asc");
  const[hours,setHours]=useState<Record<string,[string,string]|null>>(DEFAULT_HOURS);
  const[hoursEditing,setHoursEditing]=useState(false);
  const[hoursSaved,setHoursSaved]=useState(false);
  const[viewMode,setViewMode]=useState<"list"|"timeline">("list");

  

  if(!auth) return(
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="bg-cs-card border border-cs-line p-10 md:p-14 w-full max-w-[420px] text-center rounded-sm">
        <div className="w-3 h-3 bg-cs-gold rounded-full mx-auto mb-6" style={{boxShadow:"0 0 20px rgba(196,151,103,0.3)",animation:"pulseSlow 3s ease infinite"}}/>
        <h2 className="font-display text-2xl md:text-3xl text-cs-white uppercase tracking-[0.1em] mb-2">Vault Access</h2>
        <p className="font-mono text-[11px] text-cs-dim mb-8">RESTRICTED AREA</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){pw==="caseout2025"?setAuth(true):setPwErr(true);}}} placeholder="password" className="w-full p-4 bg-cs-deep text-cs-text font-mono text-base text-center outline-none mb-5 rounded-sm" style={{border:"1px solid "+(pwErr?"#8B3030":"#1A1F2B")}}/>
        {pwErr&&<div className="font-mono text-[11px] text-cs-red mb-4" style={{animation:"flickerIn 0.5s ease"}}>ACCESS DENIED</div>}
        <GlowBtn onClick={()=>pw==="caseout2025"?setAuth(true):setPwErr(true)} className="w-full">Enter</GlowBtn>
      </div>
    </div>
  );

  const today=new Date().toISOString().slice(0,10);
  const mp=new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0");
  const upcoming=bookings.filter(b=>b.date>=today&&b.status==="confirmed").sort((a,b)=>a.date.localeCompare(b.date)||a.hour-b.hour);
  const past=bookings.filter(b=>b.date<today).sort((a,b)=>b.date.localeCompare(a.date)||b.hour-a.hour);

  const sorted=[...bookings].sort((a,b)=>{
    let cmp=0;
    if(sortField==="date") cmp=a.date.localeCompare(b.date)||a.hour-b.hour;
    else if(sortField==="name") cmp=a.name.localeCompare(b.name);
    else if(sortField==="type") cmp=a.type.localeCompare(b.type);
    return sortDir==="asc"?cmp:-cmp;
  });

  const toggleSort=(field:"date"|"name"|"type")=>{
    if(sortField===field) setSortDir(d=>d==="asc"?"desc":"asc");
    else{setSortField(field);setSortDir("asc");}
  };
  const sortIcon=(field:string)=>sortField===field?(sortDir==="asc"?" ^":" v"):"";

  const del=async(id:number)=>{if(!window.confirm("Usunac te rezerwacje?"))return;await removeBooking(id);};
  const tabs=[["dash","Dashboard"],["book","Rezerwacje"],["set","Ustawienia"]] as const;
  

  // Group bookings by date for timeline
  const groupByDate=(list: typeof bookings)=>{
    const map: Record<string, typeof bookings> = {};
    list.forEach(b=>{if(!map[b.date]) map[b.date]=[];map[b.date].push(b);});
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b));
  };

  const dayName=(ds:string)=>{
    const d=new Date(ds);
    return ["Nd","Pn","Wt","Sr","Cz","Pt","Sb"][d.getDay()];
  };

  const isToday=(ds:string)=>ds===today;
  const isPast=(ds:string)=>ds<today;

  const saveHours=()=>{
    setHoursEditing(false);
    setHoursSaved(true);
    setTimeout(()=>setHoursSaved(false),2000);
  };

  const updateHour=(day:string,idx:0|1,val:string)=>{
    const h={...hours};
    if(h[day]){
      const arr:[string,string]=[...h[day]!];
      arr[idx]=val;
      h[day]=arr;
    }
    setHours(h);
  };

  const toggleDayClosed=(day:string)=>{
    const h={...hours};
    if(h[day]===null) h[day]=["10:00","22:00"];
    else h[day]=null;
    setHours(h);
  };

  const BookingCard=({b,showDate=true,compact=false}:{b:typeof bookings[0];showDate?:boolean;compact?:boolean})=>{
    const st=SESSION_TYPES.find(s=>s.id===b.type);
    const isPastBooking=b.date<today;
    return(
      <div className="bg-cs-card border border-cs-line rounded-sm overflow-hidden transition-all duration-300 hover:border-[rgba(144,113,79,0.15)]" style={{opacity:isPastBooking?0.6:1}}>
        {/* Color bar top */}
        <div className="h-1" style={{background:isPastBooking?"#403830":b.status==="confirmed"?"#C49767":"#8B3030"}}/>
        <div className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            {/* Left: client info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{st?.icon||"🎵"}</span>
                <span className="font-display text-base md:text-lg text-cs-white font-semibold truncate">{b.name}</span>
                {isToday(b.date)&&<span className="font-mono text-[9px] bg-cs-gold text-cs-deep px-2 py-0.5 rounded-sm font-bold tracking-wider">DZISIAJ</span>}
              </div>
              <div className="font-mono text-[11px] text-cs-dim space-y-0.5">
                <div>{b.email}</div>
                <div>{b.phone}</div>
              </div>
              {b.notes&&<div className="font-body text-sm text-cs-muted mt-2 italic border-l-2 border-cs-line pl-3">{b.notes}</div>}
            </div>
            {/* Right: time + actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {showDate&&<div className="font-mono text-[11px] text-cs-dim">{dayName(b.date)} {b.date}</div>}
              <div className="font-display text-xl md:text-2xl text-cs-gold leading-none">{b.hour}:00 - {b.hour+b.duration}:00</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm" style={{background:"rgba(196,151,103,0.08)",border:"1px solid rgba(196,151,103,0.15)",color:"#C49767"}}>{st?.name||b.type}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm" style={{background:"rgba(196,151,103,0.05)",color:"#90714F"}}>{b.duration}h</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <a href={makeGCalUrl(b)} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-cs-gold-dim hover:text-cs-gold transition-colors px-2 py-1 rounded-sm border border-cs-line hover:border-cs-gold-dim">+ Google Cal</a>
                <button onClick={()=>del(b.id)} className="font-mono text-[10px] text-cs-red px-2 py-1 cursor-pointer rounded-sm hover:bg-[rgba(139,48,48,0.12)] transition-colors" style={{border:"1px solid rgba(139,48,48,0.15)"}}>Usun</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return(
    <div className="min-h-screen p-5 md:p-10"><div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3"><div className="w-2 h-2 bg-cs-gold rounded-full"/><span className="font-mono text-xs md:text-sm text-cs-gold-dim tracking-[0.15em]">CASEOUT ADMIN</span></div>
        <div className="flex gap-2">
          <button onClick={()=>refresh()} className="bg-transparent border border-cs-line text-cs-dim px-4 py-2 cursor-pointer font-mono text-[11px] hover:text-cs-gold hover:border-cs-gold-dim transition-colors rounded-sm">REFRESH</button>
          <button onClick={()=>setAuth(false)} className="bg-transparent border border-cs-line text-cs-dim px-4 py-2 cursor-pointer font-mono text-[11px] hover:text-cs-gold hover:border-cs-gold-dim transition-colors rounded-sm">LOGOUT</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1">{tabs.map(([id,l])=><button key={id} onClick={()=>setTab(id)} className="font-mono text-[11px] md:text-xs tracking-[0.1em] px-5 py-3 cursor-pointer transition-all rounded-sm whitespace-nowrap" style={{background:tab===id?"#0E1319":"transparent",border:"1px solid "+(tab===id?"#1A1F2B":"transparent"),color:tab===id?"#C49767":"#403830"}}>
        {l}
      </button>)}</div>

      {loading&&<div className="text-center py-20"><div className="font-mono text-xs text-cs-dim tracking-wider">LOADING...</div></div>}

      {/* ═══ DASHBOARD ═══ */}
      {!loading&&tab==="dash"&&<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">{[
          {l:"TOTAL",v:bookings.length,c:"#C49767"},
          {l:"NADCHODZACE",v:upcoming.length,c:"#3B6B3B"},
          {l:"DZISIAJ",v:bookings.filter(b=>b.date===today).length,c:"#D4A87A"},
          {l:"TEN MIESIAC",v:bookings.filter(b=>b.date?.startsWith(mp)).length,c:"#90714F"},
        ].map((s,i)=><div key={i} className="bg-cs-card border border-cs-line p-5 md:p-7 rounded-sm">
          <div className="font-mono text-[10px] md:text-[11px] text-cs-dim tracking-[0.15em] mb-3">{s.l}</div>
          <div className="font-display text-4xl md:text-5xl" style={{color:s.c}}>{s.v}</div>
        </div>)}</div>

        {/* Today's sessions */}
        {bookings.filter(b=>b.date===today).length>0&&<>
          <div className="font-mono text-[11px] text-cs-gold tracking-[0.2em] mb-4">DZISIEJSZE SESJE</div>
          <div className="space-y-3 mb-10">{bookings.filter(b=>b.date===today).sort((a,b)=>a.hour-b.hour).map(b=><BookingCard key={b.id} b={b} showDate={false}/>)}</div>
        </>}

        {/* Upcoming */}
        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4">NADCHODZACE SESJE</div>
        {upcoming.filter(b=>b.date!==today).length===0&&<div className="font-body text-base text-cs-dim bg-cs-card border border-cs-line p-8 text-center rounded-sm">Brak nadchodzacych sesji</div>}
        <div className="space-y-3">{groupByDate(upcoming.filter(b=>b.date!==today)).map(([date,items])=>(
          <div key={date}>
            <div className="font-mono text-[11px] text-cs-dim mb-2 flex items-center gap-2">
              <span className="text-cs-gold-dim">{dayName(date)}</span>
              <span>{date}</span>
              <span className="text-cs-dim">({items.length} {items.length===1?"sesja":"sesji"})</span>
            </div>
            <div className="space-y-2 ml-0 md:ml-4">{items.sort((a,b)=>a.hour-b.hour).map(b=><BookingCard key={b.id} b={b} showDate={false}/>)}</div>
          </div>
        ))}</div>
      </>}

      {/* ═══ ALL BOOKINGS ═══ */}
      {!loading&&tab==="book"&&<>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em]">WSZYSTKIE REZERWACJE ({bookings.length})</div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {(["date","name","type"] as const).map(f=><button key={f} onClick={()=>toggleSort(f)} className="font-mono text-[10px] px-3 py-1.5 rounded-sm cursor-pointer transition-colors" style={{background:sortField===f?"rgba(196,151,103,0.08)":"transparent",border:"1px solid "+(sortField===f?"rgba(196,151,103,0.2)":"#1A1F2B"),color:sortField===f?"#C49767":"#706860"}}>{f.toUpperCase()}{sortIcon(f)}</button>)}
            </div>
            <div className="flex gap-1">
              {(["list","timeline"] as const).map(m=><button key={m} onClick={()=>setViewMode(m)} className="font-mono text-[10px] px-3 py-1.5 rounded-sm cursor-pointer transition-colors" style={{background:viewMode===m?"rgba(196,151,103,0.08)":"transparent",border:"1px solid "+(viewMode===m?"rgba(196,151,103,0.2)":"#1A1F2B"),color:viewMode===m?"#C49767":"#706860"}}>{m==="list"?"LISTA":"TIMELINE"}</button>)}
            </div>
          </div>
        </div>

        {viewMode==="list"&&<div className="space-y-3">{sorted.map(b=><BookingCard key={b.id} b={b}/>)}</div>}

        {viewMode==="timeline"&&<div className="space-y-6">{groupByDate(sorted).map(([date,items])=>(
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="font-mono text-xs text-cs-gold-dim font-bold">{dayName(date)}</div>
              <div className="font-display text-lg text-cs-white">{date}</div>
              {isToday(date)&&<span className="font-mono text-[9px] bg-cs-gold text-cs-deep px-2 py-0.5 rounded-sm font-bold">DZISIAJ</span>}
              {isPast(date)&&<span className="font-mono text-[9px] text-cs-dim border border-cs-line px-2 py-0.5 rounded-sm">PRZESZLA</span>}
              <div className="flex-1 h-px bg-cs-line"/>
            </div>
            {/* Hour ruler */}
            <div className="ml-0 md:ml-4 space-y-1">{items.sort((a,b)=>a.hour-b.hour).map(b=>{
              const st=SESSION_TYPES.find(s=>s.id===b.type);
              const widthPct=Math.min(b.duration*8.33,100);
              const leftPct=(b.hour-8)*8.33;
              return <div key={b.id} className="flex items-center gap-3">
                <div className="font-mono text-sm text-cs-gold w-[100px] md:w-[130px] flex-shrink-0">{b.hour}:00 - {b.hour+b.duration}:00</div>
                <div className="flex-1 bg-cs-deep rounded-sm p-3 border border-cs-line flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <span className="font-body text-base text-cs-text font-semibold">{b.name}</span>
                    <span className="font-mono text-[10px] text-cs-dim ml-2">{st?.icon} {st?.name} | {b.duration}h</span>
                    <div className="font-mono text-[10px] text-cs-dim mt-0.5">{b.email} | {b.phone}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={makeGCalUrl(b)} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-cs-gold-dim hover:text-cs-gold transition-colors px-2 py-1 rounded-sm border border-cs-line hover:border-cs-gold-dim">+ GCal</a>
                    <button onClick={()=>del(b.id)} className="font-mono text-[10px] text-cs-red px-2 py-1 cursor-pointer rounded-sm" style={{border:"1px solid rgba(139,48,48,0.15)"}}>Usun</button>
                  </div>
                </div>
              </div>;
            })}</div>
          </div>
        ))}</div>}
      </>}

      {/* ═══ SETTINGS ═══ */}
      {tab==="set"&&<>
        <div className="flex justify-between items-center mb-4">
          <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em]">GODZINY PRACY</div>
          {!hoursEditing?<button onClick={()=>setHoursEditing(true)} className="font-mono text-[10px] text-cs-gold-dim hover:text-cs-gold cursor-pointer bg-transparent border border-cs-line px-3 py-1.5 rounded-sm transition-colors">EDYTUJ</button>
          :<div className="flex gap-2">
            <button onClick={saveHours} className="font-mono text-[10px] text-cs-green cursor-pointer bg-transparent border border-[rgba(59,107,59,0.3)] px-3 py-1.5 rounded-sm transition-colors hover:border-cs-green">ZAPISZ</button>
            <button onClick={()=>{setHoursEditing(false);setHours(DEFAULT_HOURS);}} className="font-mono text-[10px] text-cs-dim cursor-pointer bg-transparent border border-cs-line px-3 py-1.5 rounded-sm transition-colors">ANULUJ</button>
          </div>}
        </div>
        {hoursSaved&&<div className="font-mono text-xs text-cs-green mb-4 p-2 rounded-sm" style={{background:"rgba(59,107,59,0.06)",border:"1px solid rgba(59,107,59,0.15)"}}>Zapisano zmiany</div>}
        <div className="bg-cs-card border border-cs-line rounded-sm overflow-hidden">
          {Object.entries(hours).map(([day, h], i) => (
            <div key={day} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-5 md:px-8 border-b border-cs-line last:border-0 gap-2">
              <span className="font-body text-base md:text-lg text-cs-text min-w-[140px]">{day}</span>
              {hoursEditing ? (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={h!==null} onChange={()=>toggleDayClosed(day)} className="accent-[#C49767]"/>
                    <span className="font-mono text-[11px] text-cs-dim">{h!==null?"Otwarte":"Zamkniete"}</span>
                  </label>
                  {h!==null&&<>
                    <input type="time" value={h[0]} onChange={e=>updateHour(day,0,e.target.value)} className="bg-cs-deep border border-cs-line text-cs-text font-mono text-sm p-1.5 rounded-sm outline-none" style={{colorScheme:"dark"}}/>
                    <span className="text-cs-dim">-</span>
                    <input type="time" value={h[1]} onChange={e=>updateHour(day,1,e.target.value)} className="bg-cs-deep border border-cs-line text-cs-text font-mono text-sm p-1.5 rounded-sm outline-none" style={{colorScheme:"dark"}}/>
                  </>}
                </div>
              ) : (
                <span className="font-mono text-sm md:text-base" style={{color:h===null?"#8B3030":"#706860"}}>
                  {h===null?"ZAMKNIETE":h[0]+" - "+h[1]}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4 mt-10">INFORMACJE</div>
        <div className="bg-cs-card border border-cs-line p-5 md:p-8 rounded-sm space-y-3">
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Wersja</span><span className="font-mono text-sm text-cs-gold">1.0.0</span></div>
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Baza danych</span><span className="font-mono text-sm text-cs-green">Supabase | Postgres</span></div>
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Hosting</span><span className="font-mono text-sm text-cs-text">Vercel</span></div>
        </div>
      </>}
    </div></div>
  );
}
