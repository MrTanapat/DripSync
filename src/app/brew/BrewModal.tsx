"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";

type BrewLog = RouterOutputs["brew"]["getAll"][number];

const DRIP_METHODS = [
  "V60", "Kalita Wave", "Chemex", "Aeropress",
  "French Press", "Origami", "Syphon", "Moka Pot",
] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

function secondsToMinSec(totalSeconds: number) {
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
}

// Pour แต่ละครั้งมี 2 ค่า
type Pour = {
  grams: string;   // กี่กรัม
  waitUntil: string; // รอถึงวินาทีที่เท่าไหร่
};

type FormState = {
  beanId: string;
  coffeeDose: string;
  waterTemp: string;
  grindSize: string;
  pours: Pour[];
  method: string;
  brewDate: string;
  rating: number;
  notes: string;
};

function emptyForm(): FormState {
  return {
    beanId: "",
    coffeeDose: "",
    waterTemp: "",
    grindSize: "",
    pours: [{ grams: "", waitUntil: "" }],
    method: "",
    brewDate: todayISO(),
    rating: 3,
    notes: "",
  };
}

function formFromLog(log: BrewLog): FormState {
  // reconstruct pours จาก log.pours (วินาที) และ log.pourGrams (กรัม)
  const pours: Pour[] = log.pours.map((waitUntil, i) => ({
    grams: String(log.pourGrams?.[i] ?? ""),
    waitUntil: String(waitUntil),
  }));

  return {
    beanId: log.beanId,
    coffeeDose: String(log.coffeeDose),
    waterTemp: String(log.waterTemp),
    grindSize: log.grindSize,
    pours: pours.length > 0 ? pours : [{ grams: "", waitUntil: "" }],
    method: log.method,
    brewDate: toDateInputValue(log.brewDate),
    rating: log.rating,
    notes: log.notes ?? "",
  };
}

