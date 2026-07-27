import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50">
      <div className="text-center">
        <p className="text-5xl">☕</p>
        <h1 className="mt-4 text-4xl font-bold text-stone-800">DripSync</h1>
        <p className="mt-2 text-stone-500">ติดตามเมล็ดกาแฟและบันทึกการชงของคุณ</p>
        <Link
          href="/beans"
          className="mt-6 inline-block rounded-lg bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
        >
          เข้าสู่คลังเมล็ดกาแฟ →
        </Link>
      </div>
    </main>
  );
}