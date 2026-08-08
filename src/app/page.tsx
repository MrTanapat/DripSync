import Link from "next/link";
import { auth } from "~/server/auth";
import OriginsGallery from "~/app/_components/OriginsGallery";

const FEATURES = [
  {
    title: "บันทึกคลังเมล็ดกาแฟ",
    desc: "เก็บชื่อ โรงคั่ว ระดับการคั่ว โปรเซส และรสชาติของเมล็ดทุกถุงไว้ในที่เดียว ไม่ต้องจำเอง",
  },
  {
    title: "คำนวณต้นทุนต่อกรัม",
    desc: "รู้ต้นทุนที่แท้จริงของกาแฟแต่ละถุงแบบอัตโนมัติ เทียบราคาระหว่างร้านได้ในไม่กี่วินาที",
  },
  {
    title: "ติดตามสถานะเมล็ด",
    desc: "ทำเครื่องหมายเมล็ดที่หมดแล้ว จะได้ไม่หยิบถุงที่ไม่มีในสต็อกมาชงอีก",
  },
  {
    title: "ซิงก์ผ่าน Google อัตโนมัติ",
    desc: "ล็อกอินครั้งเดียวด้วยบัญชี Google ข้อมูลของคุณเป็นส่วนตัวและใช้ได้ทุกอุปกรณ์",
  },
] as const;

const STATS = [
  { value: "4", label: "ระดับการคั่ว" },
  { value: "5", label: "วิธีโปรเซส" },
  { value: "∞", label: "เมล็ดที่บันทึกได้" },
  { value: "100%", label: "ฟรีตลอดการใช้งาน" },
] as const;

const PLANS = [
  {
    name: "ส่วนตัว",
    price: "ฟรี",
    priceNote: "ตลอดไป",
    desc: "สำหรับคนรักกาแฟที่อยากจัดคลังเมล็ดให้เป็นระเบียบ",
    features: [
      "ไม่จำกัดจำนวนเมล็ดกาแฟ",
      "คำนวณต้นทุนต่อกรัมอัตโนมัติ",
      "ซิงก์ข้อมูลผ่าน Google",
      "ใช้งานได้ทุกอุปกรณ์",
    ],
    cta: "เริ่มใช้งานฟรี",
    highlight: true,
    available: true,
  },
  {
    name: "ครอบครัว",
    price: "เร็วๆ นี้",
    priceNote: "",
    desc: "แชร์คลังเมล็ดกาแฟกับคนในบ้าน พร้อมประวัติการชงของแต่ละคน",
    features: [
      "ทุกอย่างในแพ็กเกจส่วนตัว",
      "แชร์คลังเมล็ดร่วมกันได้",
      "บันทึกการชงแยกรายคน",
    ],
    cta: "เร็วๆ นี้",
    highlight: false,
    available: false,
  },
  {
    name: "ร้านกาแฟ",
    price: "เร็วๆ นี้",
    priceNote: "",
    desc: "จัดการสต็อกหลายสาขา พร้อมรายงานต้นทุนแบบละเอียดสำหรับร้าน",
    features: [
      "ทุกอย่างในแพ็กเกจครอบครัว",
      "จัดการสต็อกหลายสาขา",
      "สิทธิ์การใช้งานแยกตามพนักงาน",
    ],
    cta: "เร็วๆ นี้",
    highlight: false,
    available: false,
  },
] as const;

