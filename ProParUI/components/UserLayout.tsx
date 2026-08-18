"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, User as UserIcon, Settings, ShieldCheck, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: UserIcon },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Account", href: "/account", icon: ShieldCheck },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#FAFBFC]">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#E7E9EC] bg-white md:block">
          <div className="flex h-full flex-col justify-between py-6 px-4">
            <div>
              {/* Logo */}
              <div className="mb-8 px-2">
                <Logo href="/" size={24} wordmarkClassName="font-display text-lg tracking-tight text-[#0B0D12]" />
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-all ${
                        isActive
                          ? "bg-[#0B0D12] text-white"
                          : "text-[#8A8F98] hover:bg-[#F6F7F8] hover:text-[#0B0D12]"
                      }`}
                    >
                      <item.icon size={18} className={isActive ? "text-white" : "text-[#8A8F98] group-hover:text-[#0B0D12]"} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Footer Profile */}
            <div className="border-t border-[#E7E9EC] pt-4">
              <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF1FE] font-display text-[15px] font-semibold text-[#2F5DE0] uppercase">
                  {user?.name?.substring(0, 2) || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-[14px] font-semibold text-[#0B0D12]">{user?.name}</p>
                  <p className="truncate text-[12px] text-[#8A8F98]">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-red-600 transition-all hover:bg-red-50/50"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navbar Header */}
        <div className="flex flex-1 flex-col md:pl-64">
          <header className="flex h-16 items-center justify-between border-b border-[#E7E9EC] bg-white px-6 md:hidden">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0B0D12]">
                <span className="block h-2 w-2 rounded-full bg-[#2F5DE0]" />
              </span>
              <span className="font-display text-md tracking-tight text-[#0B0D12]">
                ProPaar
              </span>
            </Link>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-[#8A8F98] hover:text-[#0B0D12]"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 px-6 py-8 md:px-10 md:py-12">
            <div className="mx-auto max-w-4xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
