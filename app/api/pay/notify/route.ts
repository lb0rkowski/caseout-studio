import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = body.order;
    if (order && order.status === "COMPLETED") {
      // Extract booking ID from extOrderId if we set it
      const extId = order.extOrderId;
      if (extId) {
        const admin = getAdmin();
        await admin.from("bookings").update({ status: "confirmed" }).eq("id", parseInt(extId));
      }
    }
    return NextResponse.json({ status: "OK" });
  } catch (e: any) {
    console.error("PayU notify error:", e);
    return NextResponse.json({ status: "OK" });
  }
}
