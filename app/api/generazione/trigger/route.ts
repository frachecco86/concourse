import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eseguiPipeline } from "@/lib/ai/generazione";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { concorsoId, materiaId } = body;

  if (!concorsoId) {
    return NextResponse.json({ error: "concorsoId è obbligatorio" }, { status: 400 });
  }

  // Avvia pipeline asincrona — response immediata
  eseguiPipeline(concorsoId, materiaId ?? null).catch((err) =>
    console.error("Pipeline error:", err)
  );

  return NextResponse.json({ status: "accepted" });
}
