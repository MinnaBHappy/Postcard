export default async function PostcardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-neutral-500">엽서 #{id} (준비 중)</p>
    </main>
  );
}
