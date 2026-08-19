import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "translation not implemented yet" },
    { status: 501 },
  );
}
