"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import type { RouterOutputs } from "~/trpc/react";

type BrewLog = RouterOutputs["brew"]["getAll"][number];

function formatBrewDate(date: Date) {
    return new Date(date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function secondsToDisplay(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export default function BrewDetailModal({
    log,
    onClose,
    onEdit,
}: {
    log: BrewLog;
    onClose: () => void;
    onEdit?: () => void;
}) {
    const { data: session } = useSession();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const hasPourGrams = Array.isArray(log.pourGrams) && log.pourGrams.length > 0;
    const totalWater = hasPourGrams
        ? (log.pourGrams as number[]).reduce((sum, g) => sum + g, 0)
        : log.waterYield;

    const ratio = totalWater / log.coffeeDose;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/40 px-4 py-8 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">{log.bean.name}</h2>
                        <p className="text-sm text-stone-400">{log.bean.roaster}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                    >
                        ✕
                    </button>
                </div>

                {/* Rating + Date */}
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <span className="text-xl text-amber-500">{"★".repeat(log.rating)}</span>
                        <span className="text-xl text-stone-200">{"★".repeat(5 - log.rating)}</span>
                    </div>
                    <span className="text-sm text-stone-400">{formatBrewDate(log.brewDate)}</span>
                </div>

                {/* Method badge */}
                <div className="mb-5">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                        {log.method}
                    </span>
                </div>

                {/* Stats grid */}
                <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-stone-50 p-3">
                        <p className="text-xs text-stone-400">โดสกาแฟ</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">{log.coffeeDose} g</p>
                    </div>
                    <div className="rounded-xl bg-stone-50 p-3">
                        <p className="text-xs text-stone-400">น้ำรวม</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">{totalWater} g</p>
                    </div>
                    <div className="rounded-xl bg-stone-50 p-3">
                        <p className="text-xs text-stone-400">อุณหภูมิน้ำ</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">{log.waterTemp}°C</p>
                    </div>
                    <div className="rounded-xl bg-stone-50 p-3">
                        <p className="text-xs text-stone-400">เวลารวม</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">{secondsToDisplay(log.brewTime)}</p>
                    </div>
                    <div className="rounded-xl bg-stone-50 p-3">
                        <p className="text-xs text-stone-400">เบอร์บด</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">{log.grindSize}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                        <p className="text-xs text-amber-600">Ratio</p>
                        <p className="mt-1 text-lg font-bold text-amber-700">1:{ratio.toFixed(1)}</p>
                    </div>
                </div>

                {/* Pours */}
                {log.pours.length > 0 && (
                    <div className="mb-5">
                        <p className="mb-2 text-sm font-medium text-stone-700">พลัว</p>
                        <div className="space-y-1.5">
                            {log.pours.map((waitUntil, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm"
                                >
                                    <span className="text-stone-500">พลัวที่ {i + 1}</span>
                                    <div className="flex gap-4">
                                        {log.pourGrams[i] !== undefined && (
                                            <span className="font-medium text-stone-700">
                                                {log.pourGrams[i]} g
                                            </span>
                                        )}
                                        <span className="text-stone-400">วิที่ {waitUntil}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {log.notes && (
                    <div className="mb-5 rounded-xl border border-stone-100 bg-stone-50 p-4">
                        <p className="text-xs font-medium text-stone-400">เทสโน้ต</p>
                        <p className="mt-1 text-sm italic text-stone-600">"{log.notes}"</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className={`rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 ${session ? "flex-1" : "w-full"
                            }`}
                    >
                        ปิด
                    </button>
                    {session && onEdit && (
                        <button
                            onClick={onEdit}
                            className="flex-1 rounded-xl bg-coffee-900 py-2.5 text-sm font-semibold text-white hover:bg-coffee-800"
                        >
                            แก้ไข
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}