import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getAdmin } from "@/lib/db";

export async function GET() {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("bookings")
      .select("*")
      .order("date", { ascending: true })
      .order("hour", { ascending: true });

    if (error) throw error;

    const bookings = (data || []).map((r: any) => ({
      ...r,
      date: r.date,
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

    const sb = getSupabase();

    const { data, error } = await sb
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
