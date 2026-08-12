"use client";

import UserLayout from "@/components/UserLayout";
import { useState } from "react";
import { Sliders, Bell, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [tone, setTone] = useState("professional");
  const [realtime, setRealtime] = useState(true);
  const [notify, setNotify] = useState(false);

  return (
    <UserLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#0B0D12]">
            Preferences & <span className="italic">Settings</span>
          </h1>
          <p className="text-[15px] text-[#8A8F98] mt-1">
            Configure your AI partner tone, extension scans, and privacy features.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-8 shadow-sm space-y-8">
          {/* Tone Section */}
          <div className="space-y-4">
            <h2 className="text-[16px] font-semibold text-[#0B0D12] flex items-center gap-2">
              <Sparkles size={16} className="text-[#2F5DE0]" /> Writing Style & Persona
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "professional", label: "Professional", desc: "For work and outreach" },
                { id: "casual", label: "Casual", desc: "For friendly conversation" },
                { id: "creative", label: "Creative", desc: "For engaging posts" },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setTone(style.id)}
                  className={`text-left rounded-xl border p-4 transition-all focus:outline-none ${
                    tone === style.id
                      ? "border-[#0B0D12] bg-[#FAFBFC]"
                      : "border-[#E7E9EC] hover:border-[#D1D5DB]"
                  }`}
                >
                  <p className="text-[14px] font-semibold text-[#0B0D12]">{style.label}</p>
                  <p className="text-[12px] text-[#8A8F98] mt-0.5">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Extension Settings */}
          <div className="border-t border-[#E7E9EC] pt-6 space-y-4">
            <h2 className="text-[16px] font-semibold text-[#0B0D12] flex items-center gap-2">
              <Sliders size={16} className="text-[#2F5DE0]" /> Scan Settings
            </h2>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14.5px] font-medium text-[#0B0D12]">Real-time feedback</p>
                <p className="text-[12.5px] text-[#8A8F98] mt-0.5">
                  Analyze prompts live as you type in ChatGPT composer.
                </p>
              </div>
              <input
                type="checkbox"
                checked={realtime}
                onChange={(e) => setRealtime(e.target.checked)}
                className="h-5 w-10 cursor-pointer rounded-full bg-[#E7E9EC] border-transparent accent-[#0B0D12]"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="border-t border-[#E7E9EC] pt-6 space-y-4">
            <h2 className="text-[16px] font-semibold text-[#0B0D12] flex items-center gap-2">
              <Bell size={16} className="text-[#2F5DE0]" /> Notifications
            </h2>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14.5px] font-medium text-[#0B0D12]">Email notifications</p>
                <p className="text-[12.5px] text-[#8A8F98] mt-0.5">
                  Receive weekly analytics reports and productivity updates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="h-5 w-10 cursor-pointer rounded-full bg-[#E7E9EC] border-transparent accent-[#0B0D12]"
              />
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
