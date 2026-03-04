"use client";
import { useState, useEffect } from "react";
import { GlowBtn } from "@/components/ui";
import { useBookings } from "@/lib/store";
import { SESSION_TYPES, PACKAGES, SERVICES, HOURLY_RATE, WEEKEND_SURCHARGE } from "@/lib/data";

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
  "Poniedzialek": ["10:00", "22:00"], "Wtorek": ["10:00", "22:00"], "Sroda": ["10:00", "22:00"],
  "Czwartek": ["10:00", "22:00"], "Piatek": ["10:00", "22:00"], "Sobota": ["12:00", "20:00"], "Niedziela": null,
};

const inp = "w-full p-3 bg-cs-deep border border-cs-line rounded-sm text-cs-text font-body text-sm outline-none";

export default function AdminPage(){
  const{bookings,loading,removeBooking,refresh}=useBookings();
  const[auth,setAuth]=useState(false);
  const[pw,setPw]=useState("");
  const[pwErr,setPwErr]=useState(false);
  const[tab,setTab]=useState("dash");
  const[sortField,setSortField]=useState<"date"|"name"|"type">("date");
  const[sortDir,setSortDir]=useState<"asc"|"desc">("asc");
  const[search,setSearch]=useState("");
  const[hours,setHours]=useState<Record<string,[string,string]|null>>(DEFAULT_HOURS);
  const[hoursEditing,setHoursEditing]=useState(false);
  const[hoursSaved,setHoursSaved]=useState(false);
  const[viewMode,setViewMode]=useState<"list"|"timeline">("list");

  // Offer editor state
  const[editServices,setEditServices]=useState(SERVICES.map(s=>({...s})));
  const[editPackages,setEditPackages]=useState(PACKAGES.map(p=>({...p})));
  const[editRate,setEditRate]=useState(HOURLY_RATE);
  const[editWeekend,setEditWeekend]=useState(WEEKEND_SURCHARGE);
  const[offerEditing,setOfferEditing]=useState(false);

  // Beats state
  const[beats,setBeats]=useState<any[]>([]);
  const[beatsLoading,setBeatsLoading]=useState(false);
  const[newBeat,setNewBeat]=useState({title:"",bpm:140,key:"",tags:"",price:200,audio_url:"",cover_url:""});
  const[beatErr,setBeatErr]=useState("");
  const[beatSaving,setBeatSaving]=useState(false);
  const[offerSaved,setOfferSaved]=useState(false);

  useEffect(()=>{
    if(auth&&tab==="beats"){
      setBeatsLoading(true);
      fetch("/api/beats").then(r=>r.json()).then(d=>setBeats(Array.isArray(d)?d:[])).catch(()=>{}).finally(()=>setBeatsLoading(false));
    }
  },[auth,tab]);

  const addBeat=async()=>{
    if(!newBeat.title.trim()){setBeatErr("Podaj tytul");return;}
    setBeatSaving(true);setBeatErr("");
    try{
      const res=await fetch("/api/beats",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newBeat)});
      const data=await res.json();
      if(!res.ok){setBeatErr(data.error||"Blad");setBeatSaving(false);return;}
      setBeats(p=>[data,...p]);
      setNewBeat({title:"",bpm:140,key:"",tags:"",price:200,audio_url:"",cover_url:""});
    }catch(e:any){setBeatErr(e.message);}
    setBeatSaving(false);
  };

  const delBeat=async(id:number)=>{
    if(!window.confirm("Usunac ten beat?"))return;
    try{
      await fetch("/api/beats",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
      setBeats(p=>p.filter(b=>b.id!==id));
    }catch(e){}
  };

  const toggleBeatStatus=async(id:number,current:string)=>{
    const next=current==="active"?"hidden":"active";
    try{
      const res=await fetch("/api/beats",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:next})});
      if(res.ok){setBeats(p=>p.map(b=>b.id===id?{...b,status:next}:b));}
    }catch(e){}
  };

  if(!auth) return(
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="bg-cs-card border border-cs-line p-10 md:p-14 w-full max-w-[420px] text-center rounded-sm">
        <div className="w-3 h-3 bg-cs-gold rounded-full mx-auto mb-6" style={{boxShadow:"0 0 20px rgba(196,151,103,0.3)",animation:"pulseSlow 3s ease infinite"}}/>
        <h2 className="font-display text-2xl md:text-3xl text-cs-white uppercase tracking-[0.1em] mb-2">Vault Access</h2>
        <p className="font-mono text-[11px] text-cs-dim mb-8">RESTRICTED AREA</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){pw==="caseout2025"?setAuth(true):setPwErr(true);}}} placeholder="password" className="w-full p-4 bg-cs-deep text-cs-text font-mono text-base text-center outline-none mb-5 rounded-sm" style={{border:"1px solid "+(pwErr?"#8B3030":"#1A1F2B")}}/>
        {pwErr&&<div className="font-mono text-[11px] text-cs-red mb-4">ACCESS DENIED</div>}
        <GlowBtn onClick={()=>pw==="caseout2025"?setAuth(true):setPwErr(true)} className="w-full">Enter</GlowBtn>
      </div>
    </div>
  );

  const today=new Date().toISOString().slice(0,10);
  const mp=new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0");
  const upcoming=bookings.filter(b=>b.date>=today&&b.status==="confirmed").sort((a,b)=>a.date.localeCompare(b.date)||a.hour-b.hour);

  // Search filter
  const q=search.trim().toLowerCase();
  const filtered=q?bookings.filter(b=>
    (b.order_number||"").toLowerCase().includes(q)||
    b.name.toLowerCase().includes(q)||
    b.email.toLowerCase().includes(q)||
    b.phone.includes(q)||
    b.date.includes(q)
  ):bookings;

  const sorted=[...filtered].sort((a,b)=>{
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

  const tabs=[["dash","Dashboard"],["book","Rezerwacje"],["beats","Beaty"],["offer","Oferta"],["set","Ustawienia"]] as const;

  const groupByDate=(list: typeof bookings)=>{
    const map: Record<string, typeof bookings> = {};
    list.forEach(b=>{if(!map[b.date]) map[b.date]=[];map[b.date].push(b);});
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b));
  };
  const dayName=(ds:string)=>["Nd","Pn","Wt","Sr","Cz","Pt","Sb"][new Date(ds).getDay()];
  const isToday=(ds:string)=>ds===today;
  const isPast=(ds:string)=>ds<today;

  const saveHours=()=>{setHoursEditing(false);setHoursSaved(true);setTimeout(()=>setHoursSaved(false),2000);};
  const updateHour=(day:string,idx:0|1,val:string)=>{const h={...hours};if(h[day]){const a:[string,string]=[...h[day]!];a[idx]=val;h[day]=a;}setHours(h);};
  const toggleDayClosed=(day:string)=>{const h={...hours};h[day]=h[day]===null?["10:00","22:00"]:null;setHours(h);};

  const saveOffer=()=>{setOfferEditing(false);setOfferSaved(true);setTimeout(()=>setOfferSaved(false),2000);};

  // Booking card with order number
  const BookingCard=({b,showDate=true}:{b:typeof bookings[0];showDate?:boolean})=>{
    const st=SESSION_TYPES.find(s=>s.id===b.type);
    const past=b.date<today;
    return(
      <div className="bg-cs-card border border-cs-line rounded-sm overflow-hidden transition-all duration-300 hover:border-[rgba(144,113,79,0.15)]" style={{opacity:past?0.6:1}}>
        <div className="h-1" style={{background:past?"#403830":b.status==="confirmed"?"#C49767":"#8B3030"}}/>
        <div className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-lg">{st?.icon||"🎵"}</span>
                <span className="font-display text-base md:text-lg text-cs-white font-semibold truncate">{b.name}</span>
                {isToday(b.date)&&<span className="font-mono text-[9px] bg-cs-gold text-cs-deep px-2 py-0.5 rounded-sm font-bold tracking-wider">DZISIAJ</span>}
              </div>
              {b.order_number&&<div className="font-mono text-[11px] text-cs-gold-dim mb-1.5 flex items-center gap-1.5">
                <span style={{color:"#706860"}}>Nr:</span>
                <span className="font-bold tracking-wider">{b.order_number}</span>
              </div>}
              <div className="font-mono text-[11px] text-cs-dim space-y-0.5">
                <div>{b.email} | {b.phone}</div>
              </div>
              {b.notes&&<div className="font-body text-sm text-cs-muted mt-2 italic border-l-2 border-cs-line pl-3">{b.notes}</div>}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {showDate&&<div className="font-mono text-[11px] text-cs-dim">{dayName(b.date)} {b.date}</div>}
              <div className="font-display text-xl md:text-2xl text-cs-gold leading-none">{b.hour}:00 - {b.hour+b.duration}:00</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm" style={{background:"rgba(196,151,103,0.08)",border:"1px solid rgba(196,151,103,0.15)",color:"#C49767"}}>{st?.name||b.type}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm" style={{background:"rgba(196,151,103,0.05)",color:"#90714F"}}>{b.duration}h</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <a href={makeGCalUrl(b)} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-cs-gold-dim hover:text-cs-gold transition-colors px-2 py-1 rounded-sm border border-cs-line hover:border-cs-gold-dim">+ GCal</a>
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

        {bookings.filter(b=>b.date===today).length>0&&<>
          <div className="font-mono text-[11px] text-cs-gold tracking-[0.2em] mb-4">DZISIEJSZE SESJE</div>
          <div className="space-y-3 mb-10">{bookings.filter(b=>b.date===today).sort((a,b)=>a.hour-b.hour).map(b=><BookingCard key={b.id} b={b} showDate={false}/>)}</div>
        </>}

        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4">NADCHODZACE SESJE</div>
        {upcoming.filter(b=>b.date!==today).length===0&&<div className="font-body text-base text-cs-dim bg-cs-card border border-cs-line p-8 text-center rounded-sm">Brak nadchodzacych sesji</div>}
        <div className="space-y-3">{groupByDate(upcoming.filter(b=>b.date!==today)).map(([date,items])=>(
          <div key={date}>
            <div className="font-mono text-[11px] text-cs-dim mb-2 flex items-center gap-2">
              <span className="text-cs-gold-dim">{dayName(date)}</span><span>{date}</span>
              <span className="text-cs-dim">({items.length} sesji)</span>
            </div>
            <div className="space-y-2 ml-0 md:ml-4">{items.sort((a,b)=>a.hour-b.hour).map(b=><BookingCard key={b.id} b={b} showDate={false}/>)}</div>
          </div>
        ))}</div>
      </>}

      {/* ═══ ALL BOOKINGS ═══ */}
      {!loading&&tab==="book"&&<>
        {/* Search bar */}
        <div className="mb-5">
          <div className="relative">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Szukaj: nr zamowienia, imie, email, telefon, data..." className="w-full p-4 pl-12 bg-cs-card border border-cs-line rounded-sm text-cs-text font-mono text-sm outline-none focus:border-cs-gold-dim transition-colors" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-cs-dim text-sm">&#128269;</div>
            {search&&<button onClick={()=>setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[11px] text-cs-dim hover:text-cs-red cursor-pointer">&#10005;</button>}
          </div>
          {q&&<div className="font-mono text-[11px] text-cs-dim mt-2">Znaleziono: {filtered.length} {filtered.length===1?"rezerwacja":"rezerwacji"}</div>}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em]">
            {q?"WYNIKI WYSZUKIWANIA":"WSZYSTKIE REZERWACJE"} ({filtered.length})
          </div>
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
            <div className="ml-0 md:ml-4 space-y-1">{items.sort((a,b)=>a.hour-b.hour).map(b=>{
              const st=SESSION_TYPES.find(s=>s.id===b.type);
              return <div key={b.id} className="flex items-center gap-3">
                <div className="font-mono text-sm text-cs-gold w-[100px] md:w-[130px] flex-shrink-0">{b.hour}:00 - {b.hour+b.duration}:00</div>
                <div className="flex-1 bg-cs-deep rounded-sm p-3 border border-cs-line flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <span className="font-body text-base text-cs-text font-semibold">{b.name}</span>
                    <span className="font-mono text-[10px] text-cs-dim ml-2">{st?.icon} {st?.name} | {b.duration}h</span>
                    {b.order_number&&<span className="font-mono text-[10px] text-cs-gold-dim ml-2">#{b.order_number}</span>}
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

        {filtered.length===0&&<div className="font-body text-base text-cs-dim bg-cs-card border border-cs-line p-8 text-center rounded-sm">{q?"Brak wynikow dla \""+search+"\"":"Brak rezerwacji"}</div>}
      </>}

      {/* ═══ OFFER EDITOR ═══ */}
      {tab==="offer"&&<>
        <div className="flex justify-between items-center mb-6">
          <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em]">ZARZADZANIE OFERTA</div>
          {!offerEditing?<button onClick={()=>setOfferEditing(true)} className="font-mono text-[10px] text-cs-gold-dim hover:text-cs-gold cursor-pointer bg-transparent border border-cs-line px-3 py-1.5 rounded-sm transition-colors">EDYTUJ WSZYSTKO</button>
          :<div className="flex gap-2">
            <button onClick={saveOffer} className="font-mono text-[10px] text-cs-green cursor-pointer bg-transparent border border-[rgba(59,107,59,0.3)] px-3 py-1.5 rounded-sm transition-colors hover:border-cs-green">ZAPISZ</button>
            <button onClick={()=>{setOfferEditing(false);setEditServices(SERVICES.map(s=>({...s})));setEditPackages(PACKAGES.map(p=>({...p})));setEditRate(HOURLY_RATE);setEditWeekend(WEEKEND_SURCHARGE);}} className="font-mono text-[10px] text-cs-dim cursor-pointer bg-transparent border border-cs-line px-3 py-1.5 rounded-sm transition-colors">ANULUJ</button>
          </div>}
        </div>
        {offerSaved&&<div className="font-mono text-xs text-cs-green mb-4 p-2 rounded-sm" style={{background:"rgba(59,107,59,0.06)",border:"1px solid rgba(59,107,59,0.15)"}}>Zapisano zmiany (aby zastosowac na stronie, zaktualizuj plik data.ts i zrob deploy)</div>}

        {/* Stawka godzinowa */}
        <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-3">STAWKA GODZINOWA</div>
        <div className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] text-cs-dim mb-1.5 block">STAWKA BAZOWA (PON-PT)</label>
              {offerEditing?<div className="flex items-center gap-2"><input type="number" value={editRate} onChange={e=>setEditRate(Number(e.target.value))} className={inp+" max-w-[120px]"}/><span className="font-mono text-sm text-cs-dim">zl/h</span></div>
              :<div className="font-display text-2xl text-cs-gold">{editRate} <span className="font-mono text-sm text-cs-dim">zl/h</span></div>}
            </div>
            <div>
              <label className="font-mono text-[10px] text-cs-dim mb-1.5 block">DOPLATA WEEKENDOWA</label>
              {offerEditing?<div className="flex items-center gap-2"><span className="font-mono text-sm text-cs-dim">+</span><input type="number" value={editWeekend} onChange={e=>setEditWeekend(Number(e.target.value))} className={inp+" max-w-[120px]"}/><span className="font-mono text-sm text-cs-dim">zl/h</span></div>
              :<div className="font-display text-2xl text-cs-gold">+{editWeekend} <span className="font-mono text-sm text-cs-dim">zl/h</span></div>}
            </div>
          </div>
          <div className="font-mono text-[10px] text-cs-dim mt-3">Sobota: {editRate+editWeekend} zl/h</div>
        </div>

        {/* Pakiety */}
        <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-3">PAKIETY</div>
        <div className="space-y-3 mb-8">{editPackages.map((p,i)=>(
          <div key={i} className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-6">
            {offerEditing?<div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">NAZWA</label><input value={p.name} onChange={e=>{const n=[...editPackages];n[i]={...n[i],name:e.target.value};setEditPackages(n);}} className={inp}/></div>
              <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">GODZINY</label><input type="number" value={p.hours} onChange={e=>{const n=[...editPackages];n[i]={...n[i],hours:Number(e.target.value)};setEditPackages(n);}} className={inp}/></div>
              <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">CENA (ZL)</label><input type="number" value={p.price} onChange={e=>{const n=[...editPackages];n[i]={...n[i],price:Number(e.target.value)};setEditPackages(n);}} className={inp}/></div>
              <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">OPIS</label><input value={p.desc} onChange={e=>{const n=[...editPackages];n[i]={...n[i],desc:e.target.value};setEditPackages(n);}} className={inp}/></div>
              <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">RABAT</label><input value={p.discount} onChange={e=>{const n=[...editPackages];n[i]={...n[i],discount:e.target.value};setEditPackages(n);}} className={inp}/></div>
            </div>
            :<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-display text-lg text-cs-white">{p.name}</span>
                <span className="font-mono text-[11px] text-cs-dim ml-3">{p.hours}h</span>
                <span className="font-mono text-[11px] text-cs-green ml-2">{p.discount}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-xl text-cs-gold font-bold">{p.price}</span>
                <span className="font-mono text-[11px] text-cs-dim">zl</span>
                <span className="font-mono text-[10px] text-cs-dim ml-2">({Math.round(p.price/p.hours)} zl/h)</span>
              </div>
            </div>}
          </div>
        ))}</div>

        {/* Uslugi */}
        <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-3">USLUGI (OFERTA)</div>
        <div className="space-y-3 mb-8">{editServices.map((s,i)=>(
          <div key={i} className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-6">
            {offerEditing?<div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">NAZWA</label><input value={s.title} onChange={e=>{const n=[...editServices];n[i]={...n[i],title:e.target.value};setEditServices(n);}} className={inp}/></div>
              <div className="md:col-span-2"><label className="font-mono text-[10px] text-cs-dim mb-1 block">OPIS</label><input value={s.desc} onChange={e=>{const n=[...editServices];n[i]={...n[i],desc:e.target.value};setEditServices(n);}} className={inp}/></div>
              <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">CENA</label><input value={s.price} onChange={e=>{const n=[...editServices];n[i]={...n[i],price:e.target.value};setEditServices(n);}} className={inp}/></div>
            </div>
            :<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <span className="font-display text-base text-cs-white">{s.title}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm" style={{background:"rgba(196,151,103,0.06)",color:"#90714F"}}>{s.tag}</span>
                </div>
                <div className="font-body text-sm text-cs-dim mt-1 truncate">{s.desc}</div>
              </div>
              <div className="font-mono text-sm text-cs-gold flex-shrink-0">{s.price}</div>
            </div>}
          </div>
        ))}</div>

        {/* Info */}
        <div className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-6">
          <div className="font-mono text-[10px] text-cs-dim">UWAGA: Zmiany w tej zakladce sa podgladem. Aby zastosowac je na stronie, zaktualizuj wartosci w pliku <span className="text-cs-gold">lib/data.ts</span> i zrob deploy na Vercel.</div>
        </div>
      </>}

      {/* ═══ BEATS ═══ */}
      {tab==="beats"&&<>
        <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-4">DODAJ NOWY BEAT</div>
        <div className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="col-span-2"><label className="font-mono text-[10px] text-cs-dim mb-1 block">TYTUL *</label><input value={newBeat.title} onChange={e=>setNewBeat({...newBeat,title:e.target.value})} className={inp} placeholder="Midnight Drill"/></div>
            <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">BPM</label><input type="number" value={newBeat.bpm} onChange={e=>setNewBeat({...newBeat,bpm:Number(e.target.value)})} className={inp}/></div>
            <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">TONACJA</label><input value={newBeat.key} onChange={e=>setNewBeat({...newBeat,key:e.target.value})} className={inp} placeholder="Cm"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">TAGI (po przecinku)</label><input value={newBeat.tags} onChange={e=>setNewBeat({...newBeat,tags:e.target.value})} className={inp} placeholder="drill, dark, 808"/></div>
            <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">CENA (ZL)</label><input type="number" value={newBeat.price} onChange={e=>setNewBeat({...newBeat,price:Number(e.target.value)})} className={inp}/></div>
            <div><label className="font-mono text-[10px] text-cs-dim mb-1 block">URL AUDIO (mp3)</label><input value={newBeat.audio_url} onChange={e=>setNewBeat({...newBeat,audio_url:e.target.value})} className={inp} placeholder="https://...mp3"/></div>
          </div>
          {beatErr&&<div className="font-mono text-[11px] text-cs-red mb-3">{beatErr}</div>}
          <button onClick={addBeat} disabled={beatSaving} className="font-mono text-[11px] px-5 py-2.5 rounded-sm cursor-pointer transition-all" style={{background:"rgba(196,151,103,0.08)",border:"1px solid rgba(196,151,103,0.25)",color:"#C49767"}}>{beatSaving?"Dodawanie...":"+ Dodaj beat"}</button>
        </div>

        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4">WSZYSTKIE BEATY ({beats.length})</div>
        {beatsLoading&&<div className="font-mono text-xs text-cs-dim py-8 text-center">Ladowanie...</div>}
        {!beatsLoading&&beats.length===0&&<div className="font-body text-base text-cs-dim bg-cs-card border border-cs-line p-8 text-center rounded-sm">Brak beatow — dodaj pierwszy powyzej</div>}
        <div className="space-y-3">{beats.map(b=>(
          <div key={b.id} className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-lg text-cs-white">{b.title}</span>
                  <span className="font-mono text-[11px] text-cs-gold-dim">{b.bpm} BPM</span>
                  {b.key&&<span className="font-mono text-[11px] text-cs-dim">{b.key}</span>}
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-sm" style={{background:b.status==="active"?"rgba(59,107,59,0.08)":"rgba(139,48,48,0.08)",border:"1px solid "+(b.status==="active"?"rgba(59,107,59,0.2)":"rgba(139,48,48,0.2)"),color:b.status==="active"?"#3B6B3B":"#8B3030"}}>{b.status==="active"?"AKTYWNY":"UKRYTY"}</span>
                  {b.status==="sold"&&<span className="font-mono text-[9px] px-2 py-0.5 rounded-sm bg-cs-gold text-cs-deep font-bold">SPRZEDANY</span>}
                </div>
                {b.tags&&<div className="font-mono text-[10px] text-cs-dim mt-1">{b.tags}</div>}
                {b.audio_url&&<div className="font-mono text-[10px] text-cs-dim mt-0.5 truncate max-w-[400px]">Audio: {b.audio_url}</div>}
                {!b.audio_url&&<div className="font-mono text-[10px] text-cs-red mt-0.5">Brak audio URL</div>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right mr-3">
                  <div className="font-display text-xl text-cs-gold font-bold">{b.price} zl</div>
                </div>
                <button onClick={()=>toggleBeatStatus(b.id,b.status)} className="font-mono text-[10px] px-2 py-1 cursor-pointer rounded-sm transition-colors" style={{border:"1px solid #1A1F2B",color:"#706860"}}>{b.status==="active"?"Ukryj":"Pokaz"}</button>
                <button onClick={()=>delBeat(b.id)} className="font-mono text-[10px] text-cs-red px-2 py-1 cursor-pointer rounded-sm hover:bg-[rgba(139,48,48,0.12)] transition-colors" style={{border:"1px solid rgba(139,48,48,0.15)"}}>Usun</button>
              </div>
            </div>
          </div>
        ))}</div>
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
        <div className="bg-cs-card border border-cs-line rounded-sm overflow-hidden mb-10">
          {Object.entries(hours).map(([day, h]) => (
            <div key={day} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-5 md:px-8 border-b border-cs-line last:border-0 gap-2">
              <span className="font-body text-base md:text-lg text-cs-text min-w-[140px]">{day}</span>
              {hoursEditing?<div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={h!==null} onChange={()=>toggleDayClosed(day)} className="accent-[#C49767]"/><span className="font-mono text-[11px] text-cs-dim">{h!==null?"Otwarte":"Zamkniete"}</span></label>
                {h!==null&&<><input type="time" value={h[0]} onChange={e=>updateHour(day,0,e.target.value)} className="bg-cs-deep border border-cs-line text-cs-text font-mono text-sm p-1.5 rounded-sm outline-none" style={{colorScheme:"dark"}}/><span className="text-cs-dim">-</span><input type="time" value={h[1]} onChange={e=>updateHour(day,1,e.target.value)} className="bg-cs-deep border border-cs-line text-cs-text font-mono text-sm p-1.5 rounded-sm outline-none" style={{colorScheme:"dark"}}/></>}
              </div>
              :<span className="font-mono text-sm md:text-base" style={{color:h===null?"#8B3030":"#706860"}}>{h===null?"ZAMKNIETE":h[0]+" - "+h[1]}</span>}
            </div>
          ))}
        </div>
        <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-4">INFORMACJE</div>
        <div className="bg-cs-card border border-cs-line p-5 md:p-8 rounded-sm space-y-3">
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Wersja</span><span className="font-mono text-sm text-cs-gold">2.0.0</span></div>
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Baza danych</span><span className="font-mono text-sm text-cs-green">Supabase | Postgres</span></div>
          <div className="flex justify-between"><span className="font-body text-base text-cs-muted">Hosting</span><span className="font-mono text-sm text-cs-text">Vercel</span></div>
        </div>
      </>}
    </div></div>
  );
}
