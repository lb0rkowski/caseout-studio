import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getAdmin } from "@/lib/db";


async function notifyAdmin(title: string, body: string) {
  try {
    const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

    const webpush = await import("web-push");
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || "mailto:kontakt@caseoutstudio.pl",
      VAPID_PUBLIC, VAPID_PRIVATE
    );

    const admin = getAdmin();
    const { data: subs } = await admin.from("push_subscriptions").select("*").eq("active", true);
    if (!subs || subs.length === 0) return;

    const payload = JSON.stringify({ title, body, url: "/vault-x9k2m", tag: "booking-" + Date.now() });
    const stale: string[] = [];
    for (const sub of subs) {
      try {
        await webpush.sendNotification(JSON.parse(sub.sub_data), payload);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) stale.push(sub.endpoint);
      }
    }
    if (stale.length > 0) await admin.from("push_subscriptions").delete().in("endpoint", stale);
  } catch (e) { console.error("Push notify failed:", e); }
}
function genOrderNumber(): string {
  const d = new Date();
  const date = d.getFullYear().toString() + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return "CS-" + date + "-" + rand;
}

export async function GET() {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("bookings")
      .select("*")
      .order("date", { ascending: true })
      .order("hour", { ascending: true });
    if (error) throw error;
    return NextResponse.json(
      (data || []).map((r: any) => ({ ...r, notes: r.notes || "" }))
    );
  } catch (e: any) {
    console.error("GET /api/bookings error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Batch mode for packages: body.sessions = [{date, hour, duration}, ...]
    if (body.sessions && Array.isArray(body.sessions)) {
      const { sessions, type, name, email, phone, notes, package_id } = body;

      const errors: string[] = [];
      if (!name || name.trim().length < 3 || !name.trim().includes(" ")) errors.push("Podaj imie i nazwisko");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Podaj prawidlowy email");
      if (!phone || phone.replace(/\D/g, "").length < 7) errors.push("Podaj prawidlowy telefon");
      if (sessions.length === 0) errors.push("Brak sesji");
      if (errors.length > 0) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

      const admin = getAdmin();
      const orderNum = genOrderNumber();

      // Check conflicts for all sessions
      for (const sess of sessions) {
        const { data: existing } = await admin
          .from("bookings")
          .select("id, hour, duration")
          .eq("date", sess.date)
          .eq("status", "confirmed");
        const conflict = (existing || []).some(
          (b: any) => sess.hour < b.hour + b.duration && sess.hour + sess.duration > b.hour
        );
        if (conflict) {
          return NextResponse.json({ error: "Konflikt terminu: " + sess.date + " " + sess.hour + ":00" }, { status: 409 });
        }
      }

      // Insert all sessions
      const rows = sessions.map((sess: any) => ({
        date: sess.date,
        hour: sess.hour,
        duration: sess.duration,
        type: type || "recording",
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        notes: (notes || "").trim(),
        status: "confirmed",
        order_number: orderNum,
        package_id: package_id || null,
      }));

      const { data: newBookings, error } = await admin
        .from("bookings")
        .insert(rows)
        .select();

      if (error) throw error;
      notifyAdmin("Nowy pakiet", name.trim() + " | Pakiet " + (package_id || "") + " (" + sessions.length + " sesji)");
      return NextResponse.json({ bookings: newBookings, order_number: orderNum }, { status: 201 });
    }

    // Single booking mode
    const { date, hour, duration, type, name, email, phone, notes, status } = body;
    const errors: string[] = [];
    if (!name || name.trim().length < 3 || !name.trim().includes(" ")) errors.push("Podaj imie i nazwisko");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Podaj prawidlowy email");
    if (!phone || phone.replace(/\D/g, "").length < 7) errors.push("Podaj prawidlowy telefon");
    if (!date) errors.push("Nieprawidlowa data");
    if (hour == null || hour < 0 || hour > 23) errors.push("Nieprawidlowa godzina");
    if (errors.length > 0) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

    const admin = getAdmin();
    const dur = duration || 2;
    const orderNum = genOrderNumber();

    const { data: existing } = await admin
      .from("bookings")
      .select("id, hour, duration")
      .eq("date", date)
      .eq("status", "confirmed");
    const conflict = (existing || []).some(
      (b: any) => hour < b.hour + b.duration && hour + dur > b.hour
    );
    if (conflict) return NextResponse.json({ error: "Ten termin jest juz zajety" }, { status: 409 });

    const { data: newBooking, error } = await admin
      .from("bookings")
      .insert({
        date, hour, duration: dur, type: type || "recording",
        name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(),
        notes: (notes || "").trim(), status: status || "confirmed",
        order_number: orderNum,
      })
      .select()
      .single();

    if (error) throw error;
    notifyAdmin("Nowa rezerwacja", name.trim() + " | " + date + " " + hour + ":00 (" + dur + "h)");
    return NextResponse.json({ ...newBooking, order_number: orderNum, notes: newBooking.notes || "" }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/bookings error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const admin = getAdmin();
    const { error } = await admin.from("bookings").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("DELETE /api/bookings error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
