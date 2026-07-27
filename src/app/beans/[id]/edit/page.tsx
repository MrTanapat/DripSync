"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react";

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

export default function EditBeanPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: beans } = api.bean.getAll.useQuery();
  const bean = beans?.find((b) => b.id === id);

  const [form, setForm] = useState({
    name:       "",
    roaster:    "",
    roastLevel: "MEDIUM" as "LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK",
    process:    "WASHED" as "WASHED" | "NATURAL" | "HONEY" | "ANAEROBIC" | "OTHER",
    tasteNotes: "",
    weight:     "",
    price:      "",
  });

  useEffect(() => {
    if (bean) {
      setForm({
        name:       bean.name,
        roaster:    bean.roaster,
        roastLevel: bean.roastLevel,
        process:    bean.process,
        tasteNotes: bean.tasteNotes ?? "",
        weight:     String(bean.weight),
        price:      String(bean.price),
      });
    }
  }, [bean]);

  const updateBean = api.bean.update.useMutation({
    onSuccess: () => router.push("/beans"),
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateBean.mutate({
      id,
      name:       form.name,
      roaster:    form.roaster,
      roastLevel: form.roastLevel,
      process:    form.process,
      tasteNotes: form.tasteNotes || undefined,
      weight:     Number(form.weight),
      price:      Number(form.price),
    });
  }

  if (!bean) return <p className="p-10 text-stone-400">กำลังโหลด...</p>;

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">✏️ แก้ไขเมล็ดกาแฟ</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">ชื่อเมล็ดกาแฟ</label>
          <input name="name" value={form.name} onChange={handleChange} required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">โรงคั่ว</label>
          <input name="roaster" value={form.roaster} onChange={handleChange} required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">ระดับการคั่ว</label>
            <select name="roastLevel" value={form.roastLevel} onChange={handleChange}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {ROAST_LEVELS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">โปรเซส</label>
            <select name="process" value={form.process} onChange={handleChange}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {PROCESSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">น้ำหนัก (กรัม)</label>
            <input name="weight" type="number" min="1" step="0.1" value={form.weight} onChange={handleChange} required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">ราคา (บาท)</label>
            <input name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Taste Notes <span className="text-stone-400">(ไม่บังคับ)</span>
          </label>
          <textarea name="tasteNotes" value={form.tasteNotes} onChange={handleChange} rows={2}
            placeholder="เช่น Jasmine, Peach, Brown Sugar"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        {updateBean.error && (
          <p className="text-sm text-red-500">{updateBean.error.message}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">
            ยกเลิก
          </button>
          <button type="submit" disabled={updateBean.isPending}
            className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
            {updateBean.isPending ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </main>
  );
}