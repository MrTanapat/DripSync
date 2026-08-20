"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
    const { data: session } = useSession();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    if (!session) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/40 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-900">โปรไฟล์</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Avatar + Info */}
                <div className="flex flex-col items-center gap-4">
                    {session.user.image ? (
                        <Image
                            src={session.user.image}
                            alt="avatar"
                            width={80}
                            height={80}
                            className="h-20 w-20 rounded-full ring-4 ring-stone-100"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl">
                            👤
                        </div>
                    )}
                    <div className="text-center">
                        <p className="text-xl font-bold text-stone-900">{session.user.name}</p>
                        <p className="mt-1 text-sm text-stone-400">{session.user.email}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-stone-100" />

                {/* Info rows */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                        <span className="text-sm text-stone-500">ชื่อ</span>
                        <span className="text-sm font-medium text-stone-900">{session.user.name}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                        <span className="text-sm text-stone-500">อีเมล</span>
                        <span className="text-sm font-medium text-stone-900">{session.user.email}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                        <span className="text-sm text-stone-500">เข้าสู่ระบบด้วย</span>
                        <span className="text-sm font-medium text-stone-900">Google</span>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                    ปิด
                </button>
            </div>
        </div>
    );
}