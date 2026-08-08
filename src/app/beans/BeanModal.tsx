"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import ImageCropModal from "./ImageCropModal";

type Bean = RouterOutputs["bean"]["getAll"][number];

const ROAST_LEVELS = [
  { value: "LIGHT",       label: "Light (อ่อน)" },
  { value: "MEDIUM",      label: "Medium (กลาง)" },
  { value: "MEDIUM_DARK", label: "Medium Dark (กลางเข้ม)" },
  { value: "DARK",        label: "Dark (เข้ม)" },
] as const;

const PROCESSES = [
  { value: "WASHED",    label: "Washed" },
  { value: "NATURAL",   label: "Natural" },
  { value: "HONEY",     label: "Honey" },
  { value: "ANAEROBIC", label: "Anaerobic" },
  { value: "OTHER",     label: "Other" },
] as const;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

type FormState = {
  name: string;
  roaster: string;
  roastDate: string;
  roastLevel: (typeof ROAST_LEVELS)[number]["value"];
  process: (typeof PROCESSES)[number]["value"];
  tasteNotes: string;
  weight: string;
  price: string;
  imageUrl: string;
};

function emptyForm(): FormState {
  return {
    name:       "",
    roaster:    "",
    roastDate:  todayISO(),
    roastLevel: "MEDIUM",
    process:    "WASHED",
    tasteNotes: "",
    weight:     "",
    price:      "",
    imageUrl:   "",
  };
}

function formFromBean(bean: Bean): FormState {
  return {
    name:       bean.name,
    roaster:    bean.roaster,
    roastDate:  toDateInputValue(bean.roastDate),
    roastLevel: bean.roastLevel,
    process:    bean.process,
    tasteNotes: bean.tasteNotes ?? "",
    weight:     String(bean.weight),
    price:      String(bean.price),
    imageUrl:   bean.imageUrl ?? "",
  };
}

export default function BeanModal({
  bean,
  onClose,
}: {
  bean: Bean | null;
  onClose: () => void;
}) {
  const isEdit = !!bean;
  const [form, setForm] = useState<FormState>(bean ? formFromBean(bean) : emptyForm());
  const [imageError, setImageError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  const createBean = api.bean.create.useMutation({
    onSuccess: async () => {
      await utils.bean.getAll.invalidate();
      onClose();
    },
  });

  const updateBean = api.bean.update.useMutation({
    onSuccess: async () => {
      await utils.bean.getAll.invalidate();
      onClose();
    },
  });

  const mutation = isEdit ? updateBean : createBean;

  useEffect(() => {
    if (cropSrc) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, cropSrc]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("ไฟล์รูปใหญ่เกินไป (ไม่เกิน 2MB)");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleCropConfirm(croppedDataUrl: string) {
    setForm((prev) => ({ ...prev, imageUrl: croppedDataUrl }));
    setCropSrc(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name:       form.name,
      roaster:    form.roaster,
      roastDate:  new Date(form.roastDate),
      roastLevel: form.roastLevel,
      process:    form.process,
      tasteNotes: form.tasteNotes || undefined,
      weight:     Number(form.weight),
      price:      Number(form.price),
      imageUrl:   form.imageUrl || undefined,
    };

    if (isEdit && bean) {
      updateBean.mutate({ id: bean.id, ...data });
    } else {
      createBean.mutate(data);
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
            {isEdit ? "✏️ แก้ไขเมล็ดกาแฟ" : "☕ เพิ่มเมล็ดกาแฟใหม่"}
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
          {/* Image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">รูปภาพ (ไม่บังคับ)</label>
            <div className="relative">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt=""
                  className="h-32 w-full rounded-lg border border-coffee-100 object-cover"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-lg border border-coffee-100 bg-coffee-50 text-4xl">
                  ☕
                </div>
              )}
              <div className="absolute right-2 bottom-2 flex gap-2">
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setCropSrc(form.imageUrl)}
                    className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-coffee-700 shadow hover:bg-white"
                  >
                    ครอปใหม่
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-coffee-700 shadow hover:bg-white"
                >
                  {form.imageUrl ? "เปลี่ยนรูป" : "เลือกรูป"}
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">ชื่อเมล็ดกาแฟ</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="เช่น Ethiopia Yirgacheffe"
              className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">โรงคั่ว</label>
            <input
              name="roaster"
              value={form.roaster}
              onChange={handleChange}
              required
              placeholder="เช่น Roots, Ceresia"
              className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">วันที่คั่ว</label>
            <input
              name="roastDate"
              type="date"
              value={form.roastDate}
              onChange={handleChange}
              required
              max={todayISO()}
              className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">ระดับการคั่ว</label>
              <select
                name="roastLevel"
                value={form.roastLevel}
                onChange={handleChange}
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {ROAST_LEVELS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">โปรเซส</label>
              <select
                name="process"
                value={form.process}
                onChange={handleChange}
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {PROCESSES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">น้ำหนัก (กรัม)</label>
              <input
                name="weight"
                type="number"
                min="1"
                step="0.1"
                value={form.weight}
                onChange={handleChange}
                required
                placeholder="250"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-coffee-700">ราคา (บาท)</label>
              <input
                name="price"
                type="number"
                min="1"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="500"
                className="w-full rounded-lg border border-coffee-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-coffee-700">
              Taste Notes <span className="text-coffee-400">(ไม่บังคับ)</span>
            </label>
            <textarea
              name="tasteNotes"
              value={form.tasteNotes}
              onChange={handleChange}
              rows={2}
              placeholder="เช่น Jasmine, Peach, Brown Sugar"
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
              disabled={mutation.isPending}
              className="flex-1 rounded-lg bg-coffee-600 py-2 text-sm font-medium text-cream-50 hover:bg-coffee-700 disabled:opacity-50"
            >
              {mutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  );
}