export default function BrewModal({
  log,
  onClose,
}: {
  log: BrewLog | null;
  onClose: () => void;
}) {
  const isEdit = !!log;
  const [form, setForm] = useState<FormState>(log ? formFromLog(log) : emptyForm());
  useEffect(() => {
    if (log) {
      setForm(formFromLog(log));
    }
  }, [log]);

  const { data: beans } = api.bean.getAll.useQuery();
  const utils = api.useUtils();

  // คำนวณ waterYield และ brewTime อัตโนมัติ
  const waterYield = useMemo(() => {
    return form.pours
      .map((p) => Number(p.grams))
      .filter((n) => Number.isFinite(n) && n > 0)
      .reduce((sum, n) => sum + n, 0);
  }, [form.pours]);

  const brewTime = useMemo(() => {
    const last = form.pours[form.pours.length - 1];
    return Number(last?.waitUntil) || 0;
  }, [form.pours]);

  const { minutes: brewMin, seconds: brewSec } = secondsToMinSec(brewTime);

  const availableBeans = useMemo(() => {
    if (!beans) return [];
    const list = beans.filter((b) => !b.isFinished && b.weight > 0);
    if (log && !list.some((b) => b.id === log.beanId)) {
      const current = beans.find((b) => b.id === log.beanId);
      if (current) list.unshift(current);
    }
    return list;
  }, [beans, log]);

  const createBrew = api.brew.create.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.brew.getAll.invalidate(), utils.bean.getAll.invalidate()]);
      onClose();
    },
  });

  const updateBrew = api.brew.update.useMutation({
    onSuccess: async () => {
      await utils.brew.getAll.invalidate();
      onClose();
    },
  });

  const mutation = isEdit ? updateBrew : createBrew;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePourChange(index: number, field: keyof Pour, value: string) {
    setForm((prev) => ({
      ...prev,
      pours: prev.pours.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  }

  function addPour() {
    setForm((prev) => ({
      ...prev,
      pours: [...prev.pours, { grams: "", waitUntil: "" }],
    }));
  }

  function removePour(index: number) {
    setForm((prev) => ({
      ...prev,
      pours: prev.pours.length <= 1
        ? [{ grams: "", waitUntil: "" }]
        : prev.pours.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      beanId: form.beanId,
      coffeeDose: Number(form.coffeeDose),
      waterYield,
      waterTemp: Number(form.waterTemp),
      grindSize: form.grindSize,
      pours: form.pours.map((p) => Number(p.waitUntil)),
      pourGrams: form.pours.map((p) => Number(p.grams)),
      brewTime,
      method: form.method,
      brewDate: new Date(form.brewDate),
      rating: form.rating,
      notes: form.notes || undefined,
    };

    if (isEdit && log) {
      updateBrew.mutate({ id: log.id, ...data });
    } else {
      createBrew.mutate(data);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-coffee-900/40 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-cream-50 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-coffee-900">
            {isEdit ? "✏️ แก้ไขบันทึกการชง" : "🫗 บันทึกการชงใหม่"}
          </h2>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="rounded-full p-1.5 text-coffee-400 hover:bg-coffee-100 hover:text-coffee-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* เมล็ดกาแฟ */}
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">เมล็ดกาแฟ</label>
            <select
              name="beanId"
              value={form.beanId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
            >
              <option value="" disabled>เลือกเมล็ดกาแฟ</option>
              {availableBeans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.name} — {bean.roaster} ({bean.weight}g)
                </option>
              ))}
            </select>
            {availableBeans.length === 0 && (
              <p className="mt-1 text-xs text-red-500">ยังไม่มีเมล็ดกาแฟที่พร้อมชง</p>
            )}
          </div>

          {/* โดส + อุณหภูมิ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">โดส (g)</label>
              <input
                name="coffeeDose"
                type="number"
                min="0.1"
                step="0.1"
                value={form.coffeeDose}
                onChange={handleChange}
                required
                placeholder="18"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">อุณหภูมิน้ำ (°C)</label>
              <input
                name="waterTemp"
                type="number"
                min="1"
                step="0.5"
                value={form.waterTemp}
                onChange={handleChange}
                required
                placeholder="93"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
            </div>
          </div>

          {/* เบอร์บด + วิธีดริป */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">เบอร์บด</label>
              <input
                name="grindSize"
                value={form.grindSize}
                onChange={handleChange}
                required
                placeholder="เช่น Medium-Fine"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">วิธีดริป</label>
              <input
                name="method"
                value={form.method}
                onChange={handleChange}
                required
                list="drip-methods"
                placeholder="เช่น V60"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
              <datalist id="drip-methods">
                {DRIP_METHODS.map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>
          </div>

          {/* Pours */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-coffee-700">พลัว</label>
              <button
                type="button"
                onClick={addPour}
                className="rounded-full bg-coffee-100 px-2.5 py-1 text-xs font-medium text-coffee-800 hover:bg-coffee-200"
              >
                + เพิ่มพลัว
              </button>
            </div>

            {/* Header */}
            <div className="mb-1 grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 px-1">
              <span />
              <span className="text-xs text-coffee-500">น้ำ (g)</span>
              <span className="text-xs text-coffee-500">รอถึงวิที่</span>
              <span />
            </div>

            <div className="space-y-2">
              {form.pours.map((pour, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2">
                  <span className="text-center text-xs font-medium text-coffee-400">
                    {i + 1}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={pour.grams}
                    onChange={(e) => handlePourChange(i, "grams", e.target.value)}
                    placeholder="50"
                    className="w-full rounded-lg border border-coffee-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pour.waitUntil}
                    onChange={(e) => handlePourChange(i, "waitUntil", e.target.value)}
                    placeholder="45"
                    className="w-full rounded-lg border border-coffee-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                  <button
                    type="button"
                    onClick={() => removePour(i)}
                    aria-label="ลบพลัวนี้"
                    className="rounded-full p-1 text-coffee-300 hover:bg-red-50 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary คำนวณอัตโนมัติ */}
            <div className="mt-3 rounded-xl bg-coffee-50 px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-coffee-600">น้ำรวม</span>
                <span className="font-semibold text-coffee-900">
                  {waterYield > 0 ? `${waterYield} g` : "—"}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-coffee-600">เวลารวม</span>
                <span className="font-semibold text-coffee-900">
                  {brewTime > 0 ? `${brewMin}:${String(brewSec).padStart(2, "0")} นาที` : "—"}
                </span>
              </div>
              {waterYield > 0 && Number(form.coffeeDose) > 0 && (
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-coffee-600">Ratio</span>
                  <span className="font-semibold text-coffee-900">
                    1:{(waterYield / Number(form.coffeeDose)).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* วันที่ */}
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">วันที่ดริป</label>
            <input
              name="brewDate"
              type="date"
              value={form.brewDate}
              onChange={handleChange}
              required
              max={todayISO()}
              className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>

          {/* คะแนน */}
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">คะแนน</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rating: n }))}
                  className={`text-2xl transition-colors ${n <= form.rating ? "text-coffee-600" : "text-coffee-200"
                    }`}
                  aria-label={`${n} ดาว`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">
              เทสโน้ต <span className="text-coffee-400">(ไม่บังคับ)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="เช่น รสชาติ กลิ่น ข้อสังเกต"
              className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>

          {mutation.error && (
            <p className="text-sm text-red-500">{mutation.error.message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-coffee-200 py-2 text-sm font-medium text-coffee-600 hover:bg-coffee-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || availableBeans.length === 0}
              className="flex-1 rounded-lg bg-coffee-600 py-2 text-sm font-medium text-cream-50 hover:bg-coffee-700 disabled:opacity-50"
            >
              {mutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}