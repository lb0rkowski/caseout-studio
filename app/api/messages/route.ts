import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/db";

export async function GET() {
  try {
    const admin = getAdmin();
    const { data, error } = await admin
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
