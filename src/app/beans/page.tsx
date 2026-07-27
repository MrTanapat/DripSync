"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

const ROAST_LABEL: Record<string, string> = {
  LIGHT:       "Light",
  MEDIUM:      "Medium",
  MEDIUM_DARK: "Medium Dark",
  DARK:        "Dark",
};

const PROCESS_LABEL: Record<string, string> = {
  WASHED:    "Washed",
  NATURAL:   "Natural",
  HONEY:     "Honey",
  ANAEROBIC: "Anaerobic",
  OTHER:     "Other",
};

export default function BeansPage() {
  const { data: beans, refetch } = api.bean.getAll.useQuery();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteBean = api.bean.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const toggleFinished = api.bean.update.useMutation({
    onSuccess: () => refetch(),
  });

  function handleDelete(id: string) {
    if (!confirm("ลบเมล็ดกาแฟนี้?")) return;
    setDeletingId(id);
    deleteBean.mutate({ id });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">☕ คลังเมล็ดกาแฟ</h1>
        <Link
          href="/beans/new"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          + เพิ่มเมล็ดใหม่
        </Link>
      </div>

      {!beans || beans.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 py-16 text-center text-stone-400">
          <p className="text-lg">ยังไม่มีเมล็ดกาแฟในคลัง</p>
          <p className="mt-1 text-sm">กดปุ่ม "เพิ่มเมล็ดใหม่" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beans.map((bean) => {
            const costPerGram = bean.price / bean.weight;
            return (
              <div
                key={bean.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  bean.isFinished ? "border-stone-200 opacity-60" : "border-stone-200"
                }`}
              >
                {/* Header */}
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-stone-800">{bean.name}</h2>
                    <p className="text-sm text-stone-500">{bean.roaster}</p>
                  </div>
                  {bean.isFinished && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-400">
                      หมดแล้ว
                    </span>
                  )}
                </div>

                {/* Taste Notes */}
                {bean.tasteNotes && (
                  <p className="mb-3 text-xs italic text-stone-400">"{bean.tasteNotes}"</p>
                )}

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {ROAST_LABEL[bean.roastLevel]}
                  </span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {PROCESS_LABEL[bean.process]}
                  </span>
                </div>

                {/* Stats */}
                <div className="border-t border-stone-100 pt-3">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>{bean.weight} g</span>
                    <span>฿{bean.price.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-center">
                    <p className="text-xs text-amber-600">ต้นทุนต่อกรัม</p>
                    <p className="text-lg font-bold text-amber-700">
                      ฿{costPerGram.toFixed(2)}
                      <span className="text-xs font-normal">/g</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
                  <button
                    onClick={() =>
                      toggleFinished.mutate({
                        id: bean.id,
                        isFinished: !bean.isFinished,
                      })
                    }
                    className="flex-1 rounded-lg border border-stone-200 py-1.5 text-xs text-stone-500 hover:bg-stone-50"
                  >
                    {bean.isFinished ? "ยังมีอยู่" : "หมดแล้ว"}
                  </button>
                  <Link
                    href={`/beans/${bean.id}/edit`}
                    className="flex-1 rounded-lg border border-amber-200 py-1.5 text-center text-xs text-amber-600 hover:bg-amber-50"
                  >
                    แก้ไข
                  </Link>
                  <button
                    onClick={() => handleDelete(bean.id)}
                    disabled={deletingId === bean.id}
                    className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}