import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { text, targetLang } = await request.json();

  if (!text || (targetLang !== "KO" && targetLang !== "JA")) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "번역 기능이 아직 설정되지 않았어요 (DEEPL_API_KEY 없음)" },
      { status: 503 },
    );
  }

  const isFreeKey = apiKey.endsWith(":fx");
  const endpoint = isFreeKey
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ text, target_lang: targetLang }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "translation request failed" }, { status: 502 });
  }

  const data = await res.json();

  return NextResponse.json({ translatedText: data.translations[0].text });
}
