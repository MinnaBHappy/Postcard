import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "@/lib/r2";

export async function POST(request: Request) {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  const client = getR2Client();

  if (!client || !bucket || !publicUrl) {
    return NextResponse.json(
      { error: "이미지 저장소가 아직 설정되지 않았어요 (R2 환경변수 없음)" },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const acceptedTypes = ["image/jpeg", "image/png", "image/heic", "image/heif"];
  const acceptedExtensions = [".jpg", ".jpeg", ".png", ".heic", ".heif"];
  const nameLower = file.name.toLowerCase();
  const isAccepted =
    acceptedTypes.includes(file.type) || acceptedExtensions.some((ext) => nameLower.endsWith(ext));

  if (!isAccepted) {
    return NextResponse.json(
      { error: "jpg, png, HEIC 파일만 업로드할 수 있어요" },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const key = `postcards/${Date.now()}-${crypto.randomUUID()}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: file.type || "application/octet-stream",
    }),
  );

  return NextResponse.json({ url: `${publicUrl.replace(/\/$/, "")}/${key}` });
}
