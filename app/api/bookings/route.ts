import { NextRequest, NextResponse } from "next/server";
import { supabase, getAdmin } from "@/lib/db";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("date", { ascending: true })
      .order("hour", { ascending: true });

    if (error) throw error;

    const bookings = (data || []).map((r: any) => ({
      ...r,
      date: r.date, // Supabase zwraca DATE jako string YYYY-MM-DD
      notes: r.notes || "",
    }));

    return NextResponse.json(bookings);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date, hour, duration, type, name, email, phone, notes, status } = await req.json();
    if (!date || hour == null || !name || !email || !phone)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Sprawdź kolizję
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("date", date)
      .eq("status", "confirmed");

    const conflict = (existing || []).some(
      (b: any) => hour < b.hour + b.duration && hour + (duration || 2) > b.hour
    );

    // Uproszczona kolizja — sprawdzamy po stronie klienta też
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        date, hour,
        duration: duration || 2,
        type: type || "recording",
        name, email, phone,
        notes: notes || "",
        status: status || "confirmed",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ...data, notes: data.notes || "" }, { status: 201 });
  } catch (e: any) {
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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
