"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";
import { useBookings } from "@/lib/store";
import { SESSION_TYPES, PACKAGES, HOURLY_RATE, WEEKEND_SURCHARGE, Booking } from "@/lib/data";

const MO=["Styczen","Luty","Marzec","Kwiecien","Maj","Czerwiec","Lipiec","Sierpien","Wrzesien","Pazdziernik","Listopad","Grudzien"];
const DN=["Pn","Wt","Sr","Cz","Pt","Sb","Nd"];

function getStudioHours(dayOfWeek: number): [number, number] | null {
  if (dayOfWeek === 6) return null;
  if (dayOfWeek === 5) return [12, 20];
  return [10, 22];
}

function isWeekend(date: string): boolean {
  const dow = (new Date(date).getDay() + 6) % 7;
  return dow === 5; // sobota
}

function calcPrice(hours: number, weekend: boolean): number {
  const rate = weekend ? HOURLY_RATE + WEEKEND_SURCHARGE : HOURLY_RATE;
  return hours * rate;
}

export default function RezerwacjePage(){
  const{bookings,loading,addBooking}=useBookings();
  const[cur,setCur]=useState(new Date());
  const[selDate,setSelDate]=useState<string|null>(null);
  const[selHours,setSelHours]=useState<number[]>([]);
  const[step,setStep]=useState(0); // 0=calendar, 1=slots, 2=form, 3=summary
  const[form,setForm]=useState({name:"",email:"",phone:"",type:"recording",notes:""});
  const[selPackage,setSelPackage]=useState<string|null>(null);
  const[confirm,setConfirm]=useState<Booking|null>(null);
  const[busy,setBusy]=useState(false);
  const[payBusy,setPayBusy]=useState(false);
  const[err,setErr]=useState("");
  const[fieldErr,setFieldErr]=useState<Record<string,string>>({});
  const[paymentSuccess,setPaymentSuccess]=useState(false);

  // Check for payment success in URL
  useEffect(()=>{
    if(typeof window !== "undefined"){
      const params = new URLSearchParams(window.location.search);
      if(params.get("payment")==="success") setPaymentSuccess(true);
    }
  },[]);

  const yr=cur.getFullYear(),mo=cur.getMonth(),dim=new Date(yr,mo+1,0).getDate(),fd=(new Date(yr,mo,1).getDay()+6)%7;
  const today=new Date().toISOString().slice(0,10);

  const bookedHours = (date: string): Set<number> => {
    const set = new Set<number>();
    bookings.filter(b => b.date === date && b.status === "confirmed").forEach(b => {
      for (let h = b.hour; h < b.hour + b.duration; h++) set.add(h);
    });
    return set;
  };

  const selectDate = (day: number) => {
    const ds = yr + "-" + String(mo+1).padStart(2,"0") + "-" + String(day).padStart(2,"0");
    const dow = (new Date(ds).getDay() + 6) % 7;
    if (dow === 6) return;
    if (new Date(ds) < new Date(today)) return;
    setSelDate(ds);
    setSelHours([]);
    setStep(1);
    setErr("");
    setFieldErr({});
  };

  const toggleHour = (h: number) => {
    if (!selDate) return;
    const booked = bookedHours(selDate);
    if (booked.has(h)) return;
    if (selHours.length === 0) { setSelHours([h]); return; }
    if (selHours.includes(h)) {
      if (h === selHours[selHours.length - 1]) setSelHours(selHours.slice(0, -1));
      else if (h === selHours[0] && selHours.length > 1) setSelHours(selHours.slice(1));
      return;
    }
    const min = Math.min(...selHours), max = Math.max(...selHours);
    if (h === max + 1) setSelHours([...selHours, h]);
    else if (h === min - 1) setSelHours([h, ...selHours]);
    else setSelHours([h]);
  };

  const canSelect = (h: number): boolean => {
    if (!selDate) return false;
    if (bookedHours(selDate).has(h)) return false;
    if (selHours.length === 0) return true;
    if (selHours.includes(h)) return true;
    const min = Math.min(...selHours), max = Math.max(...selHours);
    return h === max + 1 || h === min - 1;
  };

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.slice(0,3) + " " + d.slice(3);
    return d.slice(0,3) + " " + d.slice(3,6) + " " + d.slice(6);
  };

  const handlePhone = (val: string) => {
    const f = formatPhone(val); setForm({...form, phone: f});
    const d = f.replace(/\D/g, "");
    if (d.length > 0 && d.length < 9) setFieldErr(p => ({...p, phone: "Numer musi miec 9 cyfr"}));
    else setFieldErr(p => {const n = {...p}; delete n.phone; return n;});
  };
  const handleEmail = (val: string) => {
    setForm({...form, email: val});
    if (val.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) setFieldErr(p => ({...p, email: "Nieprawidlowy email"}));
    else setFieldErr(p => {const n = {...p}; delete n.email; return n;});
  };
  const handleName = (val: string) => {
    setForm({...form, name: val});
    if (val.length > 0 && val.trim().length < 2) setFieldErr(p => ({...p, name: "Min. 2 znaki"}));
    else setFieldErr(p => {const n = {...p}; delete n.name; return n;});
  };

  const validate = () => {
    const fe: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) fe.name = "Podaj imie (min. 2 znaki)";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fe.email = "Podaj prawidlowy email";
    if (!form.phone || form.phone.replace(/\D/g, "").length !== 9) fe.phone = "Podaj 9-cyfrowy telefon";
    setFieldErr(fe);
    return Object.keys(fe).length === 0;
  };

  const goToForm = () => {
    if (selHours.length === 0) { setErr("Wybierz przynajmniej 1 godzine"); return; }
    setStep(2); setErr("");
  };

  const goToSummary = () => {
    if (!validate()) return;
    setStep(3); setErr("");
  };

  const weekend = selDate ? isWeekend(selDate) : false;
  const totalPrice = selHours.length > 0 ? calcPrice(selHours.length, weekend) : 0;
  const ratePerHour = weekend ? HOURLY_RATE + WEEKEND_SURCHARGE : HOURLY_RATE;

  // Check if any package matches
  const matchingPackage = PACKAGES.find(p => parseInt(p.hours) === selHours.length);
  const packagePrice = matchingPackage ? parseInt(matchingPackage.price) : null;
  const finalPrice = (selPackage && packagePrice) ? packagePrice : totalPrice;

  const book = async (payMethod: "payu" | "onsite") => {
    if (!selDate || selHours.length === 0) return;
    const startHour = Math.min(...selHours);
    const duration = selHours.length;

    setBusy(true); setErr("");
    const notesWithPrice = form.notes + (form.notes ? " | " : "") + "Cena: " + finalPrice + " zl" + (selPackage ? " (pakiet " + selPackage + ")" : "") + " | Platnosc: " + (payMethod === "payu" ? "PayU online" : "na miejscu");

    const result = await addBooking({
      date: selDate, hour: startHour, duration,
      type: form.type, name: form.name, email: form.email,
      phone: form.phone, notes: notesWithPrice, status: "confirmed"
    });

    if (!result.booking) { setBusy(false); setErr(result.error || "Blad serwera"); return; }

    if (payMethod === "payu") {
      setPayBusy(true);
      try {
        const typeName = SESSION_TYPES.find(s => s.id === form.type)?.name || form.type;
        const payRes = await fetch("/api/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: result.booking.id,
            amount: finalPrice,
            description: "Caseout Studio - " + typeName + " " + selDate + " " + startHour + ":00-" + (startHour + duration) + ":00",
            email: form.email,
            name: form.name,
            phone: form.phone,
          }),
        });
        const payData = await payRes.json();
        if (payData.redirectUrl) {
          window.location.href = payData.redirectUrl;
          return;
        } else {
          // PayU not configured — fall back to confirmation
          setConfirm(result.booking);
          setErr("PayU niedostepne — rezerwacja zapisana, zaplac na miejscu");
        }
      } catch (e) {
        setConfirm(result.booking);
        setErr("Platnosc niedostepna — rezerwacja zapisana, zaplac na miejscu");
      }
      setPayBusy(false);
    } else {
      setConfirm(result.booking);
    }

    setBusy(false);
    setStep(0); setSelDate(null); setSelHours([]); setSelPackage(null);
    setForm({name: "", email: "", phone: "", type: "recording", notes: ""}); setFieldErr({});
  };

  const inp = "w-full p-3.5 md:p-4 bg-cs-deep border rounded-sm text-cs-text font-body text-sm md:text-base outline-none transition-all duration-300";
  const errBorder = "border-[rgba(139,48,48,0.5)]";
  const okBorder = "border-cs-line";

  const selDow = selDate ? (new Date(selDate).getDay() + 6) % 7 : 0;
  const studioH = selDate ? getStudioHours(selDow) : null;
  const booked = selDate ? bookedHours(selDate) : new Set<number>();

  return(
    <div className="pt-20 md:pt-28"><Sect>
      <SectionHead title="Rezerwacje" sub="book a session"/>

      {loading && <div className="text-center py-20"><div className="inline-block w-8 h-8 border-2 border-cs-gold-dim border-t-cs-gold rounded-full" style={{animation:"spin 0.8s linear infinite"}}/></div>}

      {/* Payment success message */}
      {paymentSuccess && <RevealDiv><div className="bg-[rgba(59,107,59,0.06)] border border-[rgba(59,107,59,0.2)] rounded-sm p-8 mb-8 text-center">
        <div className="font-display text-2xl text-cs-green mb-2">Platnosc przyjeta!</div>
        <div className="font-body text-base text-cs-muted">Twoja rezerwacja zostala potwierdzona i oplacona.</div>
        <GlowBtn ghost onClick={()=>setPaymentSuccess(false)} className="mt-4">OK</GlowBtn>
      </div></RevealDiv>}

      {/* Confirmation */}
      {confirm && <RevealDiv><div className="bg-[rgba(59,107,59,0.06)] border border-[rgba(59,107,59,0.2)] rounded-sm p-8 md:p-10 mb-8 text-center">
        <div className="font-display text-2xl md:text-3xl text-cs-green mb-3">Zarezerwowano!</div>
        <div className="font-body text-base md:text-lg text-cs-muted">{SESSION_TYPES.find(s=>s.id===confirm.type)?.name} | {confirm.date} | {confirm.hour}:00-{confirm.hour+confirm.duration}:00 ({confirm.duration}h)</div>
        <div className="font-mono text-xs text-cs-dim mt-3">Potwierdzenie wyslane na: {confirm.email}</div>
        {err && <div className="font-mono text-xs text-cs-gold-dim mt-2">{err}</div>}
        <GlowBtn ghost onClick={()=>{setConfirm(null);setErr("");}} className="mt-5">OK</GlowBtn>
      </div></RevealDiv>}

      {!loading && <>
        {/* Month nav */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>setCur(new Date(yr,mo-1))} className="bg-transparent border border-cs-line text-cs-muted px-4 py-2.5 cursor-pointer font-body text-base rounded-sm hover:border-cs-gold-dim transition-colors">&lsaquo;</button>
            <span className="font-display text-xl md:text-2xl text-cs-white min-w-[200px] md:min-w-[240px] text-center uppercase tracking-wide">{MO[mo]} {yr}</span>
            <button onClick={()=>setCur(new Date(yr,mo+1))} className="bg-transparent border border-cs-line text-cs-muted px-4 py-2.5 cursor-pointer font-body text-base rounded-sm hover:border-cs-gold-dim transition-colors">&rsaquo;</button>
          </div>
          {selDate && step > 0 && <button onClick={()=>{setStep(0);setSelDate(null);setSelHours([]);setErr("");setSelPackage(null);}} className="font-mono text-[11px] text-cs-gold-dim hover:text-cs-gold cursor-pointer bg-transparent border border-cs-line px-4 py-2 rounded-sm transition-colors">&larr; Wroc do kalendarza</button>}
        </div>

        {/* Price info bar */}
        {step >= 1 && selDate && <div className="mb-5 p-3 rounded-sm flex flex-wrap items-center justify-between gap-2" style={{background:"rgba(196,151,103,0.04)",border:"1px solid rgba(196,151,103,0.1)"}}>
          <div className="font-mono text-xs text-cs-dim">Stawka: <span className="text-cs-gold font-bold">{ratePerHour} zl/h</span>{weekend && <span className="text-cs-gold-dim ml-1">(+{WEEKEND_SURCHARGE} zl weekend)</span>}</div>
          {selHours.length > 0 && <div className="font-mono text-xs text-cs-dim">Razem: <span className="text-cs-gold font-bold text-sm">{totalPrice} zl</span> za {selHours.length}h</div>}
        </div>}

        {/* ══ CALENDAR ══ */}
        {step === 0 && <div className="bg-cs-card border border-cs-line rounded-sm overflow-hidden">
          <div className="grid grid-cols-7">
            {DN.map(d => <div key={d} className="py-3 px-1 text-center font-mono text-[11px] md:text-xs text-cs-dim border-b border-cs-line font-bold">{d}</div>)}
            {Array.from({length:fd}).map((_,i) => <div key={"e"+i} className="min-h-[70px] md:min-h-[100px] lg:min-h-[110px] border-b border-cs-line border-r border-r-[rgba(26,31,43,0.05)]"/>)}
            {Array.from({length:dim},(_,i) => {
              const day=i+1, ds=yr+"-"+String(mo+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
              const db=bookings.filter(b=>b.date===ds), di=(fd+i)%7, isSun=di===6;
              const isToday_=today===ds, past=new Date(ds)<new Date(today);
              const isSat=di===5;
              const rate = isSat ? HOURLY_RATE + WEEKEND_SURCHARGE : HOURLY_RATE;
              return <div key={day} onClick={()=>!isSun&&!past&&selectDate(day)} className="min-h-[70px] md:min-h-[100px] lg:min-h-[110px] p-1.5 md:p-2.5 border-b border-cs-line border-r border-r-[rgba(26,31,43,0.05)] transition-colors hover:bg-[rgba(196,151,103,0.015)]" style={{opacity:past?0.3:1,cursor:isSun||past?"default":"pointer"}}>
                <div className="font-body text-sm md:text-base font-semibold w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center mb-1" style={{color:isToday_?"#C49767":isSun?"#403830":"#D8D0C6",background:isToday_?"rgba(196,151,103,0.1)":"transparent"}}>{day}</div>
                {!isSun && !past && <div className="font-mono text-[9px] text-cs-gold-dim">{rate} zl/h</div>}
                {db.map((b,bi) => <div key={bi} className="font-mono text-[9px] md:text-[10px] text-cs-gold-dim px-1.5 py-0.5 mb-0.5 rounded-sm truncate" style={{background:"rgba(196,151,103,0.07)",borderLeft:"2px solid rgba(196,151,103,0.3)"}}>{b.hour}:00-{b.hour+b.duration}:00</div>)}
                {isSun && <span className="font-mono text-[9px] text-cs-dim">OFF</span>}
                {isSat && !past && <span className="font-mono text-[9px] text-cs-dim">12-20</span>}
              </div>;
            })}
          </div>
        </div>}

        {/* ══ SLOT PICKER ══ */}
        {step === 1 && selDate && studioH && <RevealDiv>
          <div className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div>
                <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-1">WYBIERZ GODZINY</div>
                <h3 className="font-display text-xl md:text-2xl text-cs-white uppercase">{selDate}{weekend && <span className="font-mono text-[11px] text-cs-gold-dim ml-3 normal-case">weekend +{WEEKEND_SURCHARGE} zl/h</span>}</h3>
                <div className="font-mono text-[11px] text-cs-dim mt-1">Studio: {studioH[0]}:00 - {studioH[1]}:00 | {ratePerHour} zl/h</div>
              </div>
              {selHours.length > 0 && <div className="text-right">
                <div className="font-display text-2xl md:text-3xl text-cs-gold">{Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00</div>
                <div className="font-mono text-xs text-cs-dim">{selHours.length}h = <span className="text-cs-gold font-bold">{totalPrice} zl</span></div>
              </div>}
            </div>

            <div className="font-mono text-[10px] text-cs-dim mb-3 flex gap-4 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-cs-deep border border-cs-line"></span> Wolne</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{background:"rgba(196,151,103,0.3)",border:"1px solid #C49767"}}></span> Wybrane</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{background:"rgba(139,48,48,0.15)",border:"1px solid rgba(139,48,48,0.3)"}}></span> Zajete</span>
            </div>

            <div className="space-y-1">
              {Array.from({length: studioH[1] - studioH[0]}, (_, i) => {
                const h = studioH[0] + i;
                const isBkd = booked.has(h);
                const isSel = selHours.includes(h);
                const canSel = canSelect(h);
                const isFirst = isSel && h === Math.min(...selHours);
                const isLast = isSel && h === Math.max(...selHours);

                let bg = "#050810", border = "#1A1F2B", tc = "#D8D0C6", cur = "pointer", op = 1.0;
                if (isBkd) { bg = "rgba(139,48,48,0.08)"; border = "rgba(139,48,48,0.25)"; tc = "#8B3030"; cur = "not-allowed"; op = 0.6; }
                else if (isSel) { bg = "rgba(196,151,103,0.12)"; border = "rgba(196,151,103,0.4)"; tc = "#C49767"; }
                else if (!canSel && selHours.length > 0) { op = 0.25; cur = "default"; }

                return <div key={h} onClick={() => !isBkd && canSel && toggleHour(h)}
                  className="flex items-center gap-3 md:gap-4 rounded-sm transition-all duration-200 group"
                  style={{padding:"10px 16px", background: bg, border: "1px solid " + border, cursor: cur, opacity: op}}>
                  <div className="font-mono text-sm md:text-base font-bold w-[60px] flex-shrink-0" style={{color: tc}}>{String(h).padStart(2,"0")}:00</div>
                  <div className="flex-1 h-8 md:h-10 rounded-sm relative overflow-hidden" style={{
                    background: isSel ? "rgba(196,151,103,0.15)" : isBkd ? "rgba(139,48,48,0.06)" : "rgba(5,8,16,0.5)",
                    border: isSel ? "1px solid rgba(196,151,103,0.25)" : "1px solid transparent"
                  }}>
                    {isSel && <div className="absolute inset-0 flex items-center justify-between px-3">
                      <div className="font-mono text-[10px] md:text-[11px] text-cs-gold tracking-wider">
                        {isFirst ? "START" : ""}{isLast && selHours.length > 1 ? "KONIEC" : ""}
                      </div>
                      <div className="font-mono text-[10px] text-cs-gold-dim">{ratePerHour} zl</div>
                    </div>}
                    {isBkd && <div className="absolute inset-0 flex items-center px-3"><div className="font-mono text-[10px] text-cs-red opacity-70">ZAJETE</div></div>}
                  </div>
                  <div className="font-mono text-[11px] text-cs-dim w-[50px] text-right flex-shrink-0">{String(h+1).padStart(2,"0")}:00</div>
                </div>;
              })}
            </div>

            {selHours.length > 0 && <div className="mt-6 p-4 rounded-sm" style={{background:"rgba(196,151,103,0.04)",border:"1px solid rgba(196,151,103,0.12)"}}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="font-display text-lg md:text-xl text-cs-gold">{Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00</div>
                  <div className="font-mono text-xs text-cs-dim">{selHours.length} {selHours.length===1?"godzina":selHours.length<5?"godziny":"godzin"} &times; {ratePerHour} zl = <span className="text-cs-gold font-bold text-sm">{totalPrice} zl</span></div>
                  {matchingPackage && <div className="font-mono text-[11px] text-cs-green mt-1">Pakiet "{matchingPackage.name}" dostepny za {matchingPackage.price} zl (oszczedzasz {totalPrice - parseInt(matchingPackage.price)} zl)</div>}
                </div>
                <GlowBtn onClick={goToForm}>Dalej</GlowBtn>
              </div>
            </div>}
            {err && <div className="font-mono text-sm text-cs-red mt-4 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}
          </div>
        </RevealDiv>}

        {/* ══ FORM ══ */}
        {step === 2 && selDate && <RevealDiv>
          <div className="bg-cs-card border border-[rgba(144,113,79,0.15)] rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{background:"linear-gradient(90deg, transparent, rgba(196,151,103,0.3), transparent)"}}/>
            <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-2">// DANE KONTAKTOWE</div>
            <h3 className="font-display text-2xl md:text-3xl text-cs-white uppercase mb-2">Rezerwacja Sesji</h3>
            <div className="font-body text-base text-cs-muted mb-1">{selDate} | {Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00 | {selHours.length}h</div>
            <div className="font-mono text-sm text-cs-gold mb-8">{totalPrice} zl</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">TYP SESJI</label>
                <select className={inp+" "+okBorder+" cursor-pointer"} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  {SESSION_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">IMIE *</label>
                <input className={inp+" "+(fieldErr.name?errBorder:okBorder)} value={form.name} onChange={e=>handleName(e.target.value)} placeholder="Twoje imie"/>
                {fieldErr.name && <div className="font-mono text-[11px] text-cs-red mt-1.5">{fieldErr.name}</div>}
              </div>
              <div>
                <label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">EMAIL *</label>
                <input className={inp+" "+(fieldErr.email?errBorder:okBorder)} type="email" value={form.email} onChange={e=>handleEmail(e.target.value)} placeholder="email@domena.pl"/>
                {fieldErr.email && <div className="font-mono text-[11px] text-cs-red mt-1.5">{fieldErr.email}</div>}
              </div>
              <div>
                <label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">TELEFON *</label>
                <input className={inp+" "+(fieldErr.phone?errBorder:okBorder)} value={form.phone} onChange={e=>handlePhone(e.target.value)} placeholder="XXX XXX XXX" maxLength={11} inputMode="numeric"/>
                {fieldErr.phone ? <div className="font-mono text-[11px] text-cs-red mt-1.5">{fieldErr.phone}</div> : <div className="font-mono text-[10px] text-cs-dim mt-1">{form.phone.replace(/\D/g,"").length}/9</div>}
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">UWAGI</label>
                <input className={inp+" "+okBorder} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="opcjonalnie"/>
              </div>
            </div>
            {err && <div className="font-mono text-sm text-cs-red mt-5 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}
            <div className="flex gap-4 mt-8 flex-wrap">
              <GlowBtn onClick={goToSummary} disabled={Object.keys(fieldErr).length>0}>Dalej - podsumowanie</GlowBtn>
              <GlowBtn ghost onClick={()=>setStep(1)}>Wroc do godzin</GlowBtn>
            </div>
          </div>
        </RevealDiv>}

        {/* ══ SUMMARY + PAYMENT ══ */}
        {step === 3 && selDate && <RevealDiv>
          <div className="bg-cs-card border border-[rgba(144,113,79,0.2)] rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg, transparent, #C49767, transparent)"}}/>
            <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-2">// PODSUMOWANIE</div>
            <h3 className="font-display text-2xl md:text-3xl text-cs-white uppercase mb-6">Podsumowanie</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left: booking details */}
              <div className="space-y-4">
                <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2">SESJA</div>
                <div className="p-4 rounded-sm" style={{background:"rgba(5,8,16,0.5)",border:"1px solid #1A1F2B"}}>
                  <div className="font-display text-lg text-cs-gold">{selDate}</div>
                  <div className="font-body text-base text-cs-text mt-1">{Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00 ({selHours.length}h)</div>
                  <div className="font-mono text-[11px] text-cs-dim mt-1">{SESSION_TYPES.find(s=>s.id===form.type)?.icon} {SESSION_TYPES.find(s=>s.id===form.type)?.name}</div>
                </div>
                <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mt-4 mb-2">KLIENT</div>
                <div className="p-4 rounded-sm" style={{background:"rgba(5,8,16,0.5)",border:"1px solid #1A1F2B"}}>
                  <div className="font-body text-base text-cs-text font-semibold">{form.name}</div>
                  <div className="font-mono text-[11px] text-cs-dim mt-1">{form.email}</div>
                  <div className="font-mono text-[11px] text-cs-dim">{form.phone}</div>
                  {form.notes && <div className="font-body text-sm text-cs-dim mt-2 italic">{form.notes}</div>}
                </div>
              </div>

              {/* Right: pricing */}
              <div>
                <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2">CENNIK</div>
                <div className="p-5 rounded-sm" style={{background:"rgba(5,8,16,0.5)",border:"1px solid #1A1F2B"}}>
                  <div className="flex justify-between py-2 border-b border-cs-line">
                    <span className="font-body text-base text-cs-muted">{selHours.length}h &times; {ratePerHour} zl/h</span>
                    <span className="font-mono text-base text-cs-text">{totalPrice} zl</span>
                  </div>
                  {weekend && <div className="flex justify-between py-2 border-b border-cs-line">
                    <span className="font-body text-sm text-cs-dim">w tym doplata weekendowa</span>
                    <span className="font-mono text-sm text-cs-dim">+{WEEKEND_SURCHARGE * selHours.length} zl</span>
                  </div>}

                  {/* Package option */}
                  {matchingPackage && <div className="mt-3 p-3 rounded-sm cursor-pointer transition-all" onClick={()=>setSelPackage(selPackage ? null : matchingPackage.name)}
                    style={{background: selPackage ? "rgba(59,107,59,0.08)" : "rgba(196,151,103,0.04)", border: "1px solid " + (selPackage ? "rgba(59,107,59,0.2)" : "rgba(196,151,103,0.1)")}}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm border flex items-center justify-center" style={{borderColor: selPackage ? "#3B6B3B" : "#1A1F2B"}}>
                        {selPackage && <div className="w-2.5 h-2.5 rounded-sm bg-cs-green"/>}
                      </div>
                      <span className="font-mono text-[11px] text-cs-green">Pakiet "{matchingPackage.name}" — {matchingPackage.price} zl</span>
                    </div>
                    <div className="font-mono text-[10px] text-cs-dim mt-1 ml-6">Oszczedzasz {totalPrice - parseInt(matchingPackage.price)} zl</div>
                  </div>}

                  <div className="flex justify-between py-3 mt-3 border-t-2 border-cs-gold-dim">
                    <span className="font-display text-lg text-cs-white uppercase">Do zaplaty</span>
                    <span className="font-display text-2xl text-cs-gold font-bold">{finalPrice} zl</span>
                  </div>
                </div>

                {/* Payment buttons */}
                <div className="mt-6 space-y-3">
                  <div className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2">METODA PLATNOSCI</div>
                  <button onClick={()=>book("payu")} disabled={busy||payBusy}
                    className="w-full p-4 rounded-sm font-mono text-sm transition-all cursor-pointer flex items-center justify-center gap-3"
                    style={{background:"rgba(196,151,103,0.08)",border:"1px solid rgba(196,151,103,0.25)",color:"#C49767"}}>
                    {payBusy ? "Przekierowanie do PayU..." : "Zaplac online (PayU - BLIK, karta, przelew)"}
                  </button>
                  <button onClick={()=>book("onsite")} disabled={busy}
                    className="w-full p-4 rounded-sm font-mono text-sm transition-all cursor-pointer flex items-center justify-center gap-3"
                    style={{background:"transparent",border:"1px solid #1A1F2B",color:"#706860"}}>
                    {busy ? "Zapisywanie..." : "Zaplac na miejscu (gotowka / karta)"}
                  </button>
                </div>
              </div>
            </div>

            {err && <div className="font-mono text-sm text-cs-red mt-4 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}
            <div className="flex gap-4 mt-6">
              <GlowBtn ghost onClick={()=>setStep(2)}>Wroc do danych</GlowBtn>
              <GlowBtn ghost onClick={()=>{setStep(0);setSelDate(null);setSelHours([]);setErr("");setSelPackage(null);setFieldErr({});}}>Anuluj</GlowBtn>
            </div>
          </div>
        </RevealDiv>}
      </>}
    </Sect></div>
  );
}
