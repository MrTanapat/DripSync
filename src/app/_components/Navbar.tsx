"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // ย้ายเข้ามาใน component
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isBeansActive = pathname?.startsWith("/beans");
  const isBrewActive = pathname?.startsWith("/brew");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
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
            <nav className="hidden items-center gap-5 md:flex">
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
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/60 px-3 py-1.5 text-sm font-medium text-stone-700 backdrop-blur-sm transition-all duration-200 hover:border-stone-300 hover:bg-white/90"
                  >
                    <span className="max-w-[8rem] truncate">{session.user.name}</span>
                    <svg
                      className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                        }`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-stone-100 bg-white/90 p-1.5 shadow-lg backdrop-blur-xl">
                      <button
                        onClick={() => { setDropdownOpen(false); setProfileOpen(true); }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        โปรไฟล์
                      </button>
                      <div className="my-1 border-t border-stone-100" />
                      <button
                        onClick={() => { setDropdownOpen(false); void signOut(); }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="mt-3 border-t border-white/40 pt-3 md:hidden">
              {status === "loading" ? (
                <div className="h-9 animate-pulse rounded-full bg-stone-200" />
              ) : (
                <div className="flex flex-col gap-2 pb-2">
                  <Link href="/beans" onClick={closeMenu}
                    className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${isBeansActive ? "bg-amber-600 text-white" : "text-stone-600 hover:bg-white/60 hover:text-stone-900"
                      }`}
                  >
                    เมล็ดกาแฟ
                  </Link>
                  <Link href="/brew" onClick={closeMenu}
                    className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${isBrewActive ? "bg-amber-600 text-white" : "text-stone-600 hover:bg-white/60 hover:text-stone-900"
                      }`}
                  >
                    ประวัติการดริป
                  </Link>
                  {session ? (
                    <>
                      <button
                        onClick={() => { closeMenu(); setProfileOpen(true); }}
                        className="rounded-full px-3 py-2.5 text-left text-sm font-medium text-stone-600 hover:bg-white/60 hover:text-stone-900"
                      >
                        โปรไฟล์
                      </button>
                      <button
                        onClick={() => { closeMenu(); void signOut(); }}
                        className="w-full rounded-full border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-500"
                      >
                        ออกจากระบบ
                      </button>
                    </>
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
          </div>
        </header>
      </div>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}