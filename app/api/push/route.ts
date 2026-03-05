import { NextRequest, NextResponse } from "next/server";
import { getAdmin, getSupabase } from "@/lib/db";

// Save push subscription
export async function POST(req: NextRequest) {
  try {
    const { subscription } = await req.json();
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const admin = getAdmin();

    // Upsert by endpoint
    const { error } = await admin
      .from("push_subscriptions")
      .upsert(
        { endpoint: subscription.endpoint, sub_data: JSON.stringify(subscription), active: true, updated_at: new Date().toISOString() },
        { onConflict: "endpoint" }
      );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Push subscribe error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Remove subscription
export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });

    const admin = getAdmin();
    await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Get subscription count
export async function GET() {
  try {
    const admin = getAdmin();
    const { count } = await admin.from("push_subscriptions").select("*", { count: "exact", head: true }).eq("active", true);
    return NextResponse.json({ count: count || 0 });
  } catch (e: any) {
    return NextResponse.json({ count: 0 });
  }
}
