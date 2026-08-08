"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = ["ทั้งหมด", "แอฟริกา", "อเมริกากลาง", "อเมริกาใต้", "เอเชีย"] as const;

const ORIGINS = [
  { name: "Ethiopia Yirgacheffe", category: "แอฟริกา", roast: "Light Roast", process: "Washed" },
  { name: "Kenya AA", category: "แอฟริกา", roast: "Light Roast", process: "Washed" },
  { name: "Guatemala Antigua", category: "อเมริกากลาง", roast: "Medium Roast", process: "Natural" },
  { name: "Costa Rica Tarrazú", category: "อเมริกากลาง", roast: "Medium Roast", process: "Honey" },
  { name: "Colombia Huila", category: "อเมริกาใต้", roast: "Medium Roast", process: "Washed" },
  { name: "Sumatra Mandheling", category: "เอเชีย", roast: "Dark Roast", process: "Natural" },
] as const;

export default function OriginsGallery() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("ทั้งหมด");

  const filtered =
    active === "ทั้งหมด" ? ORIGINS : ORIGINS.filter((o) => o.category === active);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active === c
                ? "bg-coffee-900 text-cream-50"
                : "border border-coffee-200 text-coffee-600 hover:bg-coffee-50"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((origin) => (
          <div
            key={origin.name}
            className="rounded-xl border border-coffee-100 bg-white p-5 shadow-sm"
          >
            <span className="text-xs font-medium text-coffee-400">{origin.category}</span>
            <h3 className="mt-1 font-semibold text-coffee-900">{origin.name}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-coffee-100 px-2 py-0.5 text-xs font-medium text-coffee-800">
                {origin.roast}
              </span>
              <span className="rounded-full border border-coffee-200 px-2 py-0.5 text-xs font-medium text-coffee-600">
                {origin.process}
              </span>
            </div>
            <Link
              href="/beans"
              className="mt-4 inline-block text-sm font-semibold text-coffee-700 hover:text-coffee-900"
            >
              + เพิ่มเข้าคลัง
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
