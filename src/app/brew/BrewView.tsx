"use client";

import { useState, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import BrewModal from "./BrewModal";
import BrewDetailModal from "./BrewDetailModal";
import { Pencil, Trash2 } from "lucide-react";

type BrewLog = RouterOutputs["brew"]["getAll"][number];
type sortKey = "brewDate" | "bean.name" | "method" | "coffeeDose" | "waterYield" | "brewTime" | "rating";
type sortOrder = "asc" | "desc";

const SORT_OPTIONS: { value: sortKey; label: string }[] = [
  { value: "brewDate", label: "วันที่ชง" },
  { value: "bean.name", label: "ชื่อเมล็ดกาแฟ" },
  { value: "method", label: "วิธี" },
  { value: "coffeeDose", label: "โดส" },
  { value: "waterYield", label: "น้ำ" },
  { value: "brewTime", label: "เวลา" },
  { value: "rating", label: "คะแนน" },
];


const sortBrewLogs = (logs: BrewLog[], key: sortKey, order: sortOrder) => {
  return [...logs].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "brewDate":
        cmp = new Date(a.brewDate).getTime() - new Date(b.brewDate).getTime();
        break;
      case "bean.name":
        cmp = a.bean.name.localeCompare(b.bean.name, "th");
        break;
      case "method":
        cmp = a.method.localeCompare(b.method);
        break;
      case "coffeeDose":
        cmp = a.coffeeDose - b.coffeeDose;
        break;
      case "waterYield":
        cmp = a.waterYield - b.waterYield;
        break;
      case "brewTime":
        cmp = a.brewTime - b.brewTime;
        break;
      case "rating":
        cmp = a.rating - b.rating;
        break;
    }
    return order === "asc" ? cmp : -cmp;
  });
};

function formatBrewDate(date: Date) {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function secondsToDisplay(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function BrewView() {
  const { data: session } = useSession();
  const { data: brewLogs, refetch } = api.brew.getAll.useQuery();
  const [modalState, setModalState] = useState<
    { open: false } | { open: true; log: BrewLog | null }
  >({ open: false });
  const [detailLog, setDetailLog] = useState<BrewLog | null>(null);
  const [sortKey, setSortKey] = useState<sortKey>("brewDate");
  const [sortOrder, setSortOrder] = useState<sortOrder>("desc");

  const sortedLogs = useMemo(
    () => (brewLogs ? sortBrewLogs(brewLogs, sortKey, sortOrder) : []),
    [brewLogs, sortKey, sortOrder]
  );

  const deleteBrew = api.brew.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("ลบบันทึกการชงนี้?")) return;
    deleteBrew.mutate({ id });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 pt-28">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coffee-900">
            <span className="text-lg">🫗</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-coffee-900">ประวัติการดริป</h1>
            <p className="text-sm text-coffee-400">บันทึกและติดตามการชงกาแฟของคุณ</p>
          </div>
        </div>
        {session ? (
          <button
            onClick={() => setModalState({ open: true, log: null })}
            className="flex items-center gap-2 rounded-xl bg-coffee-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-coffee-800"
          >
            + บันทึก
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

      {brewLogs && brewLogs.length > 0 && (
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
      {!brewLogs || brewLogs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 py-16 text-center text-stone-400">
          <p className="text-lg">ยังไม่มีบันทึกการชง</p>
          <p className="mt-1 text-sm">
            {session
              ? "กดปุ่ม \"บันทึก\" เพื่อเริ่มต้น"
              : "เข้าสู่ระบบเพื่อบันทึกการชงกาแฟ"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop — Table */}
          <div className="hidden overflow-hidden rounded-xl border border-stone-100 bg-white md:block">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-stone-100 px-5 py-3">
              {["เมล็ดกาแฟ", "วิธี", "โดส/น้ำ", "เวลา", "คะแนน", ""].map((h) => (
                <span key={h} className="text-xs font-medium text-stone-400">{h}</span>
              ))}
            </div>
            {sortedLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setDetailLog(log)}
                className="grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-stone-50 px-5 py-4 last:border-0 hover:bg-stone-50"
              >
                <div>
                  <p className="font-semibold text-stone-900">{log.bean.name}</p>
                  <p className="text-xs text-stone-400">
                    {formatBrewDate(log.brewDate)} · {log.bean.roaster}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                  {log.method}
                </span>
                <div className="text-sm text-stone-600">
                  <p>{log.coffeeDose}g / {log.waterYield}g</p>
                  <p className="text-xs text-stone-400">{log.waterTemp}°C</p>
                </div>
                <span className="text-sm text-stone-600">{secondsToDisplay(log.brewTime)}</span>
                <div className="text-sm">
                  <span className="text-amber-500">{"★".repeat(log.rating)}</span>
                  <span className="text-stone-200">{"★".repeat(5 - log.rating)}</span>
                </div>
                {session ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setModalState({ open: true, log }); }}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, log.id)}
                      disabled={deleteBrew.isPending}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : <span />}
              </div>
            ))}
          </div>

          {/* Mobile — Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {sortedLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setDetailLog(log)}
                className="cursor-pointer rounded-xl border border-stone-100 bg-white p-4 shadow-sm active:bg-stone-50"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-stone-900">{log.bean.name}</p>
                    <p className="text-xs text-stone-400">{log.bean.roaster}</p>
                  </div>
                  <div className="ml-3 flex items-center gap-1.5 shrink-0">
                    <span className="text-sm text-amber-500">{"★".repeat(log.rating)}</span>
                    <span className="text-sm text-stone-200">{"★".repeat(5 - log.rating)}</span>
                  </div>
                </div>

                {/* Mid row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                    {log.method}
                  </span>
                  <span className="text-xs text-stone-400">{formatBrewDate(log.brewDate)}</span>
                </div>

                {/* Stats row */}
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-stone-50 pt-3">
                  <div>
                    <p className="text-xs text-stone-400">โดส/น้ำ</p>
                    <p className="text-sm font-medium text-stone-700">{log.coffeeDose}g / {log.waterYield}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">อุณหภูมิ</p>
                    <p className="text-sm font-medium text-stone-700">{log.waterTemp}°C</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">เวลา</p>
                    <p className="text-sm font-medium text-stone-700">{secondsToDisplay(log.brewTime)}</p>
                  </div>
                </div>

                {/* Actions */}
                {session && (
                  <div className="mt-3 flex justify-end gap-2 border-t border-stone-50 pt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setModalState({ open: true, log }); }}
                      className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      แก้ไข
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, log.id)}
                      disabled={deleteBrew.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      ลบ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {detailLog && (
        <BrewDetailModal
          log={detailLog}
          onClose={() => setDetailLog(null)}
          onEdit={() => {
            setModalState({ open: true, log: detailLog });
            setDetailLog(null);
          }}
        />
      )}

      {modalState.open && (
        <BrewModal
          log={modalState.log}
          onClose={() => setModalState({ open: false })}
        />
      )}
    </main>
  );
}