const FOOTER_COLUMNS = [
  {
    title: "ผลิตภัณฑ์",
    links: [
      { label: "ฟีเจอร์", href: "#features" },
      { label: "จุดกำเนิดเมล็ด", href: "#origins" },
      { label: "แพ็กเกจ", href: "#plans" },
    ],
  },
  {
    title: "ข้อมูล",
    links: [
      { label: "วิธีใช้งาน", href: "#" },
      { label: "คำถามที่พบบ่อย", href: "#" },
    ],
  },
  {
    title: "กฎหมาย",
    links: [
      { label: "ความเป็นส่วนตัว", href: "#" },
      { label: "ข้อกำหนดการใช้งาน", href: "#" },
    ],
  },
] as const;

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="bg-cream-50">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:px-10 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-coffee-200 bg-white px-4 py-1.5 text-xs font-semibold text-coffee-600">
              ☕ แอปส่วนตัวสำหรับคนรักกาแฟ
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-coffee-900 md:text-5xl">
              ชงกาแฟให้ดีขึ้น{" "}
              <span className="bg-gradient-to-br from-coffee-400 to-coffee-700 bg-clip-text text-transparent">
                ทุกแก้ว
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-coffee-500">
              จัดการคลังเมล็ดกาแฟ คำนวณต้นทุนต่อกรัม และไม่พลาดเมล็ดที่ชอบอีกต่อไป
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={session ? "/beans" : "/api/auth/signin"}
                className="rounded-full bg-coffee-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-coffee-800"
              >
                {session ? "ไปที่คลังเมล็ดกาแฟ →" : "เริ่มต้นใช้งานฟรี"}
              </Link>
              <a
                href="#features"
                className="text-sm font-semibold text-coffee-600 hover:text-coffee-900"
              >
                ดูฟีเจอร์ทั้งหมด ↓
              </a>
            </div>
          </div>

          {/* Preview mockup */}
          <div className="rounded-2xl border border-coffee-100 bg-white p-3 shadow-xl shadow-coffee-900/5">
            <div className="flex items-center gap-1.5 border-b border-coffee-100 px-2 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-coffee-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-coffee-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-coffee-200" />
              <span className="ml-2 truncate rounded-md bg-cream-100 px-2 py-1 text-xs text-coffee-400">
                dripsync.app/beans
              </span>
            </div>
            <div className="p-3">
              <div className="rounded-xl border border-coffee-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-coffee-900">Ethiopia Yirgacheffe</h3>
                    <p className="text-sm text-coffee-500">Roots Coffee Roaster</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-coffee-100 px-2 py-0.5 text-xs font-medium text-coffee-800">
                    Light
                  </span>
                  <span className="rounded-full border border-coffee-200 px-2 py-0.5 text-xs font-medium text-coffee-600">
                    Washed
                  </span>
                </div>
                <div className="mt-4 border-t border-coffee-100 pt-3">
                  <div className="flex justify-between text-sm text-coffee-600">
                    <span>250 g</span>
                    <span>฿450</span>
                  </div>
                  <div className="mt-2 rounded-lg bg-coffee-50 px-3 py-2 text-center">
                    <p className="text-xs text-coffee-500">ต้นทุนต่อกรัม</p>
                    <p className="text-lg font-bold text-coffee-700">
                      ฿1.80<span className="text-xs font-normal">/g</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-2 gap-6 border-t border-coffee-100 pt-10 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-coffee-900">{stat.value}</p>
              <p className="mt-1 text-sm text-coffee-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 bg-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <span className="text-xs font-bold tracking-wide text-coffee-500 uppercase">
              ทุกสิ่งที่คุณต้องใช้
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-coffee-900">
              ครบเรื่องกาแฟในที่เดียว
            </h2>
            <p className="mt-3 text-coffee-500">
              ฟีเจอร์ที่ออกแบบมาเพื่อคนที่จริงจังกับการจัดการเมล็ดกาแฟของตัวเอง
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-coffee-100 p-5">
                <h3 className="font-semibold text-coffee-900">{f.title}</h3>
                <p className="mt-2 text-sm text-coffee-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origins gallery */}
      <section id="origins" className="scroll-mt-24 px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <span className="text-xs font-bold tracking-wide text-coffee-500 uppercase">
              เริ่มต้นได้ในไม่กี่วินาที
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-coffee-900">
              จุดกำเนิดเมล็ดยอดนิยม
            </h2>
            <p className="mt-3 text-coffee-500">
              ตัวอย่างเมล็ดกาแฟจากแหล่งที่นิยม กดเพิ่มเข้าคลังของคุณได้ทันที
            </p>
          </div>

          <div className="mt-12">
            <OriginsGallery />
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="scroll-mt-24 bg-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <span className="text-xs font-bold tracking-wide text-coffee-500 uppercase">
              แพ็กเกจใช้งาน
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-coffee-900">
              เริ่มฟรี ไม่มีค่าใช้จ่ายแอบแฝง
            </h2>
            <p className="mt-3 text-coffee-500">
              ใช้งานส่วนตัวได้ฟรีตลอดไป แพ็กเกจสำหรับครอบครัวและร้านค้ากำลังจะตามมา
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-coffee-900 bg-coffee-900 text-cream-50"
                    : "border-coffee-100 bg-cream-50"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-coffee-400 px-3 py-1 text-xs font-semibold text-coffee-900">
                    พร้อมใช้งานวันนี้
                  </span>
                )}
                <h3
                  className={`text-sm font-bold tracking-wide uppercase ${plan.highlight ? "text-cream-100" : "text-coffee-500"}`}
                >
                  {plan.name}
                </h3>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.priceNote && (
                    <span
                      className={`text-sm ${plan.highlight ? "text-cream-200" : "text-coffee-400"}`}
                    >
                      {plan.priceNote}
                    </span>
                  )}
                </p>
                <p
                  className={`mt-2 text-sm ${plan.highlight ? "text-cream-100" : "text-coffee-500"}`}
                >
                  {plan.desc}
                </p>

                {plan.available ? (
                  <Link
                    href={session ? "/beans" : "/api/auth/signin"}
                    className="mt-6 block rounded-full bg-cream-50 px-4 py-2.5 text-center text-sm font-semibold text-coffee-900 hover:bg-cream-100"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="mt-6 w-full cursor-not-allowed rounded-full border border-coffee-200 px-4 py-2.5 text-sm font-semibold text-coffee-400"
                  >
                    {plan.cta}
                  </button>
                )}

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-cream-100" : "text-coffee-600"}`}
                    >
                      <span>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-coffee-100 px-6 py-14 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-coffee-400 to-coffee-700">
                <span className="text-sm leading-none">☕</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-coffee-900">DripSync</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-coffee-500">
              แอปติดตามคลังเมล็ดกาแฟและคำนวณต้นทุนสำหรับคนรักกาแฟ
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold tracking-wide text-coffee-400 uppercase">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-coffee-600 hover:text-coffee-900">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-6xl border-t border-coffee-100 pt-6 text-xs text-coffee-400">
          © 2026 DripSync. สงวนลิขสิทธิ์.
        </p>
      </footer>
    </main>
  );
}
