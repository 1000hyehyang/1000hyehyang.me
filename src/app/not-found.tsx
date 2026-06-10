import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        href="/"
        className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent/10"
      >
        홈으로 돌아가기
      </Link>
    </section>
  );
}
