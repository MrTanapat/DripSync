"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import BeanModal from "./BeanModal";

type Bean = RouterOutputs["bean"]["getAll"][number];

const ROAST_LABEL: Record<string, string> = {
  LIGHT: "Light",
  MEDIUM: "Medium",
  MEDIUM_DARK: "Medium Dark",
  DARK: "Dark",
};

const PROCESS_LABEL: Record<string, string> = {
  WASHED: "Washed",
  NATURAL: "Natural",
  HONEY: "Honey",
  ANAEROBIC: "Anaerobic",
  OTHER: "Other",
};

function formatRoastDate(date: Date) {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BeansView() {
  const { data: beans, refetch } = api.bean.getAll.useQuery();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<
    { open: false } | { open: true; bean: Bean | null }
  >({ open: false });

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
        <h1 className="text-2xl font-bold text-coffee-900">Coffee Beans</h1>
        <button
          onClick={() => setModalState({ open: true, bean: null })}
          className="rounded-lg bg-coffee-600 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-coffee-700"
        >
          + Add Bean
        </button>
      </div>

      {!beans || beans.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-coffee-200 py-16 text-center text-coffee-400">
          <p className="text-lg">dont have any coffee beans yet</p>
          <p className="mt-1 text-sm">Click Add Bean to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beans.map((bean) => {
            const costPerGram = bean.price / bean.weight;
            return (
              <div
                key={bean.id}
                className={`overflow-hidden rounded-xl border bg-white shadow-sm ${bean.isFinished ? "border-coffee-100 opacity-60" : "border-coffee-100"
                  }`}
              >
                {/* Image */}
                {bean.imageUrl ? (
                  <img
                    src={bean.imageUrl}
                    alt={bean.name}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-coffee-50 text-5xl">
                    ☕
                  </div>
                )}

                <div className="p-4">
                  {/* Header */}
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-coffee-900">{bean.name}</h2>
                      <p className="text-sm text-coffee-500">{bean.roaster}</p>
                    </div>
                    {bean.isFinished && (
                      <span className="rounded-full bg-coffee-50 px-2 py-0.5 text-xs text-coffee-400">
                        หมดแล้ว
                      </span>
                    )}
                  </div>

                  <p className="mb-3 text-xs text-coffee-400">
                    คั่ว {formatRoastDate(bean.roastDate)}
                  </p>

                  {/* Taste Notes */}
                  {bean.tasteNotes && (
                    <p className="mb-3 text-xs italic text-coffee-400">"{bean.tasteNotes}"</p>
                  )}

                  {/* Tags */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-coffee-100 px-2 py-0.5 text-xs font-medium text-coffee-800">
                      {ROAST_LABEL[bean.roastLevel]}
                    </span>
                    <span className="rounded-full border border-coffee-200 px-2 py-0.5 text-xs font-medium text-coffee-600">
                      {PROCESS_LABEL[bean.process]}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="border-t border-coffee-100 pt-3">
                    <div className="flex justify-between text-sm text-coffee-600">
                      <span>{bean.weight} g</span>
                      <span>฿{bean.price.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 rounded-lg bg-coffee-50 px-3 py-2 text-center">
                      <p className="text-xs text-coffee-500">ต้นทุนต่อกรัม</p>
                      <p className="text-lg font-bold text-coffee-700">
                        ฿{costPerGram.toFixed(2)}
                        <span className="text-xs font-normal">/g</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2 border-t border-coffee-100 pt-3">
                    <button
                      onClick={() =>
                        toggleFinished.mutate({
                          id: bean.id,
                          isFinished: !bean.isFinished,
                        })
                      }
                      className="flex-1 rounded-lg border border-coffee-100 py-1.5 text-xs text-coffee-500 hover:bg-coffee-50"
                    >
                      {bean.isFinished ? "ยังมีอยู่" : "หมดแล้ว"}
                    </button>
                    <button
                      onClick={() => setModalState({ open: true, bean })}
                      className="flex-1 rounded-lg border border-coffee-200 py-1.5 text-center text-xs text-coffee-600 hover:bg-coffee-50"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(bean.id)}
                      disabled={deletingId === bean.id}
                      className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalState.open && (
        <BeanModal
          bean={modalState.bean}
          onClose={() => setModalState({ open: false })}
        />
      )}
    </main>
  );
}
