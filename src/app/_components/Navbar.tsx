"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const MARKETING_LINKS = [
  { href: "#features", label: "ฟีเจอร์" },
  { href: "#origins", label: "จุดกำเนิดเมล็ด" },
  { href: "#plans", label: "แพ็กเกจ" },
] as const;

const SCROLL_THRESHOLD = 24;

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isBeansActive = pathname?.startsWith("/beans");
  const isBrewActive = pathname?.startsWith("/brew");
  const onHome = pathname === "/";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center transition-[padding] duration-300 ease-out ${scrolled ? "px-4 pt-3" : "px-0 pt-0"
        }`}
    >
      <header
        className={`pointer-events-auto w-full transition-all duration-300 ease-out ${menuOpen ? "rounded-3xl" : scrolled ? "rounded-full" : "rounded-none"
          } ${scrolled
            ? "max-w-3xl border border-white/50 bg-white/60 shadow-[0_8px_30px_rgba(78,52,46,0.12)] backdrop-blur-xl backdrop-saturate-150"
            : "max-w-none border border-transparent bg-white/0"
          } px-5 py-2.5`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-stone-900">DripSync</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {session ? (
              <>
                <Link
                  href="/beans"
                  aria-current={isBeansActive ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isBeansActive
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-stone-600 hover:bg-white/70 hover:text-stone-900 hover:shadow-sm"
                    }`}
                >
                  Beans
                </Link>
                <Link
                  href="/brew"
                  aria-current={isBrewActive ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isBrewActive
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-stone-600 hover:bg-white/70 hover:text-stone-900 hover:shadow-sm"
                    }`}
                >
                  Brew
                </Link>
              </>
            ) : (
              onHome &&
              MARKETING_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition-all duration-200 hover:bg-white/70 hover:text-stone-900"
                >
                  {link.label}
                </a>
              ))
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-3 md:flex">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-full bg-stone-200" />
            ) : session ? (
              <>
                <button
                  onClick={() => void signOut()}
                  className="rounded-full border border-stone-200/80 bg-white/60 px-4 py-2 text-sm font-medium text-stone-700 backdrop-blur-sm transition-all duration-200 hover:border-stone-300 hover:bg-white/90 hover:text-stone-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => void signIn("google")}
                className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-stone-700"
              >
                Login
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
            ) : session ? (
              <div className="flex flex-col gap-2 pb-2">
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
                <Link
                  href="/beans"
                  onClick={closeMenu}
                  className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${isBeansActive
                    ? "bg-amber-600 text-white"
                    : "text-stone-600 hover:bg-white/60 hover:text-stone-900"
                    }`}
                >
                  ☕ Beans
                </Link>
                <Link
                  href="/brew"
                  onClick={closeMenu}
                  className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${isBrewActive
                    ? "bg-amber-600 text-white"
                    : "text-stone-600 hover:bg-white/60 hover:text-stone-900"
                    }`}
                >
                  🫗 Brew
                </Link>
                <button
                  onClick={() => {
                    closeMenu();
                    void signOut();
                  }}
                  className="w-full rounded-full border border-stone-200/80 bg-white/60 px-4 py-2.5 text-sm font-medium text-stone-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pb-2">
                {onHome &&
                  MARKETING_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className="rounded-full px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-white/60 hover:text-stone-900"
                    >
                      {link.label}
                    </a>
                  ))}
                <button
                  onClick={() => {
                    closeMenu();
                    void signIn("google");
                  }}
                  className="w-full rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Google Login
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
