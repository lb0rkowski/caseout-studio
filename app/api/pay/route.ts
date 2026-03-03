import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYU_BASE = process.env.PAYU_SANDBOX === "true"
  ? "https://secure.snd.payu.com"
  : "https://secure.payu.com";

async function getToken(): Promise<string> {
  const res = await fetch(PAYU_BASE + "/pl/standard/user/oauth/authorize", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.PAYU_CLIENT_ID || "",
      client_secret: process.env.PAYU_CLIENT_SECRET || "",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, amount, description, email, name, phone } = body;

    if (!amount || !email || !description) {
      return NextResponse.json({ error: "Brakuje danych" }, { status: 400 });
    }

    const posId = process.env.PAYU_POS_ID;
    if (!posId || !process.env.PAYU_CLIENT_ID) {
      return NextResponse.json({ error: "PayU nie skonfigurowane" }, { status: 500 });
    }

    const token = await getToken();
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "https://caseout-studio.vercel.app";

    const orderData = {
      notifyUrl: origin + "/api/pay/notify",
      continueUrl: origin + "/rezerwacje?payment=success",
      customerIp: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      merchantPosId: posId,
      description: description,
      currencyCode: "PLN",
      totalAmount: String(Math.round(amount * 100)),
      buyer: {
        email: email,
        firstName: name?.split(" ")[0] || "Klient",
        lastName: name?.split(" ").slice(1).join(" ") || "",
        phone: phone || "",
      },
      products: [
        {
          name: description,
          unitPrice: String(Math.round(amount * 100)),
          quantity: "1",
        },
      ],
    };

    const res = await fetch(PAYU_BASE + "/api/v2_1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(orderData),
      redirect: "manual",
    });

    // PayU returns 302 redirect to payment page
    if (res.status === 302 || res.status === 301) {
      const redirectUrl = res.headers.get("Location");
      return NextResponse.json({ redirectUrl });
    }

    const data = await res.json();
    if (data.redirectUri) {
      return NextResponse.json({ redirectUrl: data.redirectUri });
    }
    if (data.status?.statusCode === "SUCCESS" && data.orderId) {
      return NextResponse.json({ redirectUrl: data.redirectUri || origin + "/rezerwacje?payment=success" });
    }

    console.error("PayU error:", JSON.stringify(data));
    return NextResponse.json({ error: data.status?.statusDesc || "Blad PayU" }, { status: 500 });
  } catch (e: any) {
    console.error("POST /api/pay error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
