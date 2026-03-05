import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { title, body, url, tag } = await req.json();
    
    const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
    const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:kontakt@caseoutstudio.pl";

    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
    }

    // Dynamic import web-push
    const webpush = await import("web-push");
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

    const admin = getAdmin();
    const { data: subs } = await admin.from("push_subscriptions").select("*").eq("active", true);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, reason: "no subscribers" });
    }

    const payload = JSON.stringify({ title: title || "Caseout Studio", body: body || "", url: url || "/vault-x9k2m", tag: tag || "booking-" + Date.now() });

    let sent = 0;
    let failed = 0;
    const stale: string[] = [];

    for (const sub of subs) {
      try {
        const subData = JSON.parse(sub.sub_data);
        await webpush.sendNotification(subData, payload);
        sent++;
      } catch (err: any) {
        failed++;
        // If subscription expired or invalid, mark for removal
        if (err.statusCode === 404 || err.statusCode === 410) {
          stale.push(sub.endpoint);
        }
      }
    }

    // Clean up stale subscriptions
    if (stale.length > 0) {
      await admin.from("push_subscriptions").delete().in("endpoint", stale);
    }

    return NextResponse.json({ sent, failed, cleaned: stale.length });
  } catch (e: any) {
    console.error("Push notify error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
