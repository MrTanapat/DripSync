"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

const ASPECT_RATIO = 16 / 9;
const MAX_OUTPUT_WIDTH = 960;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err: unknown) => reject(err as Error));
    image.src = url;
  });
}

async function getCroppedImage(imageSrc: string, cropPixels: Area): Promise<string> {
  const image = await createImage(imageSrc);
  const scale = Math.min(1, MAX_OUTPUT_WIDTH / cropPixels.width);
  const canvas = document.createElement("canvas");
  canvas.width = cropPixels.width * scale;
  canvas.height = cropPixels.height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ไม่สามารถประมวลผลรูปภาพได้");

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function ImageCropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: {
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setIsSaving(true);
    setError("");
    try {
      const dataUrl = await getCroppedImage(imageSrc, croppedAreaPixels);
      onConfirm(dataUrl);
    } catch {
      setError("ครอปรูปไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-coffee-900/60 px-4 py-8"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-cream-50 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-lg font-bold text-coffee-900">ครอปรูปภาพ</h3>

        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-coffee-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT_RATIO}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-coffee-600">ซูม</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-coffee-600"
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-coffee-200 py-2 text-sm font-medium text-coffee-600 hover:bg-coffee-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSaving || !croppedAreaPixels}
            className="flex-1 rounded-lg bg-coffee-600 py-2 text-sm font-medium text-cream-50 hover:bg-coffee-700 disabled:opacity-50"
          >
            {isSaving ? "กำลังบันทึก..." : "ใช้รูปนี้"}
          </button>
        </div>
      </div>
    </div>
  );
}
