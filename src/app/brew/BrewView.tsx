"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import BrewModal from "./BrewModal";
import BrewDetailModal from "./BrewDetailModal";
import { Pencil, Trash2 } from "lucide-react";

type BrewLog = RouterOutputs["brew"]["getAll"][number];

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
  const [modalState, setModalState] = useState<{ open: false } | { open: true; log: BrewLog | null }>({ open: false });
  const [detailLog, setDetailLog] = useState<BrewLog | null>(null);

  const deleteBrew = api.brew.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("ลบบันทึกการชงนี้?")) return;
    deleteBrew.mutate({ id });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
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
            + บันทึกการชง
          </button>
        ) : (
          <button
            onClick={() => void signIn("google")}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            เข้าสู่ระบบเพื่อบันทึก
          </button>
        )}
      </div>

      {/* Empty state */}
      {!brewLogs || brewLogs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 py-16 text-center text-stone-400">
          <p className="text-lg">ยังไม่มีบันทึกการชง</p>
          <p className="mt-1 text-sm">
            {session
              ? "กดปุ่ม \"บันทึกการชง\" เพื่อเริ่มต้น"
              : "เข้าสู่ระบบเพื่อบันทึกการชงกาแฟ"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-100 bg-white">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-stone-100 px-5 py-3">
            {["เมล็ดกาแฟ", "วิธี", "โดส/น้ำ", "เวลา", "คะแนน", ""].map((h) => (
              <span key={h} className="text-xs font-medium text-stone-400">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {brewLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setDetailLog(log)}
              className="grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-stone-50 px-5 py-4 last:border-0 hover:bg-stone-50"
            >
              {/* เมล็ดกาแฟ */}
              <div>
                <p className="font-semibold text-stone-900">{log.bean.name}</p>
                <p className="text-xs text-stone-400">
                  {formatBrewDate(log.brewDate)} · {log.bean.roaster}
                </p>
              </div>

              {/* วิธี */}
              <span className="w-fit rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                {log.method}
              </span>

              {/* โดส/น้ำ */}
              <div className="text-sm text-stone-600">
                <p>{log.coffeeDose}g / {log.waterYield}g</p>
                <p className="text-xs text-stone-400">{log.waterTemp}°C</p>
              </div>

              {/* เวลา */}
              <span className="text-sm text-stone-600">
                {secondsToDisplay(log.brewTime)}
              </span>

              {/* คะแนน */}
              <div className="text-sm">
                <span className="text-amber-500">{"★".repeat(log.rating)}</span>
                <span className="text-stone-200">{"★".repeat(5 - log.rating)}</span>
              </div>

              {/* Actions */}
              {session ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalState({ open: true, log });
                    }}
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
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
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

      {/* Edit/Create Modal */}
      {modalState.open && (
        <BrewModal
          log={modalState.log}
          onClose={() => setModalState({ open: false })}
        />
      )}
    </main>
  );
}