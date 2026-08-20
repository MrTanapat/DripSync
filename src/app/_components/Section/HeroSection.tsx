"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Package, Coffee, AlertTriangle, PackageX } from "lucide-react";

export default function HeroSection() {
    const { data: session } = useSession();
    const { data: stats } = api.bean.getStats.useQuery();

    return (
        <div className="bg-white">
            <div className="relative isolate px-6 pt-28 lg:px-8">
                {/* Blur blob top */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                >
                    <div
                        style={{
                            clipPath:
                                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                        }}
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-amber-100 to-amber-200 opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    />
                </div>

                {/* Content */}
                <div className="mx-auto max-w-2xl px-6 pt-6 lg:px-6">
                    {/* Badge */}
                    <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                        <div className="relative rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                            เริ่มต้นดริปกาแฟได้เลย{" "}
                            <Link href="/brew" className="font-semibold text-amber-600">
                                <span aria-hidden="true" className="absolute inset-0" />
                                บันทึกการดริป <span aria-hidden="true">{"→"}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="text-center">
                        <h1 className="text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
                            จัดการคลังเมล็ดกาแฟ
                        </h1>
                        <p className="mt-6 text-lg text-stone-500">
                            ดูสถานะและปริมาณคงเหลือของเมล็ดกาแฟทั้งหมด
                        </p>

                        {/* CTA */}
                        <div className="mt-10 flex items-center justify-center gap-x-4">
                            <Link
                                href={session ? "/brew" : "/api/auth/signin"}
                                className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-400"
                            >
                                เริ่มดริปกาแฟ
                            </Link>
                            <Link
                                href={session ? "/beans" : "/api/auth/signin"}
                                className="text-sm font-semibold text-stone-600 hover:text-stone-900"
                            >
                                ดูคลังเมล็ด <span aria-hidden="true">{"→"}</span>
                            </Link>
                        </div>

                        {/* Stats cards */}
                        <div className="mt-10 grid grid-cols-2 gap-3 border-t border-stone-100 pt-8 sm:grid-cols-4">
                            {[
                                {
                                    icon: <Package className="h-5 w-5" />,
                                    label: "ปริมาณรวม",
                                    value: stats
                                        ? `${(stats.totalWeight / 1000).toFixed(2)} kg`
                                        : "—",
                                },
                                {
                                    icon: <Coffee className="h-5 w-5" />,
                                    label: "รายการทั้งหมด",
                                    value: stats ? `${stats.totalBeans} รายการ` : "—",
                                },
                                {
                                    icon: <AlertTriangle className="h-5 w-5" />,
                                    label: "ใกล้หมด",
                                    value: stats ? `${stats.lowStock} รายการ` : "—",
                                },
                                {
                                    icon: <PackageX className="h-5 w-5" />,
                                    label: "หมดสต็อก",
                                    value: stats ? `${stats.outOfStock} รายการ` : "—",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-4 text-left"
                                >
                                    <span className="text-stone-400">{stat.icon}</span>
                                    <p className="mt-3 text-xs text-stone-400">{stat.label}</p>
                                    <p className="mt-1 text-xl font-bold text-stone-900">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Blur blob bottom */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                >
                    <div
                        style={{
                            clipPath:
                                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                        }}
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-amber-100 to-amber-200 opacity-60 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    />
                </div>
            </div>
        </div>
    );
}