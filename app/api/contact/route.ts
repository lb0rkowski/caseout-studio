import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const admin = getAdmin();
    const { error } = await admin
      .from("messages")
      .insert({ name, email, message });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("POST /api/contact error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
