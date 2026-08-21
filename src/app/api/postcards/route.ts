import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { distanceKm } from "@/lib/geo";

export async function GET() {
  return NextResponse.json({ postcards: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    senderName,
    imageUrl,
    messageKo,
    messageJa,
    designTemplateId,
    senderLat,
    senderLng,
  } = body;

  if (senderName !== "MIN" && senderName !== "MOMOKA") {
    return NextResponse.json({ error: "invalid senderName" }, { status: 400 });
  }

  if (typeof senderLat !== "number" || typeof senderLng !== "number") {
    return NextResponse.json({ error: "sender location is required" }, { status: 400 });
  }

  const receiverName = senderName === "MIN" ? "MOMOKA" : "MIN";

  const [sender, receiver, pigeons] = await Promise.all([
    prisma.user.findUnique({ where: { name: senderName } }),
    prisma.user.findUnique({ where: { name: receiverName } }),
    prisma.pigeon.findMany(),
  ]);

  if (!sender || !receiver) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  if (pigeons.length === 0) {
    return NextResponse.json({ error: "no pigeons available" }, { status: 500 });
  }

  const pigeon = pigeons[Math.floor(Math.random() * pigeons.length)];

  const receiverLat = receiver.defaultLocationLat;
  const receiverLng = receiver.defaultLocationLng;

  // 날씨 API 연동 전까지는 보정 없음(1.0)으로 계산
  const weatherModifier = 1.0;
  const distance = distanceKm({ lat: senderLat, lng: senderLng }, { lat: receiverLat, lng: receiverLng });
  const speedKmh = pigeon.baseSpeed * weatherModifier;
  const hoursToArrive = distance / speedKmh;

  const departedAt = new Date();
  const arrivalEta = new Date(departedAt.getTime() + hoursToArrive * 60 * 60 * 1000);

  const postcard = await prisma.postcard.create({
    data: {
      senderId: sender.id,
      receiverId: receiver.id,
      imageUrl: imageUrl ?? null,
      messageKo: messageKo ?? null,
      messageJa: messageJa ?? null,
      designTemplateId: designTemplateId ?? null,
      status: "IN_TRANSIT",
      senderLat,
      senderLng,
      receiverLat,
      receiverLng,
      pigeonId: pigeon.id,
      weatherModifier,
      departedAt,
      arrivalEta,
    },
  });

  return NextResponse.json({ postcard });
}
