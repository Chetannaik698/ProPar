"use client";

import UserLayout from "@/components/UserLayout";
import { useAuth } from "@/components/AuthContext";
import { FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <UserLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#0B0D12]">
            Welcome back, <span className="italic">{user?.name}</span>
          </h1>
          <p className="text-[15px] text-[#8A8F98] mt-1">
            Here is an overview of your writing analytics and active integrations.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#8A8F98]">Total Scans</span>
              <FileText className="h-5 w-5 text-[#2F5DE0]" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-[#0B0D12]">48</p>
            <p className="mt-1 text-[12px] text-green-600">↑ 12% from last week</p>
          </div>

          <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#8A8F98]">Clarity Score</span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-[#0B0D12]">92%</p>
            <p className="mt-1 text-[12px] text-[#8A8F98]">Highly readable</p>
          </div>

          <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#8A8F98]">Saved Drafts</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-[#0B0D12]">7</p>
            <p className="mt-1 text-[12px] text-[#8A8F98]">Ready to send</p>
          </div>
        </div>

        {/* Extensions status */}
        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#0B0D12] mb-4">Chrome Extension Status</h2>
          <div className="flex items-center gap-4 rounded-xl bg-green-50/50 border border-green-100 p-4">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            <div>
              <p className="text-[14.5px] font-semibold text-green-900">Active and Connected</p>
              <p className="text-[13px] text-green-700 mt-0.5">
                ProPaar is scanning your writing locally and protecting your composer windows.
              </p>
            </div>
          </div>
        </div>

        {/* Recent scan logs */}
        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#0B0D12] mb-4">Recent Scans</h2>
          <div className="divide-y divide-[#E7E9EC]">
            {[
              { title: "LinkedIn Outreach to Product Lead", date: "2 hours ago", status: "Clean" },
              { title: "Email draft to CEO about roadmap updates", date: "Yesterday", status: "Missing context" },
              { title: "ChatGPT Prompt for code review assistance", date: "3 days ago", status: "Clean" },
            ].map((scan, i) => (
              <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-[14.5px] font-medium text-[#0B0D12]">{scan.title}</p>
                  <p className="text-[12px] text-[#8A8F98] mt-0.5">{scan.date}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  scan.status === "Clean"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {scan.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
