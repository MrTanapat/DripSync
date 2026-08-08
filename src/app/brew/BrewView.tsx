"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import BrewModal from "./BrewModal";

type BrewLog = RouterOutputs["brew"]["getAll"][number];

function formatBrewDate(date: Date) {
  return new Date(date).toLocaleDateString("th-TH", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

export default function BrewView() {
  const { data: brewLogs, refetch } = api.brew.getAll.useQuery();
  const [modalState, setModalState] = useState<
    { open: false } | { open: true; log: BrewLog | null }
  >({ open: false });

  const deleteBrew = api.brew.delete.useMutation({
    onSuccess: () => refetch(),
  });

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("ลบบันทึกการชงนี้?")) return;
    deleteBrew.mutate({ id });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-coffee-900">Brew Logs</h1>
        <button
          onClick={() => setModalState({ open: true, log: null })}
          className="rounded-lg bg-coffee-600 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-coffee-700"
        >
          + Add Brew Log
        </button>
      </div>

      {!brewLogs || brewLogs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-coffee-200 py-16 text-center text-coffee-400">
          <p className="text-lg">dont have any brew logs yet</p>
          <p className="mt-1 text-sm">Click "Add Brew Log" to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brewLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setModalState({ open: true, log })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setModalState({ open: true, log });
                }
              }}
              className="cursor-pointer rounded-xl border border-coffee-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-coffee-900">{log.bean.name}</h2>
                  <p className="text-sm text-coffee-500">{log.bean.roaster}</p>
                </div>
                <span className="text-sm font-medium text-coffee-600">
                  {"★".repeat(log.rating)}
                  <span className="text-coffee-200">{"★".repeat(5 - log.rating)}</span>
                </span>
              </div>

              <p className="mb-3 text-xs text-coffee-400">
                ดริป {formatBrewDate(log.brewDate)}
              </p>

              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-coffee-100 px-2 py-0.5 text-xs font-medium text-coffee-800">
                  {log.method}
                </span>
              </div>

              {log.notes ? (
                <p className="mb-3 line-clamp-2 text-xs italic text-coffee-400">"{log.notes}"</p>
              ) : (
                <p className="mb-3 text-xs text-coffee-300">ยังไม่มีเทสโน้ต</p>
              )}

              <div className="mt-3 flex justify-end border-t border-coffee-100 pt-3">
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, log.id)}
                  disabled={deleteBrew.isPending}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState.open && (
        <BrewModal log={modalState.log} onClose={() => setModalState({ open: false })} />
      )}
    </main>
  );
}
