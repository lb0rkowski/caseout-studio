import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM messages ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
