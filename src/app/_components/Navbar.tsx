"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isBeansActive = pathname?.startsWith("/beans");
  const isBrewActive = pathname?.startsWith("/brew");

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <header
        className={`pointer-events-auto w-full max-w-3xl transition-all duration-300 ease-out ${menuOpen ? "rounded-3xl" : "rounded-full"
          } border border-white/50 bg-white/60 px-5 py-2.5 shadow-[0_8px_30px_rgba(78,52,46,0.12)] backdrop-blur-xl backdrop-saturate-150`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-stone-900">DripSync</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/beans"
              aria-current={isBeansActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isBeansActive
                ? "bg-amber-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-white/70 hover:text-stone-900 hover:shadow-sm"
                }`}
            >
              เมล็ดกาแฟ
            </Link>
            <Link
              href="/brew"
              aria-current={isBrewActive ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isBrewActive
                ? "bg-amber-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-white/70 hover:text-stone-900 hover:shadow-sm"
                }`}
            >
              ประวัติการดริป
            </Link>
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-3 md:flex">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-full bg-stone-200" />
            ) : session ? (
              <>
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="avatar"
                    className="h-7 w-7 rounded-full ring-2 ring-white/60"
                  />
                )}
                <span className="max-w-[8rem] truncate text-sm font-medium text-stone-700">
                  {session.user.name}
                </span>
                <button
                  onClick={() => void signOut()}
                  className="rounded-full border border-stone-200/80 bg-white/60 px-4 py-2 text-sm font-medium text-stone-700 backdrop-blur-sm transition-all duration-200 hover:border-stone-300 hover:bg-white/90 hover:text-stone-900"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <button
                onClick={() => void signIn("google")}
                className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-stone-700"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="rounded-full p-2 text-stone-700 transition-colors hover:bg-white/60 md:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" className="mt-3 border-t border-white/40 pt-3 md:hidden">
            {status === "loading" ? (
              <div className="h-9 animate-pulse rounded-full bg-stone-200" />
            ) : (
              <div className="flex flex-col gap-2 pb-2">
                {session && (
                  <div className="flex items-center gap-2 px-2 py-1">
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt="avatar"
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <p className="text-sm font-medium text-stone-700">{session.user.name}</p>
                  </div>
                )}
                <Link
                  href="/beans"
                  onClick={closeMenu}
                  className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${isBeansActive
                    ? "bg-amber-600 text-white"
                    : "text-stone-600 hover:bg-white/60 hover:text-stone-900"
                    }`}
                >
                  ☕ เมล็ดกาแฟ
                </Link>
                <Link
                  href="/brew"
                  onClick={closeMenu}
                  className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${isBrewActive
                    ? "bg-amber-600 text-white"
                    : "text-stone-600 hover:bg-white/60 hover:text-stone-900"
                    }`}
                >
                  🫗 ประวัติการดริป
                </Link>
                {session ? (
                  <button
                    onClick={() => { closeMenu(); void signOut(); }}
                    className="w-full rounded-full border border-stone-200/80 bg-white/60 px-4 py-2.5 text-sm font-medium text-stone-700"
                  >
                    ออกจากระบบ
                  </button>
                ) : (
                  <button
                    onClick={() => { closeMenu(); void signIn("google"); }}
                    className="w-full rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    เข้าสู่ระบบด้วย Google
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}