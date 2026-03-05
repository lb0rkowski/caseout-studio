import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/db";

// Returns a signed upload URL for direct browser-to-Supabase upload
export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();
    if (!filename) return NextResponse.json({ error: "Brak nazwy pliku" }, { status: 400 });

    const ext = filename.split(".").pop()?.toLowerCase() || "mp3";
    const allowed = ["mp3", "wav", "ogg", "m4a", "flac"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Nieobslugiwany format. Dozwolone: " + allowed.join(", ") }, { status: 400 });
    }

    const admin = getAdmin();
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `beats/${timestamp}_${safeName}`;

    // Try to create bucket if needed
    try {
      await admin.storage.createBucket("audio", { public: true, fileSizeLimit: 10485760 });
    } catch (e) {
      // Bucket already exists — fine
    }

    // Create signed upload URL (valid 10 min, up to 200MB)
    const { data, error } = await admin.storage
      .from("audio")
      .createSignedUploadUrl(path);

    if (error) throw error;

    const { data: urlData } = admin.storage.from("audio").getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      publicUrl: urlData.publicUrl,
    });
  } catch (e: any) {
    console.error("Upload URL error:", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
