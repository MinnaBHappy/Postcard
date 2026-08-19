import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ postcards: [] });
}

export async function POST() {
  return NextResponse.json(
    { message: "postcard creation not implemented yet" },
    { status: 501 },
  );
}
