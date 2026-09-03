import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeProgress, interpolate } from "@/lib/pigeonProgress";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const viewer = searchParams.get("viewer");

  if (viewer !== "MIN" && viewer !== "MOMOKA") {
    return NextResponse.json({ error: "invalid viewer" }, { status: 400 });
  }

  let postcard = await prisma.postcard.findUnique({
    where: { id },
    include: { sender: true, receiver: true, pigeon: true, designTemplate: true },
  });

  if (!postcard || postcard.deletedAt) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const isSender = postcard.sender.name === viewer;
  const isReceiver = postcard.receiver.name === viewer;

  if (!isSender && !isReceiver) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const now = new Date();

  if (
    postcard.status === "IN_TRANSIT" &&
    postcard.arrivalEta &&
    now >= postcard.arrivalEta
  ) {
    postcard = await prisma.postcard.update({
      where: { id },
      data: { status: "DELIVERED", deliveredAt: postcard.arrivalEta },
      include: { sender: true, receiver: true, pigeon: true, designTemplate: true },
    });
  }

  if (isReceiver && postcard.status === "DELIVERED") {
    postcard = await prisma.postcard.update({
      where: { id },
      data: { status: "READ", readAt: now },
      include: { sender: true, receiver: true, pigeon: true, designTemplate: true },
    });
  }

  let progress = 1;
  let currentLat = postcard.receiverLat;
  let currentLng = postcard.receiverLng;

  if (
    postcard.departedAt &&
    postcard.arrivalEta &&
    postcard.senderLat != null &&
    postcard.senderLng != null &&
    postcard.receiverLat != null &&
    postcard.receiverLng != null
  ) {
    progress = computeProgress(postcard.departedAt, postcard.arrivalEta, now);
    currentLat = interpolate(postcard.senderLat, postcard.receiverLat, progress);
    currentLng = interpolate(postcard.senderLng, postcard.receiverLng, progress);
  }

  return NextResponse.json({ postcard, progress, currentLat, currentLng });
}

async function authorize(id: string, viewer: string | null) {
  if (viewer !== "MIN" && viewer !== "MOMOKA") {
    return { error: NextResponse.json({ error: "invalid viewer" }, { status: 400 }) };
  }

  const postcard = await prisma.postcard.findUnique({
    where: { id },
    include: { sender: true, receiver: true },
  });

  if (!postcard) {
    return { error: NextResponse.json({ error: "not found" }, { status: 404 }) };
  }

  const isSender = postcard.sender.name === viewer;
  const isReceiver = postcard.receiver.name === viewer;

  if (!isSender && !isReceiver) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { postcard };
}

// 엽서는 PRD 설계상 완전 삭제가 불가능해서, deletedAt만 세우는 소프트 삭제로 처리
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const result = await authorize(id, searchParams.get("viewer"));

  if (result.error) return result.error;

  const postcard = await prisma.postcard.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ postcard });
}

// 삭제 취소(복구): deletedAt을 다시 null로
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const result = await authorize(id, searchParams.get("viewer"));

  if (result.error) return result.error;

  const body = await request.json().catch(() => ({}));

  if (body.action !== "restore") {
    return NextResponse.json({ error: "unsupported action" }, { status: 400 });
  }

  const postcard = await prisma.postcard.update({
    where: { id },
    data: { deletedAt: null },
  });

  return NextResponse.json({ postcard });
}
