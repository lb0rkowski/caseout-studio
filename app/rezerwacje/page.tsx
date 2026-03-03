"use client";
import { useState } from "react";
import { SectionHead, Sect, RevealDiv, GlowBtn } from "@/components/ui";
import { useBookings } from "@/lib/store";
import { SESSION_TYPES, Booking } from "@/lib/data";

const MO=["Styczen","Luty","Marzec","Kwiecien","Maj","Czerwiec","Lipiec","Sierpien","Wrzesien","Pazdziernik","Listopad","Grudzien"];
const DN=["Pn","Wt","Sr","Cz","Pt","Sb","Nd"];

function getStudioHours(dayOfWeek: number): [number, number] | null {
  if (dayOfWeek === 6) return null; // niedziela
  if (dayOfWeek === 5) return [12, 20]; // sobota
  return [10, 22]; // pon-pt
}

function makeGCalUrl(b: Booking) {
  const d = b.date.replace(/-/g, "");
  const sh = String(b.hour).padStart(2, "0");
  const eh = String(b.hour + b.duration).padStart(2, "0");
  const start = d + "T" + sh + "0000";
  const end = d + "T" + eh + "0000";
  const typeName = SESSION_TYPES.find(s => s.id === b.type)?.name || b.type;
  const title = encodeURIComponent("Caseout Studio - " + typeName);
  const details = encodeURIComponent("Klient: " + b.name + "\nEmail: " + b.email + "\nTelefon: " + b.phone + (b.notes ? "\nUwagi: " + b.notes : ""));
  const location = encodeURIComponent("Caseout Studio, ul. Kopernika 30, Warszawa");
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + title + "&dates=" + start + "/" + end + "&details=" + details + "&location=" + location + "&ctz=Europe/Warsaw";
}

