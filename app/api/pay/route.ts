import { NextRequest, NextResponse } from "next/server";

const P24_BASE = process.env.P24_SANDBOX === "true"
  ? "https://sandbox.przelewy24.pl"
  : "https://secure.przelewy24.pl";

function sha384(data: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha384").update(data, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { amount, description, email, name, phone, bookingId } = await req.json();

    const merchantId = process.env.P24_MERCHANT_ID;
    const posId = process.env.P24_POS_ID || merchantId;
    const apiKey = process.env.P24_API_KEY;
    const crc = process.env.P24_CRC;

    if (!merchantId || !apiKey || !crc) {
      return NextResponse.json({ error: "Przelewy24 nie skonfigurowane" }, { status: 500 });
    }

    const host = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
    const sessionId = "CS-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const amountGr = Math.round(amount * 100); // Przelewy24 uses grosze

    // Sign: SHA384(sessionId|merchantId|amount|currency|crc)
    const sign = sha384(`{"sessionId":"${sessionId}","merchantId":${merchantId},"amount":${amountGr},"currency":"PLN","crc":"${crc}"}`);

    const auth = Buffer.from(`${posId}:${apiKey}`).toString("base64");

    const orderData = {
      merchantId: Number(merchantId),
      posId: Number(posId),
      sessionId,
      amount: amountGr,
      currency: "PLN",
      description: description || "Caseout Studio",
      email: email || "",
      client: name || "",
      phone: phone || "",
      country: "PL",
      language: "pl",
      urlReturn: host + "/rezerwacje?payment=success",
      urlStatus: host + "/api/pay/notify",
      sign,
    };

    const res = await fetch(P24_BASE + "/api/v1/transaction/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + auth,
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (data.data?.token) {
      return NextResponse.json({
        redirectUrl: P24_BASE + "/trnRequest/" + data.data.token,
        token: data.data.token,
        sessionId,
      });
    }

    console.error("P24 error:", JSON.stringify(data));
    return NextResponse.json({ error: data.error || "Blad Przelewy24" }, { status: 500 });
  } catch (e: any) {
    console.error("P24 error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
