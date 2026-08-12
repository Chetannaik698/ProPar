"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

const NAV_LINKS = [
  { label: "Product", href: "#how-propar-thinks" },
  { label: "Workflow", href: "#workflow" },
  { label: "Platforms", href: "#platforms" },
  { label: "Privacy", href: "#privacy" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClose = () => setDropdownOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [dropdownOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="container-content">
        <div
          className={cn(
            "flex items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300",
            scrolled
              ? "border-line bg-white/80 shadow-soft backdrop-blur-md"
              : "border-transparent bg-transparent"
          )}
        >
          <a href="#top" className="flex items-center gap-2 focus-ring rounded-full px-2 py-1">
            <Image
              src="/logo.png"
              alt="ProPar Logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8 object-contain"
            />
            <span className="font-display text-[18px] tracking-tight text-ink">ProPar</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="focus-ring rounded-full px-3.5 py-2 text-[14px] text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 rounded-full border border-line bg-white/50 pl-2 pr-3 py-1.5 transition-all hover:bg-mist active:scale-[0.98] focus-ring"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white font-semibold text-[13px] overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <span className="max-w-[120px] truncate text-[14px] font-medium text-ink">
                    {user.name || "User"}
                  </span>
                  <ChevronDown size={14} className={cn("text-ink-soft transition-transform duration-200", dropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-line bg-white p-2 shadow-lift z-50"
                    >
                      <div className="px-3.5 py-2.5">
                        <p className="text-[14px] font-semibold text-ink leading-none">{user.name}</p>
                        <p className="mt-1.5 truncate text-[12px] text-ink-faint leading-none">{user.email}</p>
                      </div>
                      <div className="h-px bg-line my-1.5" />
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-red-600 transition-colors hover:bg-red-50 text-left"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="focus-ring rounded-full px-4 py-2 text-[14px] text-ink-soft transition-colors hover:text-ink"
                >
                  Sign in
                </a>
                <a
                  href="/auth/login"
                  className="focus-ring rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  Add to Chrome
                </a>
              </>
            )}
          </div>

          <button
            className="focus-ring rounded-full p-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="container-content mt-2 md:hidden"
          >
            <div className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-3 shadow-card">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring rounded-xl px-3 py-2.5 text-[15px] text-ink-soft hover:bg-mist hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <div className="border-t border-line mt-2 pt-2.5 px-1">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white font-semibold text-[14px] overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                      ) : user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14.5px] font-semibold text-ink truncate">{user.name}</p>
                      <p className="text-[12.5px] text-ink-faint truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="focus-ring mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[14px] font-medium text-red-600 hover:bg-red-50/50 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              ) : (
                <a
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="focus-ring mt-1 rounded-xl bg-ink px-3 py-2.5 text-center text-[15px] font-medium text-white"
                >
                  Add to Chrome
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
