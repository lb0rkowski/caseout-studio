import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM bookings ORDER BY date ASC, hour ASC");
    return NextResponse.json(rows.map(r => ({ ...r, date: new Date(r.date).toISOString().slice(0, 10), notes: r.notes || "" })));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const { date, hour, duration, type, name, email, phone, notes, status } = await req.json();
    if (!date || hour == null || !name || !email || !phone) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT id FROM bookings WHERE date=? AND status='confirmed' AND hour<? + ? AND hour + duration > ?",
      [date, hour, duration || 2, hour]
    );
    if (existing.length > 0) return NextResponse.json({ error: "Slot taken" }, { status: 409 });

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO bookings (date,hour,duration,type,name,email,phone,notes,status) VALUES (?,?,?,?,?,?,?,?,?)",
      [date, hour, duration || 2, type || "recording", name, email, phone, notes || "", status || "confirmed"]
    );
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM bookings WHERE id=?", [result.insertId]);
    const b = rows[0]; b.date = new Date(b.date).toISOString().slice(0, 10); b.notes = b.notes || "";
    return NextResponse.json(b, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.query("DELETE FROM bookings WHERE id=?", [id]);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
