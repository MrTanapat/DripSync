"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";

type BrewLog = RouterOutputs["brew"]["getAll"][number];

const DRIP_METHODS = [
  "V60",
  "Kalita Wave",
  "Chemex",
  "Aeropress",
  "French Press",
  "Origami",
  "Syphon",
  "Moka Pot",
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

type FormState = {
  beanId: string;
  coffeeDose: string;
  waterYield: string;
  waterTemp: string;
  grindSize: string;
  pours: string[];
  brewMinutes: string;
  brewSeconds: string;
  method: string;
  brewDate: string;
  rating: number;
  notes: string;
};

function emptyForm(): FormState {
  return {
    beanId:      "",
    coffeeDose:  "",
    waterYield:  "",
    waterTemp:   "",
    grindSize:   "",
    pours:       [""],
    brewMinutes: "",
    brewSeconds: "",
    method:      "",
    brewDate:    todayISO(),
    rating:      3,
    notes:       "",
  };
}

function formFromLog(log: BrewLog): FormState {
  const { minutes, seconds } = secondsToMinSec(log.brewTime);
  return {
    beanId:      log.beanId,
    coffeeDose:  String(log.coffeeDose),
    waterYield:  String(log.waterYield),
    waterTemp:   String(log.waterTemp),
    grindSize:   log.grindSize,
    pours:       log.pours.length > 0 ? log.pours.map(String) : [""],
    brewMinutes: String(minutes),
    brewSeconds: String(seconds),
    method:      log.method,
    brewDate:    toDateInputValue(log.brewDate),
    rating:      log.rating,
    notes:       log.notes ?? "",
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

  const { data: beans } = api.bean.getAll.useQuery();
  const utils = api.useUtils();

  const availableBeans = useMemo(() => {
    if (!beans) return [];
    const list = beans.filter((b) => !b.isFinished);
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

  function handlePourChange(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      pours: prev.pours.map((p, i) => (i === index ? value : p)),
    }));
  }

  function addPour() {
    setForm((prev) => ({ ...prev, pours: [...prev.pours, ""] }));
  }

  function removePour(index: number) {
    setForm((prev) => ({
      ...prev,
      pours: prev.pours.length <= 1 ? [""] : prev.pours.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const totalSeconds =
      (Number(form.brewMinutes) || 0) * 60 + (Number(form.brewSeconds) || 0);

    const data = {
      beanId:     form.beanId,
      coffeeDose: Number(form.coffeeDose),
      waterYield: Number(form.waterYield),
      waterTemp:  Number(form.waterTemp),
      grindSize:  form.grindSize,
      pours:      form.pours.map((p) => Number(p)).filter((n) => Number.isFinite(n) && n >= 0),
      brewTime:   totalSeconds,
      method:     form.method,
      brewDate:   new Date(form.brewDate),
      rating:     form.rating,
      notes:      form.notes || undefined,
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
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">เมล็ดกาแฟ</label>
            <select
              name="beanId"
              value={form.beanId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
            >
              <option value="" disabled>
                เลือกเมล็ดกาแฟ
              </option>
              {availableBeans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.name} — {bean.roaster} ({bean.weight} g เหลือ)
                </option>
              ))}
            </select>
            {availableBeans.length === 0 && (
              <p className="mt-1 text-xs text-red-500">ยังไม่มีเมล็ดกาแฟที่พร้อมชง</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <label className="mb-1 block text-sm font-medium text-coffee-700">น้ำ (g)</label>
              <input
                name="waterYield"
                type="number"
                min="0.1"
                step="0.1"
                value={form.waterYield}
                onChange={handleChange}
                required
                placeholder="300"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">น้ำ (°C)</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">เบอร์บด</label>
              <input
                name="grindSize"
                value={form.grindSize}
                onChange={handleChange}
                required
                placeholder="เช่น Medium-Fine, คลิก 18"
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
                {DRIP_METHODS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Pours */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-coffee-700">
                พลัว (วินาทีที่เท)
              </label>
              <button
                type="button"
                onClick={addPour}
                className="rounded-full bg-coffee-100 px-2.5 py-1 text-xs font-medium text-coffee-800 hover:bg-coffee-200"
              >
                + เพิ่มพลัว
              </button>
            </div>
            <div className="space-y-2">
              {form.pours.map((pour, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-coffee-500">พลัวที่ {i + 1}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pour}
                    onChange={(e) => handlePourChange(i, e.target.value)}
                    placeholder="วินาที"
                    className="w-full rounded-lg border border-coffee-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                  <span className="shrink-0 text-xs text-coffee-400">วิ</span>
                  <button
                    type="button"
                    onClick={() => removePour(i)}
                    aria-label="ลบพลัวนี้"
                    className="shrink-0 rounded-full px-2 py-1 text-coffee-400 hover:bg-red-50 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">เวลารวม</label>
            <div className="flex items-center gap-2">
              <input
                name="brewMinutes"
                type="number"
                min="0"
                step="1"
                value={form.brewMinutes}
                onChange={handleChange}
                required
                placeholder="3"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
              <span className="shrink-0 text-sm text-coffee-500">นาที</span>
              <input
                name="brewSeconds"
                type="number"
                min="0"
                max="59"
                step="1"
                value={form.brewSeconds}
                onChange={handleChange}
                required
                placeholder="30"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
              <span className="shrink-0 text-sm text-coffee-500">วินาที</span>
            </div>
          </div>

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

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">คะแนน</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rating: n }))}
                  className={`text-2xl ${n <= form.rating ? "text-coffee-600" : "text-coffee-200"}`}
                  aria-label={`${n} ดาว`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">
              เทสโน้ตที่ได้ <span className="text-coffee-400">(ไม่บังคับ)</span>
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
