"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Plus, X } from "lucide-react";

type Step = { grams: string; at: string };

function fmt(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TimerView() {
    const [steps, setSteps] = useState<Step[]>([
        { grams: "50", at: "0" },
        { grams: "100", at: "45" },
        { grams: "100", at: "90" },
    ]);
    const [elapsed, setElapsed] = useState(0);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const notifiedRef = useRef<Set<number>>(new Set());

    const validSteps = steps
        .filter((s) => s.grams !== "" && s.at !== "")
        .map((s, i) => ({ index: i, grams: Number(s.grams), at: Number(s.at) }))
        .sort((a, b) => a.at - b.at);

    const totalTime = validSteps.length > 0 ? validSteps[validSteps.length - 1]!.at : 0;
    const totalWater = validSteps.reduce((sum, s) => sum + s.grams, 0);
    const currentStep = validSteps.find((s) => elapsed < s.at);
    const nextIn = currentStep ? currentStep.at - elapsed : 0;

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [running]);

    useEffect(() => {
        if (!running) return;
        const step = validSteps.find((s) => s.at === elapsed);
        if (step && !notifiedRef.current.has(step.index)) {
            notifiedRef.current.add(step.index);
            beep();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
        if (elapsed >= totalTime && totalTime > 0) {
            setRunning(false);
        }
    }, [elapsed, running, validSteps, totalTime]);

    function beep() {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch {
            // ignore
        }
    }

    function reset() {
        setRunning(false);
        setElapsed(0);
        notifiedRef.current.clear();
    }

    function updateStep(i: number, field: keyof Step, value: string) {
        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
    }

    function addStep() {
        setSteps((prev) => [...prev, { grams: "", at: "" }]);
    }

    function removeStep(i: number) {
        setSteps((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
    }

    const progress = totalTime > 0 ? Math.min((elapsed / totalTime) * 100, 100) : 0;

    return (
        <main className="mx-auto max-w-2xl px-4 py-10 pt-28">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coffee-900">
                    <span className="text-lg">⏱️</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-coffee-900">Brew Timer</h1>
                    <p className="text-sm text-coffee-400">ตั้งแผนพลัวแล้วจับเวลาตอนดริป</p>
                </div>
            </div>

            {/* Timer display */}
            <div className="mb-6 rounded-2xl border border-stone-100 bg-white p-8 text-center shadow-sm">
                <p className="font-mono text-7xl font-bold tabular-nums text-stone-900">
                    {fmt(elapsed)}
                </p>
                <p className="mt-2 text-sm text-stone-400">จากทั้งหมด {fmt(totalTime)}</p>

                {/* Progress */}
                <div className="mt-6 h-2 w-full rounded-full bg-stone-100">
                    <div
                        className="h-2 rounded-full bg-amber-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Current step */}
                {currentStep ? (
                    <div className="mt-6 rounded-xl bg-amber-50 p-4">
                        <p className="text-xs text-amber-600">พลัวถัดไป</p>
                        <p className="mt-1 text-3xl font-bold text-amber-700">{currentStep.grams} g</p>
                        <p className="mt-1 text-sm text-amber-600">อีก {nextIn} วินาที</p>
                    </div>
                ) : (
                    <div className="mt-6 rounded-xl bg-green-50 p-4">
                        <p className="text-lg font-bold text-green-700">
                            {elapsed >= totalTime && totalTime > 0 ? "เสร็จแล้ว! ☕" : "พร้อมเริ่ม"}
                        </p>
                    </div>
                )}

                {/* Controls */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center rounded-xl border border-stone-200 px-5 py-3 text-stone-600 hover:bg-stone-50"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setRunning((r) => !r)}
                        disabled={validSteps.length === 0}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-semibold text-white hover:bg-amber-400 disabled:opacity-50"
                    >
                        {running ? (
                            <>
                                <Pause className="h-5 w-5" /> หยุด
                            </>
                        ) : (
                            <>
                                <Play className="h-5 w-5" /> เริ่ม
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Plan editor */}
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-stone-900">พลัว</h2>
                    <button
                        onClick={addStep}
                        className="flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
                    >
                        <Plus className="h-3 w-3" />
                        เพิ่มพลัว
                    </button>
                </div>

                {/* Column headers */}
                <div className="mb-2 grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 px-1">
                    <span />
                    <span className="text-xs text-stone-400">น้ำ (g)</span>
                    <span className="text-xs text-stone-400">เทที่วินาทีที่</span>
                    <span />
                </div>

                <div className="space-y-2">
                    {steps.map((s, i) => {
                        const isActive = currentStep?.index === i;
                        const isDone = validSteps.some((v) => v.index === i && elapsed >= v.at);
                        return (
                            <div
                                key={i}
                                className={`grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2 rounded-lg p-1 transition-colors ${isActive ? "bg-amber-50" : isDone ? "opacity-50" : ""
                                    }`}
                            >
                                <span className="text-center text-xs font-medium text-stone-400">{i + 1}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={s.grams}
                                    onChange={(e) => updateStep(i, "grams", e.target.value)}
                                    disabled={running}
                                    placeholder="50"
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-stone-50"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={s.at}
                                    onChange={(e) => updateStep(i, "at", e.target.value)}
                                    disabled={running}
                                    placeholder="45"
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-stone-50"
                                />
                                <button
                                    onClick={() => removeStep(i)}
                                    disabled={running}
                                    className="rounded-full p-1 text-stone-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-4 flex justify-between rounded-xl bg-stone-50 px-4 py-3 text-sm">
                    <span className="text-stone-500">น้ำรวม</span>
                    <span className="font-semibold text-stone-900">
                        {totalWater > 0 ? `${totalWater} g` : "—"}
                    </span>
                </div>
            </div>
        </main>
    );
}