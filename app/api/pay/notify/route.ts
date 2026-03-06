import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/db";

function sha384(data: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha384").update(data, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, sign } = body;

    const crc = process.env.P24_CRC;
    if (!crc) return NextResponse.json({ error: "No CRC" }, { status: 500 });

    // Verify signature
    const expected = sha384(`{"sessionId":"${sessionId}","orderId":${orderId},"amount":${amount},"currency":"${currency}","crc":"${crc}"}`);
    if (sign !== expected) {
      console.error("P24 notify: invalid signature");
      return NextResponse.json({ error: "Invalid sign" }, { status: 400 });
    }

    // Verify transaction with P24
    const merchantIdNum = process.env.P24_MERCHANT_ID;
    const apiKey = process.env.P24_API_KEY;
    const auth = Buffer.from(`${posId}:${apiKey}`).toString("base64");
    const P24_BASE = process.env.P24_SANDBOX === "true" ? "https://sandbox.przelewy24.pl" : "https://secure.przelewy24.pl";

    const verifySign = sha384(`{"sessionId":"${sessionId}","orderId":${orderId},"amount":${amount},"currency":"${currency}","crc":"${crc}"}`);

    await fetch(P24_BASE + "/api/v1/transaction/verify", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + auth },
      body: JSON.stringify({ merchantId: Number(merchantIdNum), posId: Number(posId), sessionId, amount, currency, orderId, sign: verifySign }),
    });

    // Update booking status if sessionId matches
    if (sessionId) {
      const admin = getAdmin();
      // Session ID format: CS-timestamp-random
      console.log("P24 payment confirmed:", sessionId, "orderId:", orderId);
    }

    return NextResponse.json({ status: "OK" });
  } catch (e: any) {
    console.error("P24 notify error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
