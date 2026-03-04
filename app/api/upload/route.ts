import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Brak pliku" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
    const allowed = ["mp3", "wav", "ogg", "m4a", "flac"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Nieobslugiwany format. Dozwolone: " + allowed.join(", ") }, { status: 400 });
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Plik za duzy (max 50MB)" }, { status: 400 });
    }

    const admin = getAdmin();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `beats/${timestamp}_${safeName}`;

    const { data, error } = await admin.storage
      .from("audio")
      .upload(path, buffer, {
        contentType: file.type || "audio/mpeg",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      // Try to create bucket if it doesn't exist
      if (error.message?.includes("not found") || error.message?.includes("Bucket")) {
        await admin.storage.createBucket("audio", { public: true, fileSizeLimit: 52428800 });
        const { data: retry, error: retryErr } = await admin.storage
          .from("audio")
          .upload(path, buffer, { contentType: file.type || "audio/mpeg", upsert: false });
        if (retryErr) throw retryErr;
        const { data: urlData } = admin.storage.from("audio").getPublicUrl(path);
        return NextResponse.json({ url: urlData.publicUrl, path });
      }
      throw error;
    }

    const { data: urlData } = admin.storage.from("audio").getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl, path });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
