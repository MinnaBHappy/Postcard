import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "weather lookup not implemented yet" },
    { status: 501 },
  );
}
