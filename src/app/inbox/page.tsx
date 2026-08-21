import Link from "next/link";

export default function InboxPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-neutral-500">수신함 (준비 중)</p>
      <Link href="/write" className="text-sm text-neutral-500 underline">
        엽서 쓰기
      </Link>
    </main>
  );
}
