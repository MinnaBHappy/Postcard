import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { name, pin } = await request.json();

  if (name !== "MIN" && name !== "MOMOKA") {
    return NextResponse.json({ ok: false, error: "invalid name" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { name } });

  if (!user || user.pin !== pin) {
    return NextResponse.json(
      { ok: false, error: "PIN이 일치하지 않습니다" },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true });
}
