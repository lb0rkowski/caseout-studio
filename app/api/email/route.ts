import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, orderNumber, name, sessions, totalPrice, packageName, payMethod } = await req.json();
    if (!to || !orderNumber) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("RESEND_API_KEY not set, skipping email");
      return NextResponse.json({ sent: false, reason: "no api key" });
    }

    const sessionsHtml = (sessions || []).map((s: any) =>
      "<tr><td style=\"padding:8px 12px;border-bottom:1px solid #1A1F2B;\">" + s.date + "</td><td style=\"padding:8px 12px;border-bottom:1px solid #1A1F2B;\">" + s.hour + ":00 - " + (s.hour + s.duration) + ":00</td><td style=\"padding:8px 12px;border-bottom:1px solid #1A1F2B;\">" + s.duration + "h</td></tr>"
    ).join("");

    const html = \`
      <div style="max-width:600px;margin:0 auto;background:#080C12;color:#D8D0C6;font-family:sans-serif;padding:40px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#C49767;font-size:24px;margin:0;">CASEOUT STUDIO</h1>
          <p style="color:#706860;font-size:12px;letter-spacing:2px;margin-top:8px;">POTWIERDZENIE REZERWACJI</p>
        </div>
        <div style="background:#0E1319;border:1px solid #1A1F2B;border-radius:4px;padding:24px;margin-bottom:20px;">
          <p style="color:#C49767;font-size:14px;letter-spacing:1px;margin:0 0 8px;">NUMER ZAMOWIENIA</p>
          <p style="color:#D4A87A;font-size:28px;font-weight:bold;margin:0;letter-spacing:2px;">\${orderNumber}</p>
        </div>
        <div style="background:#0E1319;border:1px solid #1A1F2B;border-radius:4px;padding:24px;margin-bottom:20px;">
          <p style="margin:0 0 4px;color:#706860;font-size:12px;">KLIENT</p>
          <p style="margin:0;font-size:16px;color:#D8D0C6;">\${name}</p>
          \${packageName ? '<p style="margin:8px 0 0;color:#C49767;font-size:14px;">Pakiet: ' + packageName + '</p>' : ''}
          <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;color:#D8D0C6;">
            <tr style="color:#706860;font-size:12px;">
              <td style="padding:8px 12px;border-bottom:1px solid #1A1F2B;">DATA</td>
              <td style="padding:8px 12px;border-bottom:1px solid #1A1F2B;">GODZINY</td>
              <td style="padding:8px 12px;border-bottom:1px solid #1A1F2B;">CZAS</td>
            </tr>
            \${sessionsHtml}
          </table>
        </div>
        <div style="background:#0E1319;border:1px solid #1A1F2B;border-radius:4px;padding:24px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#706860;font-size:14px;">Do zaplaty</span>
            <span style="color:#C49767;font-size:24px;font-weight:bold;">\${totalPrice} zl</span>
          </div>
          <p style="color:#706860;font-size:12px;margin:8px 0 0;">Platnosc: \${payMethod === 'payu' ? 'Online (PayU)' : 'Na miejscu'}</p>
        </div>
        <div style="text-align:center;padding:20px 0;border-top:1px solid #1A1F2B;">
          <p style="color:#706860;font-size:12px;margin:0;">Caseout Studio | ul. Kopernika 30, Warszawa</p>
          <p style="color:#403830;font-size:11px;margin:8px 0 0;">Ten email zostal wyslany automatycznie.</p>
        </div>
      </div>
    \`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Caseout Studio <noreply@resend.dev>",
        to: [to],
        subject: "Potwierdzenie rezerwacji " + orderNumber + " | Caseout Studio",
        html: html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return NextResponse.json({ sent: false, error: data });
    }
    return NextResponse.json({ sent: true, id: data.id });
  } catch (e: any) {
    console.error("Email error:", e);
    return NextResponse.json({ sent: false, error: e.message });
  }
}
