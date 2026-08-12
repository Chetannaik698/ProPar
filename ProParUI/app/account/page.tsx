"use client";

import UserLayout from "@/components/UserLayout";
import { CreditCard, ShieldAlert, Award } from "lucide-react";

export default function AccountPage() {
  return (
    <UserLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#0B0D12]">
            Account & <span className="italic">Security</span>
          </h1>
          <p className="text-[15px] text-[#8A8F98] mt-1">
            Manage your subscription details, billing plan, and security audits.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-8 shadow-sm space-y-8">
          {/* Subscription Tier */}
          <div className="space-y-4">
            <h2 className="text-[16px] font-semibold text-[#0B0D12] flex items-center gap-2">
              <Award size={16} className="text-[#2F5DE0]" /> Membership Level
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl bg-[#F6F7F8] p-5 gap-4">
              <div>
                <p className="text-[15px] font-bold text-[#0B0D12]">ProPar Free tier</p>
                <p className="text-[13px] text-[#8A8F98] mt-0.5">
                  Access to Chrome Extension and 50 prompt checks monthly.
                </p>
              </div>
              <button className="rounded-xl bg-[#0B0D12] px-4 py-2 text-[13px] font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Upgrade to Premium
              </button>
            </div>
          </div>

          {/* Billing Info */}
          <div className="border-t border-[#E7E9EC] pt-6 space-y-4">
            <h2 className="text-[16px] font-semibold text-[#0B0D12] flex items-center gap-2">
              <CreditCard size={16} className="text-[#2F5DE0]" /> Billing & Invoices
            </h2>
            <p className="text-[13.5px] text-[#8A8F98]">
              No active payment methods saved. All analysis logs are free under current beta program.
            </p>
          </div>

          {/* Danger zone */}
          <div className="border-t border-red-100 pt-6 space-y-4">
            <h2 className="text-[16px] font-semibold text-red-600 flex items-center gap-2">
              <ShieldAlert size={16} /> Danger Zone
            </h2>
            <div className="rounded-xl border border-red-100 bg-red-50/20 p-5">
              <p className="text-[14px] font-semibold text-[#0B0D12]">Delete Account</p>
              <p className="text-[12.5px] text-[#8A8F98] mt-0.5">
                Permanently delete all your prompts analysis logs and configurations. This operation is irreversible.
              </p>
              <button className="mt-4 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 px-4 py-2 text-[13px] font-medium transition-all active:scale-[0.99]">
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
