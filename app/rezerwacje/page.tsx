"use client";
import React, { useState, useEffect } from "react";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";
import { useBookings } from "@/lib/store";
import { SESSION_TYPES, PACKAGES, HOURLY_RATE, WEEKEND_SURCHARGE, Booking, Package } from "@/lib/data";

const MO=["Styczen","Luty","Marzec","Kwiecien","Maj","Czerwiec","Lipiec","Sierpien","Wrzesien","Pazdziernik","Listopad","Grudzien"];
const DN=["Pn","Wt","Sr","Cz","Pt","Sb","Nd"];

function getStudioHours(dow: number): [number, number] | null {
  if (dow === 6) return null;
  if (dow === 5) return [12, 20];
  return [10, 22];
}
function isWeekendDate(d: string) { return (new Date(d).getDay() + 6) % 7 === 5; }
function calcPrice(h: number, we: boolean) { return h * (we ? HOURLY_RATE + WEEKEND_SURCHARGE : HOURLY_RATE); }

// ─── MODES: "single" = normal booking, "package" = multi-day package ───
type Mode = "single" | "package";

export default function RezerwacjePage(){
  const{bookings,loading,addBooking}=useBookings();
  const[mode,setMode]=useState<Mode>("single");
  const[pkg,setPkg]=useState<Package|null>(null);

  // Single mode state
  const[cur,setCur]=useState(new Date());
  const[selDate,setSelDate]=useState<string|null>(null);
  const[selHours,setSelHours]=useState<number[]>([]);
  const[step,setStep]=useState(0);
  const[form,setForm]=useState({name:"",email:"",phone:"",type:"recording",notes:""});
  const[confirm,setConfirm]=useState<{orderNumber:string;sessions:{date:string;hour:number;duration:number}[];pkg?:Package}|null>(null);
  const[busy,setBusy]=useState(false);
  const[payBusy,setPayBusy]=useState(false);
  const[err,setErr]=useState("");
  const[fieldErr,setFieldErr]=useState<Record<string,string>>({});

  // Package mode state
  const[pkgSlots,setPkgSlots]=useState<Record<string,number[]>>({});
  const[pkgEditDate,setPkgEditDate]=useState<string|null>(null);

  // Check URL for package param
  useEffect(()=>{
    if(typeof window !== "undefined"){
      const p = new URLSearchParams(window.location.search);
      const pkgId = p.get("package");
      const payOk = p.get("payment");
      if(pkgId){
        const found = PACKAGES.find(x => x.id === pkgId);
        if(found){setMode("package");setPkg(found);}
      }
      if(payOk==="success") setConfirm({orderNumber:"OPLACONE",sessions:[]});
    }
  },[]);

  const yr=cur.getFullYear(),mo=cur.getMonth(),dim=new Date(yr,mo+1,0).getDate(),fd=(new Date(yr,mo,1).getDay()+6)%7;
  const today=new Date().toISOString().slice(0,10);

  const bookedSet=(date:string):Set<number>=>{
    const s=new Set<number>();
    bookings.filter(b=>b.date===date&&b.status==="confirmed").forEach(b=>{for(let h=b.hour;h<b.hour+b.duration;h++)s.add(h);});
    return s;
  };

  // ─── SHARED HELPERS ───
  const formatPhone=(v:string)=>{const d=v.replace(/\D/g,"").slice(0,9);if(d.length<=3)return d;if(d.length<=6)return d.slice(0,3)+" "+d.slice(3);return d.slice(0,3)+" "+d.slice(3,6)+" "+d.slice(6);};
  const handlePhone=(v:string)=>{const f=formatPhone(v);setForm({...form,phone:f});const d=f.replace(/\D/g,"");if(d.length>0&&d.length<9)setFieldErr(p=>({...p,phone:"9 cyfr"}));else setFieldErr(p=>{const n={...p};delete n.phone;return n;});};
  const handleEmail=(v:string)=>{setForm({...form,email:v});if(v.length>0&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))setFieldErr(p=>({...p,email:"Nieprawidlowy email"}));else setFieldErr(p=>{const n={...p};delete n.email;return n;});};
  const handleName=(v:string)=>{setForm({...form,name:v});if(v.length>0&&v.trim().length<2)setFieldErr(p=>({...p,name:"Min. 2 znaki"}));else setFieldErr(p=>{const n={...p};delete n.name;return n;});};
  const validate=()=>{
    const fe:Record<string,string>={};
    if(!form.name||form.name.trim().length<2)fe.name="Podaj imie";
    if(!form.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))fe.email="Podaj email";
    if(!form.phone||form.phone.replace(/\D/g,"").length!==9)fe.phone="9 cyfr";
    setFieldErr(fe);return Object.keys(fe).length===0;
  };

  const inp="w-full p-3.5 md:p-4 bg-cs-deep border rounded-sm text-cs-text font-body text-sm md:text-base outline-none transition-all duration-300";
  const errB="border-[rgba(139,48,48,0.5)]",okB="border-cs-line";

  // ─── SINGLE MODE: slot toggling ───
  const toggleHour=(h:number)=>{
    if(!selDate)return;if(bookedSet(selDate).has(h))return;
    if(selHours.length===0){setSelHours([h]);return;}
    if(selHours.includes(h)){if(h===selHours[selHours.length-1])setSelHours(selHours.slice(0,-1));else if(h===selHours[0]&&selHours.length>1)setSelHours(selHours.slice(1));return;}
    const mn=Math.min(...selHours),mx=Math.max(...selHours);
    if(h===mx+1)setSelHours([...selHours,h]);else if(h===mn-1)setSelHours([h,...selHours]);else setSelHours([h]);
  };
  const canSel=(h:number):boolean=>{
    if(!selDate||bookedSet(selDate).has(h))return false;if(selHours.length===0)return true;if(selHours.includes(h))return true;
    const mn=Math.min(...selHours),mx=Math.max(...selHours);return h===mx+1||h===mn-1;
  };

  // ─── PACKAGE MODE: multi-day slot toggling ───
  const pkgUsed=Object.values(pkgSlots).reduce((s,a)=>s+a.length,0);
  const pkgBudget=pkg?.hours||0;
  const pkgRemaining=pkgBudget-pkgUsed;

  const pkgToggle=(date:string,h:number)=>{
    const booked=bookedSet(date);if(booked.has(h))return;
    const current=pkgSlots[date]||[];
    if(current.includes(h)){
      // Remove — only from ends
      if(h===current[current.length-1]){const n={...pkgSlots,[date]:current.slice(0,-1)};if(n[date].length===0)delete n[date];setPkgSlots(n);}
      else if(h===current[0]&&current.length>1){const n={...pkgSlots,[date]:current.slice(1)};setPkgSlots(n);}
      return;
    }
    if(pkgRemaining<=0)return;
    if(current.length===0){setPkgSlots({...pkgSlots,[date]:[h]});return;}
    const mn=Math.min(...current),mx=Math.max(...current);
    if(h===mx+1)setPkgSlots({...pkgSlots,[date]:[...current,h]});
    else if(h===mn-1)setPkgSlots({...pkgSlots,[date]:[h,...current]});
    else if(!current.includes(h))setPkgSlots({...pkgSlots,[date]:[h]});
  };

  const pkgCanSel=(date:string,h:number):boolean=>{
    if(bookedSet(date).has(h))return false;
    const current=pkgSlots[date]||[];
    if(current.includes(h))return true;
    if(pkgRemaining<=0)return false;
    if(current.length===0)return true;
    const mn=Math.min(...current),mx=Math.max(...current);
    return h===mx+1||h===mn-1;
  };

  const pkgSessionList=Object.entries(pkgSlots).filter(([,hrs])=>hrs.length>0).sort(([a],[b])=>a.localeCompare(b)).map(([date,hrs])=>({
    date,hour:Math.min(...hrs),duration:hrs.length,
  }));

  const pkgRemoveDate=(date:string)=>{const n={...pkgSlots};delete n[date];setPkgSlots(n);};

  // ─── BOOKING ───
  const sendEmail=async(orderNumber:string,sessions:{date:string;hour:number;duration:number}[],totalPrice:number,payMethod:string)=>{
    try{
      await fetch("/api/email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        to:form.email,orderNumber,name:form.name,sessions,totalPrice,
        packageName:pkg?.name||null,payMethod
      })});
    }catch(e){console.error("Email failed:",e);}
  };

  const bookSingle=async(payMethod:"payu"|"onsite")=>{
    if(!selDate||selHours.length===0)return;
    setBusy(true);setErr("");
    const startH=Math.min(...selHours),dur=selHours.length;
    const we=isWeekendDate(selDate);
    const price=calcPrice(dur,we);
    const notesStr=form.notes+(form.notes?" | ":"")+"Cena: "+price+" zl | "+payMethod;

    const result=await addBooking({date:selDate,hour:startH,duration:dur,type:form.type,name:form.name,email:form.email,phone:form.phone,notes:notesStr,status:"confirmed"});
    if(!result.booking){setBusy(false);setErr(result.error||"Blad");return;}

    const orderNum=result.booking.order_number||"CS-"+Date.now();

    if(payMethod==="payu"){
      setPayBusy(true);
      try{
        const pr=await fetch("/api/pay",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:result.booking.id,amount:price,description:"Caseout Studio "+selDate+" "+startH+":00",email:form.email,name:form.name,phone:form.phone})});
        const pd=await pr.json();
        if(pd.redirectUrl){await sendEmail(orderNum,[{date:selDate,hour:startH,duration:dur}],price,"payu");window.location.href=pd.redirectUrl;return;}
      }catch(e){}
      setPayBusy(false);
    }

    await sendEmail(orderNum,[{date:selDate,hour:startH,duration:dur}],price,payMethod);
    setConfirm({orderNumber:orderNum,sessions:[{date:selDate,hour:startH,duration:dur}]});
    setBusy(false);setStep(0);setSelDate(null);setSelHours([]);setForm({name:"",email:"",phone:"",type:"recording",notes:""});setFieldErr({});
  };

  const bookPackage=async(payMethod:"payu"|"onsite")=>{
    if(!pkg||pkgSessionList.length===0)return;
    setBusy(true);setErr("");
    const notesStr=form.notes+(form.notes?" | ":"")+"Pakiet: "+pkg.name+" ("+pkg.hours+"h) | "+pkg.price+" zl | "+payMethod;

    try{
      const res=await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        sessions:pkgSessionList,type:form.type,name:form.name,email:form.email,phone:form.phone,notes:notesStr,package_id:pkg.id
      })});
      const data=await res.json();
      if(!res.ok){setBusy(false);setErr(data.error||"Blad");return;}

      const orderNum=data.order_number||"CS-"+Date.now();

      if(payMethod==="payu"){
        setPayBusy(true);
        try{
          const pr=await fetch("/api/pay",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:orderNum,amount:pkg.price,description:"Caseout Studio Pakiet "+pkg.name,email:form.email,name:form.name,phone:form.phone})});
          const pd=await pr.json();
          if(pd.redirectUrl){await sendEmail(orderNum,pkgSessionList,pkg.price,"payu");window.location.href=pd.redirectUrl;return;}
        }catch(e){}
        setPayBusy(false);
      }

      await sendEmail(orderNum,pkgSessionList,pkg.price,payMethod);
      setConfirm({orderNumber:orderNum,sessions:pkgSessionList,pkg});
      setBusy(false);setPkgSlots({});setStep(0);setForm({name:"",email:"",phone:"",type:"recording",notes:""});
    }catch(e:any){setBusy(false);setErr(e.message);}
  };

  // ─── PRICE CALC ───
  const singleWe=selDate?isWeekendDate(selDate):false;
  const singleRate=singleWe?HOURLY_RATE+WEEKEND_SURCHARGE:HOURLY_RATE;
  const singleTotal=selHours.length*singleRate;

  // ─── SLOT RENDERER (shared) ───
  const SlotPicker=({date,hours,onToggle,canToggle,accentColor}:{date:string;hours:number[];onToggle:(h:number)=>void;canToggle:(h:number)=>boolean;accentColor:string})=>{
    const dow=(new Date(date).getDay()+6)%7;
    const sh=getStudioHours(dow);
    if(!sh)return null;
    const booked=bookedSet(date);
    return<div className="space-y-1">{Array.from({length:sh[1]-sh[0]},(_,i)=>{
      const h=sh[0]+i;const isBk=booked.has(h);const isSel=hours.includes(h);const ok=canToggle(h);
      let bg="#050810",bd="#1A1F2B",tc="#D8D0C6",cu="pointer",op=1;
      if(isBk){bg="rgba(139,48,48,0.08)";bd="rgba(139,48,48,0.25)";tc="#8B3030";cu="not-allowed";op=0.6;}
      else if(isSel){bg=accentColor+"1f";bd=accentColor;tc=accentColor;}
      else if(!ok){op=0.25;cu="default";}
      return<div key={h} onClick={()=>!isBk&&ok&&onToggle(h)} className="flex items-center gap-3 md:gap-4 rounded-sm transition-all duration-200 group" style={{padding:"10px 16px",background:bg,border:"1px solid "+bd,cursor:cu,opacity:op}}>
        <div className="font-mono text-sm md:text-base font-bold w-[60px] flex-shrink-0" style={{color:tc}}>{String(h).padStart(2,"0")}:00</div>
        <div className="flex-1 h-8 md:h-10 rounded-sm relative overflow-hidden" style={{background:isSel?accentColor+"26":"rgba(5,8,16,0.5)",border:isSel?"1px solid "+accentColor+"40":"1px solid transparent"}}>
          {isSel&&<div className="absolute inset-0 flex items-center justify-between px-3"><div className="font-mono text-[10px] tracking-wider" style={{color:accentColor}}>{h===Math.min(...hours)?"START":h===Math.max(...hours)&&hours.length>1?"KONIEC":""}</div></div>}
          {isBk&&<div className="absolute inset-0 flex items-center px-3"><div className="font-mono text-[10px] text-cs-red opacity-70">ZAJETE</div></div>}
        </div>
        <div className="font-mono text-[11px] text-cs-dim w-[50px] text-right flex-shrink-0">{String(h+1).padStart(2,"0")}:00</div>
      </div>;
    })}</div>;
  };

  // ─── FORM FIELDS COMPONENT ───
  const FormFields=()=><div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">TYP SESJI</label><select className={inp+" "+okB+" cursor-pointer"} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{SESSION_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}</select></div>
    <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">IMIE *</label><input className={inp+" "+(fieldErr.name?errB:okB)} value={form.name} onChange={e=>handleName(e.target.value)} placeholder="Twoje imie"/>{fieldErr.name&&<div className="font-mono text-[11px] text-cs-red mt-1.5">{fieldErr.name}</div>}</div>
    <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">EMAIL *</label><input className={inp+" "+(fieldErr.email?errB:okB)} type="email" value={form.email} onChange={e=>handleEmail(e.target.value)} placeholder="email@domena.pl"/>{fieldErr.email&&<div className="font-mono text-[11px] text-cs-red mt-1.5">{fieldErr.email}</div>}</div>
    <div><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">TELEFON *</label><input className={inp+" "+(fieldErr.phone?errB:okB)} value={form.phone} onChange={e=>handlePhone(e.target.value)} placeholder="XXX XXX XXX" maxLength={11} inputMode="numeric"/>{fieldErr.phone?<div className="font-mono text-[11px] text-cs-red mt-1.5">{fieldErr.phone}</div>:<div className="font-mono text-[10px] text-cs-dim mt-1">{form.phone.replace(/\D/g,"").length}/9</div>}</div>
    <div className="md:col-span-2"><label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">UWAGI</label><input className={inp+" "+okB} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="opcjonalnie"/></div>
  </div>;

  // ─── PAYMENT BUTTONS ───
  const PayButtons=({onPay}:{onPay:(m:"payu"|"onsite")=>void})=><div className="mt-6 space-y-3">
    <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2">METODA PLATNOSCI</div>
    <button onClick={()=>onPay("payu")} disabled={busy||payBusy} className="w-full p-4 rounded-sm font-mono text-sm transition-all cursor-pointer" style={{background:"rgba(196,151,103,0.08)",border:"1px solid rgba(196,151,103,0.25)",color:"#C49767"}}>{payBusy?"Przekierowanie do PayU...":"Zaplac online (PayU)"}</button>
    <button onClick={()=>onPay("onsite")} disabled={busy} className="w-full p-4 rounded-sm font-mono text-sm transition-all cursor-pointer" style={{background:"transparent",border:"1px solid #1A1F2B",color:"#706860"}}>{busy?"Zapisywanie...":"Zaplac na miejscu"}</button>
  </div>;

  // ─── CALENDAR RENDERER ───
  const Calendar=({onDayClick,dayExtra}:{onDayClick:(day:number)=>void;dayExtra?:(ds:string,di:number)=>any})=>(
    <div className="bg-cs-card border border-cs-line rounded-sm overflow-hidden">
      <div className="grid grid-cols-7">
        {DN.map(d=><div key={d} className="py-3 px-1 text-center font-mono text-[11px] md:text-xs text-cs-dim border-b border-cs-line font-bold">{d}</div>)}
        {Array.from({length:fd}).map((_,i)=><div key={"e"+i} className="min-h-[70px] md:min-h-[100px] border-b border-cs-line border-r border-r-[rgba(26,31,43,0.05)]"/>)}
        {Array.from({length:dim},(_,i)=>{
          const day=i+1,ds=yr+"-"+String(mo+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
          const db=bookings.filter(b=>b.date===ds),di=(fd+i)%7,isSun=di===6;
          const isT=today===ds,past=new Date(ds)<new Date(today);
          const isSat=di===5;
          const pkgH=pkgSlots[ds]||[];
          const hasPkg=pkgH.length>0;
          return<div key={day} onClick={()=>!isSun&&!past&&onDayClick(day)} className="min-h-[70px] md:min-h-[100px] p-1.5 md:p-2.5 border-b border-cs-line border-r border-r-[rgba(26,31,43,0.05)] transition-colors cursor-pointer hover:bg-[rgba(196,151,103,0.015)]" style={{opacity:past?0.3:isSun?0.4:1,cursor:isSun||past?"default":"pointer",background:hasPkg?"rgba(100,180,255,0.04)":"transparent"}}>
            <div className="font-body text-sm md:text-base font-semibold w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center mb-1" style={{color:isT?"#C49767":hasPkg?"#64B4FF":isSun?"#403830":"#D8D0C6",background:isT?"rgba(196,151,103,0.1)":hasPkg?"rgba(100,180,255,0.1)":"transparent"}}>{day}</div>
            {hasPkg&&<div className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm truncate mb-0.5" style={{color:"#64B4FF",background:"rgba(100,180,255,0.08)",borderLeft:"2px solid rgba(100,180,255,0.3)"}}>{Math.min(...pkgH)}:00-{Math.max(...pkgH)+1}:00 ({pkgH.length}h)</div>}
            {db.map((b,bi)=><div key={bi} className="font-mono text-[9px] text-cs-gold-dim px-1.5 py-0.5 mb-0.5 rounded-sm truncate" style={{background:"rgba(196,151,103,0.07)",borderLeft:"2px solid rgba(196,151,103,0.3)"}}>{b.hour}:00-{b.hour+b.duration}:00</div>)}
            {isSun&&<span className="font-mono text-[9px] text-cs-dim">OFF</span>}
            {dayExtra?.(ds,di)}
          </div>;
        })}
      </div>
    </div>
  );

  // ═══════════════════ RENDER ═══════════════════
  return(
    <div className="pt-20 md:pt-28"><Sect>
      <SectionHead title="Rezerwacje" sub="book a session"/>

      {loading&&<div className="text-center py-20"><div className="inline-block w-8 h-8 border-2 border-cs-gold-dim border-t-cs-gold rounded-full" style={{animation:"spin 0.8s linear infinite"}}/></div>}

      {/* ─── MODE SWITCH ─── */}
      {!loading&&!confirm&&step===0&&<div className="flex gap-2 mb-6">
        <button onClick={()=>{setMode("single");setPkg(null);setPkgSlots({});}} className="font-mono text-[11px] px-5 py-2.5 rounded-sm cursor-pointer transition-all" style={{background:mode==="single"?"rgba(196,151,103,0.08)":"transparent",border:"1px solid "+(mode==="single"?"rgba(196,151,103,0.25)":"#1A1F2B"),color:mode==="single"?"#C49767":"#706860"}}>Pojedyncza sesja</button>
        {PACKAGES.map(p=><button key={p.id} onClick={()=>{setMode("package");setPkg(p);setPkgSlots({});setStep(0);}} className="font-mono text-[11px] px-4 py-2.5 rounded-sm cursor-pointer transition-all" style={{background:mode==="package"&&pkg?.id===p.id?"rgba(100,180,255,0.08)":"transparent",border:"1px solid "+(mode==="package"&&pkg?.id===p.id?"rgba(100,180,255,0.25)":"#1A1F2B"),color:mode==="package"&&pkg?.id===p.id?"#64B4FF":"#706860"}}>Pakiet {p.name} ({p.hours}h)</button>)}
      </div>}

      {/* ─── CONFIRMATION ─── */}
      {confirm&&<RevealDiv><div className="bg-[rgba(59,107,59,0.06)] border border-[rgba(59,107,59,0.2)] rounded-sm p-8 md:p-10 mb-8">
        <div className="text-center mb-6">
          <div className="font-display text-2xl md:text-3xl text-cs-green mb-2">Zarezerwowano!</div>
          <div className="font-mono text-xs text-cs-dim mb-1">NUMER ZAMOWIENIA</div>
          <div className="font-display text-2xl text-cs-gold tracking-wider">{confirm.orderNumber}</div>
          {confirm.pkg&&<div className="font-mono text-sm text-[#64B4FF] mt-2">Pakiet {confirm.pkg.name} ({confirm.pkg.hours}h)</div>}
        </div>
        {confirm.sessions.length>0&&<div className="space-y-1 mb-6">{confirm.sessions.map((s,i)=><div key={i} className="flex justify-between p-3 rounded-sm" style={{background:"rgba(59,107,59,0.04)",border:"1px solid rgba(59,107,59,0.1)"}}>
          <span className="font-mono text-sm text-cs-text">{s.date}</span>
          <span className="font-mono text-sm text-cs-green">{s.hour}:00 - {s.hour+s.duration}:00 ({s.duration}h)</span>
        </div>)}</div>}
        <div className="font-mono text-xs text-cs-dim text-center mb-4">Potwierdzenie wyslane na email</div>
        {err&&<div className="font-mono text-xs text-cs-gold-dim text-center mb-4">{err}</div>}
        <div className="text-center"><GlowBtn ghost onClick={()=>{setConfirm(null);setErr("");setMode("single");setPkg(null);}}>OK</GlowBtn></div>
      </div></RevealDiv>}

      {!loading&&!confirm&&<>
        {/* ─── MONTH NAV ─── */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>setCur(new Date(yr,mo-1))} className="bg-transparent border border-cs-line text-cs-muted px-4 py-2.5 cursor-pointer font-body text-base rounded-sm hover:border-cs-gold-dim transition-colors">&lsaquo;</button>
            <span className="font-display text-xl md:text-2xl text-cs-white min-w-[200px] md:min-w-[240px] text-center uppercase tracking-wide">{MO[mo]} {yr}</span>
            <button onClick={()=>setCur(new Date(yr,mo+1))} className="bg-transparent border border-cs-line text-cs-muted px-4 py-2.5 cursor-pointer font-body text-base rounded-sm hover:border-cs-gold-dim transition-colors">&rsaquo;</button>
          </div>
          {(selDate||pkgEditDate)&&<button onClick={()=>{setSelDate(null);setSelHours([]);setPkgEditDate(null);setStep(0);setErr("");}} className="font-mono text-[11px] text-cs-gold-dim hover:text-cs-gold cursor-pointer bg-transparent border border-cs-line px-4 py-2 rounded-sm transition-colors">&larr; Wroc do kalendarza</button>}
        </div>

        {/* ═══ SINGLE MODE ═══ */}
        {mode==="single"&&<>
          {/* Price bar */}
          {step>=1&&selDate&&<div className="mb-4 p-3 rounded-sm flex flex-wrap items-center justify-between gap-2" style={{background:"rgba(196,151,103,0.04)",border:"1px solid rgba(196,151,103,0.1)"}}>
            <div className="font-mono text-xs text-cs-dim">Stawka: <span className="text-cs-gold font-bold">{singleRate} zl/h</span>{singleWe&&<span className="text-cs-gold-dim ml-1">(+{WEEKEND_SURCHARGE} weekend)</span>}</div>
            {selHours.length>0&&<div className="font-mono text-xs text-cs-dim">Razem: <span className="text-cs-gold font-bold text-sm">{singleTotal} zl</span></div>}
          </div>}

          {step===0&&<Calendar onDayClick={(day)=>{
            const ds=yr+"-"+String(mo+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
            const dow=(new Date(ds).getDay()+6)%7;if(dow===6||new Date(ds)<new Date(today))return;
            setSelDate(ds);setSelHours([]);setStep(1);setErr("");
          }}/>}

          {step===1&&selDate&&<RevealDiv><div className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
              <div>
                <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-1">WYBIERZ GODZINY</div>
                <h3 className="font-display text-xl md:text-2xl text-cs-white uppercase">{selDate}</h3>
              </div>
              {selHours.length>0&&<div className="text-right">
                <div className="font-display text-2xl text-cs-gold">{Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00</div>
                <div className="font-mono text-xs text-cs-dim">{selHours.length}h = <span className="text-cs-gold font-bold">{singleTotal} zl</span></div>
              </div>}
            </div>
            <SlotPicker date={selDate} hours={selHours} onToggle={toggleHour} canToggle={canSel} accentColor="#C49767"/>
            {selHours.length>0&&<div className="mt-5 flex justify-end"><GlowBtn onClick={()=>setStep(2)}>Dalej</GlowBtn></div>}
          </div></RevealDiv>}

          {step===2&&selDate&&<RevealDiv><div className="bg-cs-card border border-[rgba(144,113,79,0.15)] rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{background:"linear-gradient(90deg, transparent, rgba(196,151,103,0.3), transparent)"}}/>
            <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-2">// DANE</div>
            <FormFields/>
            {err&&<div className="font-mono text-sm text-cs-red mt-5 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}
            <div className="flex gap-4 mt-8"><GlowBtn onClick={()=>{if(validate())setStep(3)}} disabled={Object.keys(fieldErr).length>0}>Dalej</GlowBtn><GlowBtn ghost onClick={()=>setStep(1)}>Wroc</GlowBtn></div>
          </div></RevealDiv>}

          {step===3&&selDate&&<RevealDiv><div className="bg-cs-card border border-[rgba(144,113,79,0.2)] rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg, transparent, #C49767, transparent)"}}/>
            <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-2">// PODSUMOWANIE</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-sm" style={{background:"rgba(5,8,16,0.5)",border:"1px solid #1A1F2B"}}>
                <div className="font-mono text-[10px] text-cs-dim mb-2">SESJA</div>
                <div className="font-display text-lg text-cs-gold">{selDate}</div>
                <div className="font-body text-base text-cs-text">{Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00 ({selHours.length}h)</div>
                <div className="font-mono text-[10px] text-cs-dim mt-2">KLIENT</div>
                <div className="font-body text-base text-cs-text">{form.name} | {form.email} | {form.phone}</div>
              </div>
              <div className="p-4 rounded-sm" style={{background:"rgba(5,8,16,0.5)",border:"1px solid #1A1F2B"}}>
                <div className="font-mono text-[10px] text-cs-dim mb-2">CENA</div>
                <div className="flex justify-between py-2 border-b border-cs-line"><span className="font-body text-sm text-cs-muted">{selHours.length}h x {singleRate} zl</span><span className="font-mono text-sm text-cs-text">{singleTotal} zl</span></div>
                <div className="flex justify-between py-3 mt-2"><span className="font-display text-lg text-cs-white">DO ZAPLATY</span><span className="font-display text-2xl text-cs-gold font-bold">{singleTotal} zl</span></div>
              </div>
            </div>
            {err&&<div className="font-mono text-sm text-cs-red mb-4 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}
            <PayButtons onPay={bookSingle}/>
            <div className="flex gap-4 mt-6"><GlowBtn ghost onClick={()=>setStep(2)}>Wroc</GlowBtn></div>
          </div></RevealDiv>}
        </>}

        {/* ═══ PACKAGE MODE ═══ */}
        {mode==="package"&&pkg&&<>
          {/* Package info bar */}
          <div className="mb-5 p-4 rounded-sm" style={{background:"rgba(100,180,255,0.04)",border:"1px solid rgba(100,180,255,0.15)"}}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="font-mono text-[11px] tracking-[0.2em] mb-1" style={{color:"#64B4FF"}}>PAKIET {pkg.name.toUpperCase()}</div>
                <div className="font-body text-base text-cs-muted">{pkg.desc} | {pkg.discount} taniej</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold" style={{color:"#64B4FF"}}>{pkgUsed} / {pkgBudget}h</div>
                <div className="font-mono text-xs text-cs-dim">{pkgRemaining>0?pkgRemaining+"h pozostalo":"Wszystkie godziny wybrane!"}</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{background:"rgba(100,180,255,0.1)"}}>
              <div className="h-full rounded-full transition-all duration-500" style={{width:(pkgUsed/pkgBudget*100)+"%",background:"linear-gradient(90deg, #64B4FF, #4090E0)"}}/>
            </div>
          </div>

          {step===0&&!pkgEditDate&&<>
            <Calendar onDayClick={(day)=>{
              const ds=yr+"-"+String(mo+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
              const dow=(new Date(ds).getDay()+6)%7;if(dow===6||new Date(ds)<new Date(today))return;
              setPkgEditDate(ds);
            }}/>

            {/* Selected sessions list */}
            {pkgSessionList.length>0&&<div className="mt-5">
              <div className="font-mono text-[11px] tracking-[0.15em] mb-3" style={{color:"#64B4FF"}}>WYBRANE SESJE ({pkgSessionList.length})</div>
              <div className="space-y-2">{pkgSessionList.map((s,i)=><div key={i} className="flex justify-between items-center p-3 rounded-sm" style={{background:"rgba(100,180,255,0.04)",border:"1px solid rgba(100,180,255,0.1)"}}>
                <div><span className="font-mono text-sm text-cs-text">{s.date}</span><span className="font-mono text-sm ml-3" style={{color:"#64B4FF"}}>{s.hour}:00 - {s.hour+s.duration}:00</span><span className="font-mono text-[11px] text-cs-dim ml-2">({s.duration}h)</span></div>
                <button onClick={()=>pkgRemoveDate(s.date)} className="font-mono text-[10px] text-cs-red px-2 py-1 cursor-pointer rounded-sm" style={{border:"1px solid rgba(139,48,48,0.15)"}}>Usun</button>
              </div>)}</div>
            </div>}

            {pkgUsed>=pkgBudget&&pkgSessionList.length>=pkg.minSessions&&<div className="mt-5 flex justify-end"><GlowBtn onClick={()=>setStep(2)}>Dalej - wypelnij dane</GlowBtn></div>}
            {pkgUsed>=pkgBudget&&pkgSessionList.length<pkg.minSessions&&<div className="font-mono text-xs text-cs-red mt-4">Rozloz godziny na min. {pkg.minSessions} sesje</div>}
          </>}

          {/* Editing slots for a specific day in package mode */}
          {pkgEditDate&&step===0&&<RevealDiv><div className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
              <div>
                <div className="font-mono text-[11px] tracking-[0.2em] mb-1" style={{color:"#64B4FF"}}>WYBIERZ GODZINY — {pkgEditDate}</div>
                <div className="font-mono text-xs text-cs-dim">Pozostalo: {pkgRemaining}h z {pkgBudget}h</div>
              </div>
              {(pkgSlots[pkgEditDate]||[]).length>0&&<div className="text-right">
                <div className="font-display text-xl" style={{color:"#64B4FF"}}>{Math.min(...pkgSlots[pkgEditDate])}:00 - {Math.max(...pkgSlots[pkgEditDate])+1}:00</div>
                <div className="font-mono text-xs text-cs-dim">{pkgSlots[pkgEditDate].length}h</div>
              </div>}
            </div>
            <SlotPicker date={pkgEditDate} hours={pkgSlots[pkgEditDate]||[]} onToggle={(h)=>pkgToggle(pkgEditDate,h)} canToggle={(h)=>pkgCanSel(pkgEditDate,h)} accentColor="#64B4FF"/>
            <div className="mt-5 flex justify-end"><GlowBtn ghost onClick={()=>setPkgEditDate(null)}>Gotowe</GlowBtn></div>
          </div></RevealDiv>}

          {/* Package form */}
          {step===2&&<RevealDiv><div className="bg-cs-card border border-[rgba(100,180,255,0.15)] rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{background:"linear-gradient(90deg, transparent, rgba(100,180,255,0.3), transparent)"}}/>
            <div className="font-mono text-[11px] tracking-[0.2em] mb-2" style={{color:"#64B4FF"}}>// DANE — PAKIET {pkg.name.toUpperCase()}</div>
            <FormFields/>
            {err&&<div className="font-mono text-sm text-cs-red mt-5 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}
            <div className="flex gap-4 mt-8"><GlowBtn onClick={()=>{if(validate())setStep(3)}} disabled={Object.keys(fieldErr).length>0}>Dalej</GlowBtn><GlowBtn ghost onClick={()=>setStep(0)}>Wroc</GlowBtn></div>
          </div></RevealDiv>}

          {/* Package summary + payment */}
          {step===3&&<RevealDiv><div className="bg-cs-card border border-[rgba(100,180,255,0.2)] rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg, transparent, #64B4FF, transparent)"}}/>
            <div className="font-mono text-[11px] tracking-[0.2em] mb-2" style={{color:"#64B4FF"}}>// PODSUMOWANIE PAKIETU</div>
            <h3 className="font-display text-2xl text-cs-white uppercase mb-6">Pakiet {pkg.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="font-mono text-[10px] text-cs-dim mb-2">SESJE ({pkgSessionList.length})</div>
                <div className="space-y-1">{pkgSessionList.map((s,i)=><div key={i} className="flex justify-between p-3 rounded-sm" style={{background:"rgba(100,180,255,0.04)",border:"1px solid rgba(100,180,255,0.1)"}}>
                  <span className="font-mono text-sm text-cs-text">{s.date}</span>
                  <span className="font-mono text-sm" style={{color:"#64B4FF"}}>{s.hour}:00-{s.hour+s.duration}:00 ({s.duration}h)</span>
                </div>)}</div>
                <div className="font-mono text-[10px] text-cs-dim mt-4 mb-2">KLIENT</div>
                <div className="p-3 rounded-sm" style={{background:"rgba(5,8,16,0.5)",border:"1px solid #1A1F2B"}}><div className="font-body text-base text-cs-text">{form.name}</div><div className="font-mono text-[11px] text-cs-dim">{form.email} | {form.phone}</div></div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-cs-dim mb-2">CENA</div>
                <div className="p-5 rounded-sm" style={{background:"rgba(5,8,16,0.5)",border:"1px solid #1A1F2B"}}>
                  <div className="flex justify-between py-2 border-b border-cs-line"><span className="font-body text-sm text-cs-muted">Cena regularna ({pkgBudget}h x {HOURLY_RATE} zl)</span><span className="font-mono text-sm text-cs-dim line-through">{pkgBudget*HOURLY_RATE} zl</span></div>
                  <div className="flex justify-between py-2 border-b border-cs-line"><span className="font-body text-sm" style={{color:"#64B4FF"}}>Pakiet {pkg.name} ({pkg.discount})</span><span className="font-mono text-sm" style={{color:"#64B4FF"}}>-{pkgBudget*HOURLY_RATE - pkg.price} zl</span></div>
                  <div className="flex justify-between py-3 mt-2"><span className="font-display text-lg text-cs-white">DO ZAPLATY</span><span className="font-display text-2xl font-bold" style={{color:"#64B4FF"}}>{pkg.price} zl</span></div>
                </div>
                <PayButtons onPay={bookPackage}/>
              </div>
            </div>
            {err&&<div className="font-mono text-sm text-cs-red mb-4 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}
            <div className="flex gap-4"><GlowBtn ghost onClick={()=>setStep(2)}>Wroc</GlowBtn></div>
          </div></RevealDiv>}
        </>}
      </>}
    </Sect></div>
  );
}
