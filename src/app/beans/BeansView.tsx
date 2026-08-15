"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import BeanModal from "./BeanModal";
import { Pencil, Trash2 } from "lucide-react";

type BeanItem = RouterOutputs["bean"]["getAll"][number];

const ROAST_LABEL: Record<string, string> = {
  LIGHT: "Light",
  MEDIUM: "Medium",
  MEDIUM_DARK: "Medium-Dark",
  DARK: "Dark",
};

const ORIGIN_LABEL: Record<string, string> = {
  WASHED: "Washed",
  NATURAL: "Natural",
  HONEY: "Honey",
  ANAEROBIC: "Anaerobic",
  OTHER: "Other",
};

export default function BeansView() {
  const { data: session } = useSession();
  const { data: beans, refetch } = api.bean.getAll.useQuery();
  const { data: stats } = api.bean.getStats.useQuery();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ open: false } | { open: true; bean: BeanItem | null }>({ open: false });

  const deleteBean = api.bean.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  const toggleFinished = api.bean.update.useMutation({
    onSuccess: () => void refetch(),
  });

  function handleDelete(id: string) {
    if (!confirm("ลบเมล็ดกาแฟนี้?")) return;
    setDeletingId(id);
    deleteBean.mutate({ id });
  }

  function getStockStatus(bean: BeanItem) {
    if (bean.isFinished || bean.weight <= 0)
      return { label: "หมดสต็อก", color: "text-red-500", dot: "bg-red-500" };
    if (bean.weight < 50)
      return { label: "ใกล้หมด", color: "text-amber-500", dot: "bg-amber-500" };
    return { label: "พร้อมใช้", color: "text-green-600", dot: "bg-green-500" };
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coffee-900">
            <span className="text-lg">☕</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-coffee-900">คลังเมล็ดกาแฟ</h1>
            <p className="text-sm text-coffee-400">ดูและจัดการเมล็ดกาแฟทั้งหมด</p>
          </div>
        </div>
        {session ? (
          <button
            onClick={() => setModalState({ open: true, bean: null })}
            className="flex items-center gap-2 rounded-xl bg-coffee-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-coffee-800"
          >
            + เพิ่ม
          </button>
        ) : (
          <button
            onClick={() => void signIn("google")}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            เข้าสู่ระบบเพื่อเพิ่มเมล็ด
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-stone-100 bg-white p-4">
            <p className="text-xs text-stone-400">ปริมาณรวม</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">
              {(stats.totalWeight / 1000).toFixed(2)} kg
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white p-4">
            <p className="text-xs text-amber-500">ใกล้หมด</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">
              {stats.lowStock} รายการ
            </p>
          </div>
          <div className="rounded-xl border border-red-100 bg-white p-4">
            <p className="text-xs text-red-500">หมดสต็อก</p>
            <p className="mt-1 text-2xl font-bold text-red-500">
              {stats.outOfStock} รายการ
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!beans || beans.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 py-16 text-center text-stone-400">
          <p className="text-lg">ยังไม่มีเมล็ดกาแฟในคลัง</p>
          <p className="mt-1 text-sm">
            {session ? "กดปุ่ม \"เพิ่ม\" เพื่อเริ่มต้น" : "เข้าสู่ระบบเพื่อเพิ่มเมล็ดกาแฟ"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-100 bg-white">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr_auto] gap-4 border-b border-stone-100 px-5 py-3">
            {["ชื่อ", "โปรเซส", "ระดับคั่ว", "ปริมาณคงเหลือ", "สถานะ", ""].map((h) => (
              <span key={h} className="text-xs font-medium text-stone-400">{h}</span>
            ))}
          </div>

          {/* Table rows */}
          {beans.map((bean) => {
            const status = getStockStatus(bean);
            const maxWeight = 1000;
            const pct = Math.min((bean.weight / maxWeight) * 100, 100);
            const barColor =
              bean.isFinished || bean.weight <= 0
                ? "bg-red-400"
                : bean.weight < 50
                  ? "bg-amber-400"
                  : "bg-green-500";

            return (
              <div
                key={bean.id}
                className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr_auto] items-center gap-4 border-b border-stone-50 px-5 py-4 last:border-0 hover:bg-stone-50"
              >
                {/* ชื่อ */}
                <div>
                  <p className="font-semibold text-stone-900">{bean.name}</p>
                  <p className="text-xs text-stone-400">{bean.roaster}</p>
                </div>

                {/* โปรเซส */}
                <span className="text-sm text-stone-500">
                  {ORIGIN_LABEL[bean.process]}
                </span>

                {/* ระดับคั่ว */}
                <span className="text-sm text-stone-500">
                  {ROAST_LABEL[bean.roastLevel]}
                </span>

                {/* ปริมาณคงเหลือ */}
                <div>
                  <p className="mb-1 text-sm font-medium text-stone-700">
                    {bean.weight} g
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-stone-100">
                    <div
                      className={`h-1.5 rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* สถานะ */}
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                  {session ? (
                    <button
                      onClick={() =>
                        toggleFinished.mutate({
                          id: bean.id,
                          isFinished: !bean.isFinished,
                        })
                      }
                      className={`text-sm ${status.color} hover:underline`}
                    >
                      {status.label}
                    </button>
                  ) : (
                    <span className={`text-sm ${status.color}`}>
                      {status.label}
                    </span>
                  )}
                </div>

                {/* จัดการ — เฉพาะ session */}
                {session ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalState({ open: true, bean })}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bean.id)}
                      disabled={deletingId === bean.id}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span />
                )}
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