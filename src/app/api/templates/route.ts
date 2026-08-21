import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.template.findMany();

  const shuffled = [...templates].sort(() => Math.random() - 0.5);

  return NextResponse.json({ templates: shuffled.slice(0, 4) });
}
