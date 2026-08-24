"use client";

import { useState, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import BeanModal from "./BeanModal";
import { Pencil, Trash2 } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

type BeanItem = RouterOutputs["bean"]["getAll"][number];
type sortKey = "createdAt" | "name" | "process" | "roastLevel" | "weight" | "isFinished";
type sortOrder = "asc" | "desc";

const SORT_OPTIONS: { value: sortKey; label: string }[] = [
  { value: "createdAt", label: "วันที่เพิ่ม" },
  { value: "name", label: "ชื่อ" },
  { value: "process", label: "โปรเซส" },
  { value: "roastLevel", label: "ระดับคั่ว" },
  { value: "weight", label: "ปริมาณคงเหลือ" },
  { value: "isFinished", label: "สถานะ" },
];

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
  const [modalState, setModalState] = useState<
    { open: false } | { open: true; bean: BeanItem | null }
  >({ open: false });
  const [sortKey, setSortKey] = useState<sortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<sortOrder>("desc");

  const sortedBeans = useMemo(() => {
    if (!beans) return [];
    const list = [...beans];

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name, "th");
          break;
        case "process":
          cmp = a.process.localeCompare(b.process);
          break;
        case "roastLevel":
          cmp = a.roastLevel.localeCompare(b.roastLevel);
          break;
        case "weight":
          cmp = a.weight - b.weight;
          break;
        case "isFinished":
          cmp = Number(a.isFinished) - Number(b.isFinished);
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return list;
  }, [beans, sortKey, sortOrder]);

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
    <main className="mx-auto max-w-5xl px-4 py-10 pt-28">
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
            เข้าสู่ระบบ
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-stone-100 bg-white p-4">
            <p className="text-xs text-stone-400">ปริมาณรวม</p>
            <p className="mt-1 text-xl font-bold text-stone-900 sm:text-2xl">
              {(stats.totalWeight / 1000).toFixed(2)} kg
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white p-4">
            <p className="text-xs text-amber-500">ใกล้หมด</p>
            <p className="mt-1 text-xl font-bold text-amber-500 sm:text-2xl">
              {stats.lowStock} รายการ
            </p>
          </div>
          <div className="rounded-xl border border-red-100 bg-white p-4">
            <p className="text-xs text-red-500">หมดสต็อก</p>
            <p className="mt-1 text-xl font-bold text-red-500 sm:text-2xl">
              {stats.outOfStock} รายการ
            </p>
          </div>
        </div>
      )}

      {/* Sort controls */}
      {beans && beans.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          <span className="text-sm text-stone-400">เรียงตาม</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as sortKey)}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Empty state */}
      {!beans || beans.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 py-16 text-center text-stone-400">
          <p className="text-lg">ยังไม่มีเมล็ดกาแฟในคลัง</p>
          <p className="mt-1 text-sm">
            {session ? "กดปุ่ม \"เพิ่ม\" เพื่อเริ่มต้น" : "เข้าสู่ระบบเพื่อเพิ่มเมล็ดกาแฟ"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop — Table */}
          <div className="hidden overflow-hidden rounded-xl border border-stone-100 bg-white md:block">
            <div className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr_auto] gap-4 border-b border-stone-100 px-5 py-3">
              {["ชื่อ", "โปรเซส", "ระดับคั่ว", "ปริมาณคงเหลือ", "สถานะ", ""].map((h) => (
                <span key={h} className="text-xs font-medium text-stone-400">{h}</span>
              ))}
            </div>
            {sortedBeans.map((bean) => {
              const status = getStockStatus(bean);
              const pct = Math.min((bean.weight / 1000) * 100, 100);
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
                  <div>
                    <p className="font-semibold text-stone-900">{bean.name}</p>
                    <p className="text-xs text-stone-400">{bean.roaster}</p>
                  </div>
                  <span className="text-sm text-stone-500">{ORIGIN_LABEL[bean.process]}</span>
                  <span className="text-sm text-stone-500">{ROAST_LABEL[bean.roastLevel]}</span>
                  <div>
                    <p className="mb-1 text-sm font-medium text-stone-700">{bean.weight} g</p>
                    <div className="h-1.5 w-full rounded-full bg-stone-100">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                    {session ? (
                      <button
                        onClick={() => toggleFinished.mutate({ id: bean.id, isFinished: !bean.isFinished })}
                        className={`text-sm ${status.color} hover:underline`}
                      >
                        {status.label}
                      </button>
                    ) : (
                      <span className={`text-sm ${status.color}`}>{status.label}</span>
                    )}
                  </div>
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
                  ) : <span />}
                </div>
              );
            })}
          </div>

          {/* Mobile — Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {sortedBeans.map((bean) => {
              const status = getStockStatus(bean);
              const pct = Math.min((bean.weight / 1000) * 100, 100);
              const barColor =
                bean.isFinished || bean.weight <= 0
                  ? "bg-red-400"
                  : bean.weight < 50
                    ? "bg-amber-400"
                    : "bg-green-500";

              return (
                <div
                  key={bean.id}
                  className="rounded-xl border border-stone-100 bg-white p-4 shadow-sm"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-stone-900">{bean.name}</p>
                      <p className="text-xs text-stone-400">{bean.roaster}</p>
                    </div>
                    <div className="ml-3 flex items-center gap-1.5 shrink-0">
                      <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                      {ROAST_LABEL[bean.roastLevel]}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                      {ORIGIN_LABEL[bean.process]}
                    </span>
                  </div>

                  {/* Weight bar */}
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between">
                      <span className="text-xs text-stone-400">ปริมาณคงเหลือ</span>
                      <span className="text-xs font-medium text-stone-700">{bean.weight} g</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-stone-100">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  {session && (
                    <div className="mt-3 flex gap-2 border-t border-stone-50 pt-3">
                      <button
                        onClick={() => toggleFinished.mutate({ id: bean.id, isFinished: !bean.isFinished })}
                        className="flex-1 rounded-lg border border-stone-200 py-1.5 text-xs text-stone-500 hover:bg-stone-50"
                      >
                        {bean.isFinished ? "ยังมีอยู่" : "หมดแล้ว"}
                      </button>
                      <button
                        onClick={() => setModalState({ open: true, bean })}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(bean.id)}
                        disabled={deletingId === bean.id}
                        className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        ลบ
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
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