export default function RezerwacjePage(){
  const{bookings,loading,addBooking}=useBookings();
  const[cur,setCur]=useState(new Date());
  const[selDate,setSelDate]=useState<string|null>(null);
  const[selHours,setSelHours]=useState<number[]>([]);
  const[step,setStep]=useState(0); // 0=calendar, 1=slots, 2=form
  const[form,setForm]=useState({name:"",email:"",phone:"",type:"recording",notes:""});
  const[confirm,setConfirm]=useState<Booking|null>(null);
  const[busy,setBusy]=useState(false);
  const[err,setErr]=useState("");
  const[fieldErr,setFieldErr]=useState<Record<string,string>>({});

  const yr=cur.getFullYear(),mo=cur.getMonth(),dim=new Date(yr,mo+1,0).getDate(),fd=(new Date(yr,mo,1).getDay()+6)%7;
  const today=new Date().toISOString().slice(0,10);

  // Which hours are booked on selected date
  const bookedHours = (date: string): Set<number> => {
    const set = new Set<number>();
    bookings.filter(b => b.date === date && b.status === "confirmed").forEach(b => {
      for (let h = b.hour; h < b.hour + b.duration; h++) set.add(h);
    });
    return set;
  };

  const selectDate = (day: number) => {
    const ds = yr + "-" + String(mo+1).padStart(2,"0") + "-" + String(day).padStart(2,"0");
    const dow = (new Date(ds).getDay() + 6) % 7; // 0=pon, 6=nd
    if (dow === 6) return; // niedziela
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

    if (selHours.length === 0) {
      setSelHours([h]);
      return;
    }

    // Already selected? Remove from end
    if (selHours.includes(h)) {
      if (h === selHours[selHours.length - 1]) {
        setSelHours(selHours.slice(0, -1));
      } else if (h === selHours[0] && selHours.length > 1) {
        setSelHours(selHours.slice(1));
      }
      return;
    }

    // Must be adjacent to current selection
    const min = Math.min(...selHours);
    const max = Math.max(...selHours);

    if (h === max + 1) {
      // Check no booked hours in between
      setSelHours([...selHours, h]);
    } else if (h === min - 1) {
      setSelHours([h, ...selHours]);
    }
    // else: not adjacent, start new selection
    else {
      setSelHours([h]);
    }
  };

  const canSelect = (h: number): boolean => {
    if (!selDate) return false;
    const booked = bookedHours(selDate);
    if (booked.has(h)) return false;
    if (selHours.length === 0) return true;
    if (selHours.includes(h)) return true;
    const min = Math.min(...selHours);
    const max = Math.max(...selHours);
    return h === max + 1 || h === min - 1;
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return digits.slice(0,3) + " " + digits.slice(3);
    return digits.slice(0,3) + " " + digits.slice(3,6) + " " + digits.slice(6);
  };

  const handlePhone = (val: string) => {
    const formatted = formatPhone(val);
    setForm({...form, phone: formatted});
    const digits = formatted.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 9) setFieldErr(p => ({...p, phone: "Numer musi miec 9 cyfr"}));
    else setFieldErr(p => {const n = {...p}; delete n.phone; return n;});
  };

  const handleEmail = (val: string) => {
    setForm({...form, email: val});
    if (val.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) setFieldErr(p => ({...p, email: "Nieprawidlowy format email"}));
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
    const digits = form.phone.replace(/\D/g, "");
    if (!form.phone || digits.length !== 9) fe.phone = "Podaj 9-cyfrowy numer telefonu";
    setFieldErr(fe);
    return Object.keys(fe).length === 0;
  };

  const goToForm = () => {
    if (selHours.length === 0) { setErr("Wybierz przynajmniej 1 godzine"); return; }
    setStep(2);
    setErr("");
  };

  const book = async () => {
    if (!validate()) return;
    if (!selDate || selHours.length === 0) { setErr("Wybierz termin"); return; }

    const startHour = Math.min(...selHours);
    const duration = selHours.length;

    setBusy(true); setErr("");
    const result = await addBooking({
      date: selDate, hour: startHour, duration,
      type: form.type, name: form.name, email: form.email,
      phone: form.phone, notes: form.notes, status: "confirmed"
    });
    setBusy(false);
    if (result.booking) {
      setConfirm(result.booking); setStep(0); setSelDate(null); setSelHours([]);
      setForm({name: "", email: "", phone: "", type: "recording", notes: ""}); setFieldErr({});
    } else {
      setErr(result.error || "Blad serwera");
    }
  };

  const inp = "w-full p-3.5 md:p-4 bg-cs-deep border rounded-sm text-cs-text font-body text-sm md:text-base outline-none transition-all duration-300";
  const errBorder = "border-[rgba(139,48,48,0.5)]";
  const okBorder = "border-cs-line";

  // Get studio hours for selected date
  const selDow = selDate ? (new Date(selDate).getDay() + 6) % 7 : 0;
  const studioH = selDate ? getStudioHours(selDow) : null;
  const booked = selDate ? bookedHours(selDate) : new Set<number>();

  return(
    <div className="pt-20 md:pt-28"><Sect>
      <SectionHead title="Rezerwacje" sub="book a session"/>

      {loading && <div className="text-center py-20"><div className="inline-block w-8 h-8 border-2 border-cs-gold-dim border-t-cs-gold rounded-full" style={{animation:"spin 0.8s linear infinite"}}/><div className="font-mono text-xs text-cs-dim mt-4 tracking-wider">LOADING...</div></div>}

      {confirm && <RevealDiv><div className="bg-[rgba(59,107,59,0.06)] border border-[rgba(59,107,59,0.2)] rounded-sm p-8 md:p-10 mb-8 text-center">
        <div className="font-display text-2xl md:text-3xl text-cs-green mb-3">Zarezerwowano!</div>
        <div className="font-body text-base md:text-lg text-cs-muted">{SESSION_TYPES.find(s=>s.id===confirm.type)?.name} | {confirm.date} | {confirm.hour}:00-{confirm.hour+confirm.duration}:00 ({confirm.duration}h)</div>
        <div className="font-mono text-xs text-cs-dim mt-3">Potwierdzenie: {confirm.email}</div>
        <div className="flex gap-3 justify-center mt-6">
          <GlowBtn ghost onClick={()=>setConfirm(null)}>OK</GlowBtn>
          <a href={makeGCalUrl(confirm)} target="_blank" rel="noopener noreferrer"><GlowBtn>Dodaj do Google Calendar</GlowBtn></a>
        </div>
      </div></RevealDiv>}

      {!loading && <>
        {/* Month nav */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>setCur(new Date(yr,mo-1))} className="bg-transparent border border-cs-line text-cs-muted px-4 py-2.5 cursor-pointer font-body text-base rounded-sm hover:border-cs-gold-dim transition-colors">&lsaquo;</button>
            <span className="font-display text-xl md:text-2xl text-cs-white min-w-[200px] md:min-w-[240px] text-center uppercase tracking-wide">{MO[mo]} {yr}</span>
            <button onClick={()=>setCur(new Date(yr,mo+1))} className="bg-transparent border border-cs-line text-cs-muted px-4 py-2.5 cursor-pointer font-body text-base rounded-sm hover:border-cs-gold-dim transition-colors">&rsaquo;</button>
          </div>
          {selDate && step > 0 && <button onClick={()=>{setStep(0);setSelDate(null);setSelHours([]);setErr("");}} className="font-mono text-[11px] text-cs-gold-dim hover:text-cs-gold cursor-pointer bg-transparent border border-cs-line px-4 py-2 rounded-sm transition-colors">&larr; Wrocdo kalendarza</button>}
        </div>

        {/* Calendar */}
        {step === 0 && <div className="bg-cs-card border border-cs-line rounded-sm overflow-hidden">
          <div className="grid grid-cols-7">
            {DN.map(d => <div key={d} className="py-3 px-1 text-center font-mono text-[11px] md:text-xs text-cs-dim border-b border-cs-line font-bold">{d}</div>)}
            {Array.from({length:fd}).map((_,i) => <div key={"e"+i} className="min-h-[70px] md:min-h-[100px] lg:min-h-[110px] border-b border-cs-line border-r border-r-[rgba(26,31,43,0.05)]"/>)}
            {Array.from({length:dim},(_,i) => {
              const day=i+1, ds=yr+"-"+String(mo+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
              const db=bookings.filter(b=>b.date===ds), di=(fd+i)%7, isSun=di===6;
              const isToday=today===ds, past=new Date(ds)<new Date(today);
              const isSat=di===5;
              return <div key={day} onClick={()=>!isSun&&!past&&selectDate(day)} className="min-h-[70px] md:min-h-[100px] lg:min-h-[110px] p-1.5 md:p-2.5 border-b border-cs-line border-r border-r-[rgba(26,31,43,0.05)] transition-colors hover:bg-[rgba(196,151,103,0.015)]" style={{opacity:past?0.3:1,cursor:isSun||past?"default":"pointer"}}>
                <div className="font-body text-sm md:text-base font-semibold w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center mb-1" style={{color:isToday?"#C49767":isSun?"#403830":"#D8D0C6",background:isToday?"rgba(196,151,103,0.1)":"transparent"}}>{day}</div>
                {db.map((b,bi) => <div key={bi} className="font-mono text-[9px] md:text-[10px] text-cs-gold-dim px-1.5 py-0.5 mb-0.5 rounded-sm truncate" style={{background:"rgba(196,151,103,0.07)",borderLeft:"2px solid rgba(196,151,103,0.3)"}}>{b.hour}:00-{b.hour+b.duration}:00</div>)}
                {isSun && <span className="font-mono text-[9px] text-cs-dim">OFF</span>}
                {isSat && !past && <span className="font-mono text-[9px] text-cs-dim">12-20</span>}
              </div>;
            })}
          </div>
        </div>}

        {/* SLOT PICKER */}
        {step === 1 && selDate && studioH && <RevealDiv>
          <div className="bg-cs-card border border-cs-line rounded-sm p-5 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div>
                <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-1">WYBIERZ GODZINY</div>
                <h3 className="font-display text-xl md:text-2xl text-cs-white uppercase">{selDate}</h3>
                <div className="font-mono text-[11px] text-cs-dim mt-1">Studio otwarte: {studioH[0]}:00 - {studioH[1]}:00</div>
              </div>
              {selHours.length > 0 && <div className="text-right">
                <div className="font-display text-2xl md:text-3xl text-cs-gold">{Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00</div>
                <div className="font-mono text-xs text-cs-dim">{selHours.length}h wybrano</div>
              </div>}
            </div>

            <div className="font-mono text-[10px] text-cs-dim mb-3 flex gap-4 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-cs-deep border border-cs-line"></span> Wolne</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{background:"rgba(196,151,103,0.3)",border:"1px solid #C49767"}}></span> Wybrane</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{background:"rgba(139,48,48,0.15)",border:"1px solid rgba(139,48,48,0.3)"}}></span> Zajete</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{background:"#0E1319",border:"1px solid #1A1F2B",opacity:0.3}}></span> Mozna dodac</span>
            </div>

            {/* Timeline */}
            <div className="space-y-1">
              {Array.from({length: studioH[1] - studioH[0]}, (_, i) => {
                const h = studioH[0] + i;
                const isBooked = booked.has(h);
                const isSelected = selHours.includes(h);
                const isSelectable = canSelect(h);
                const isFirst = isSelected && h === Math.min(...selHours);
                const isLast = isSelected && h === Math.max(...selHours);

                let bg = "#050810";
                let border = "#1A1F2B";
                let textColor = "#D8D0C6";
                let cursor = "pointer";
                let opacity = 1;

                if (isBooked) {
                  bg = "rgba(139,48,48,0.08)";
                  border = "rgba(139,48,48,0.25)";
                  textColor = "#8B3030";
                  cursor = "not-allowed";
                  opacity = 0.6;
                } else if (isSelected) {
                  bg = "rgba(196,151,103,0.12)";
                  border = "rgba(196,151,103,0.4)";
                  textColor = "#C49767";
                } else if (!isSelectable && selHours.length > 0) {
                  opacity = 0.25;
                  cursor = "default";
                }

                // Find who booked this hour
                const bookedBy = isBooked ? bookings.find(b => b.date === selDate && h >= b.hour && h < b.hour + b.duration) : null;

                return <div key={h} onClick={() => !isBooked && isSelectable && toggleHour(h)}
                  className="flex items-center gap-3 md:gap-4 rounded-sm transition-all duration-200 group"
                  style={{padding:"10px 16px", background: bg, border: "1px solid " + border, cursor, opacity}}>

                  {/* Time label */}
                  <div className="font-mono text-sm md:text-base font-bold w-[60px] flex-shrink-0" style={{color: textColor}}>{String(h).padStart(2,"0")}:00</div>

                  {/* Bar */}
                  <div className="flex-1 h-8 md:h-10 rounded-sm relative overflow-hidden" style={{
                    background: isSelected ? "rgba(196,151,103,0.15)" : isBooked ? "rgba(139,48,48,0.06)" : "rgba(5,8,16,0.5)",
                    border: isSelected ? "1px solid rgba(196,151,103,0.25)" : "1px solid transparent"
                  }}>
                    {isSelected && <div className="absolute inset-0 flex items-center px-3">
                      <div className="font-mono text-[10px] md:text-[11px] text-cs-gold tracking-wider">
                        {isFirst && selHours.length > 0 ? "START " + h + ":00" : ""}
                        {isLast && selHours.length > 1 ? "KONIEC " + (h+1) + ":00" : ""}
                        {!isFirst && !isLast && isSelected ? "" : ""}
                      </div>
                    </div>}
                    {isBooked && bookedBy && <div className="absolute inset-0 flex items-center px-3">
                      <div className="font-mono text-[10px] md:text-[11px] text-cs-red opacity-70">ZAJETE</div>
                    </div>}
                    {!isBooked && !isSelected && isSelectable && selHours.length > 0 && <div className="absolute inset-0 flex items-center px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="font-mono text-[10px] text-cs-dim">+ kliknij aby dodac</div>
                    </div>}
                  </div>

                  {/* End time */}
                  <div className="font-mono text-[11px] text-cs-dim w-[50px] text-right flex-shrink-0">{String(h+1).padStart(2,"0")}:00</div>
                </div>;
              })}
            </div>

            {selHours.length > 0 && <div className="mt-6 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" style={{background:"rgba(196,151,103,0.04)",border:"1px solid rgba(196,151,103,0.12)"}}>
              <div>
                <div className="font-display text-lg md:text-xl text-cs-gold">{Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00</div>
                <div className="font-mono text-xs text-cs-dim">{selHours.length} {selHours.length===1?"godzina":selHours.length<5?"godziny":"godzin"}</div>
              </div>
              <GlowBtn onClick={goToForm}>Dalej - wypelnij dane</GlowBtn>
            </div>}

            {err && <div className="font-mono text-sm text-cs-red mt-4 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}
          </div>
        </RevealDiv>}

        {/* FORM */}
        {step === 2 && selDate && <RevealDiv>
          <div className="bg-cs-card border border-[rgba(144,113,79,0.15)] rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{background:"linear-gradient(90deg, transparent, rgba(196,151,103,0.3), transparent)"}}/>
            <div className="font-mono text-[11px] text-cs-gold-dim tracking-[0.2em] mb-2">// NOWA REZERWACJA</div>
            <h3 className="font-display text-2xl md:text-3xl text-cs-white uppercase mb-2">Rezerwacja Sesji</h3>
            <div className="font-body text-base md:text-lg text-cs-muted mb-2">{selDate} | {Math.min(...selHours)}:00 - {Math.max(...selHours)+1}:00</div>
            <div className="font-mono text-xs text-cs-gold-dim mb-8">{selHours.length} {selHours.length===1?"godzina":selHours.length<5?"godziny":"godzin"}</div>

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
                {fieldErr.phone ? <div className="font-mono text-[11px] text-cs-red mt-1.5">{fieldErr.phone}</div> : <div className="font-mono text-[10px] text-cs-dim mt-1">{form.phone.replace(/\D/g,"").length}/9 cyfr</div>}
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[11px] text-cs-dim tracking-[0.15em] mb-2 block">UWAGI</label>
                <input className={inp+" "+okBorder} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="opcjonalnie - opisz projekt, ile trackow itp."/>
              </div>
            </div>

            {err && <div className="font-mono text-sm text-cs-red mt-5 p-3 rounded-sm" style={{background:"rgba(139,48,48,0.06)",border:"1px solid rgba(139,48,48,0.15)"}}>{err}</div>}

            <div className="flex gap-4 mt-8 flex-wrap">
              <GlowBtn onClick={book} disabled={busy||Object.keys(fieldErr).length>0}>{busy?"Wysylanie...":"Potwierdz Rezerwacje"}</GlowBtn>
              <GlowBtn ghost onClick={()=>{setStep(1);setErr("");}}>Wrocdo godzin</GlowBtn>
              <GlowBtn ghost onClick={()=>{setStep(0);setSelDate(null);setSelHours([]);setErr("");setFieldErr({});}}>Anuluj</GlowBtn>
            </div>
          </div>
        </RevealDiv>}
      </>}
    </Sect></div>
  );
}
