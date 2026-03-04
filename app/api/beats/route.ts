import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getAdmin } from "@/lib/db";

export async function GET() {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("beats")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e: any) {
    console.error("GET /api/beats error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, bpm, key, tags, price, audio_url, cover_url, status } = body;
    if (!title) return NextResponse.json({ error: "Tytul wymagany" }, { status: 400 });

    const admin = getAdmin();
    const { data, error } = await admin
      .from("beats")
      .insert({
        title: title.trim(),
        bpm: bpm || 140,
        key: (key || "").trim(),
        tags: (tags || "").trim(),
        price: price || 200,
        audio_url: (audio_url || "").trim(),
        cover_url: (cover_url || "").trim(),
        status: status || "active",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/beats error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const admin = getAdmin();
    const { data, error } = await admin
      .from("beats")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("PUT /api/beats error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const admin = getAdmin();
    const { error } = await admin.from("beats").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("DELETE /api/beats error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
