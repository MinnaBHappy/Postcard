import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { address } = await request.json();

  if (!address || typeof address !== "string") {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url, {
    headers: { "User-Agent": "wherearemybirds-postcard-app/1.0" },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "geocoding request failed" }, { status: 502 });
  }

  const results: { lat: string; lon: string; display_name: string }[] = await res.json();

  if (results.length === 0) {
    return NextResponse.json({ error: "주소를 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json({
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    displayName: results[0].display_name,
  });
}
