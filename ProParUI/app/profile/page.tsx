"use client";

import UserLayout from "@/components/UserLayout";
import { useAuth } from "@/components/AuthContext";
import { User, Mail, Shield, ShieldCheck, Clock } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <UserLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-[#0B0D12]">
            My <span className="italic">Profile</span>
          </h1>
          <p className="text-[15px] text-[#8A8F98] mt-1">
            View and manage your account credentials and personal details.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-8 shadow-sm space-y-6">
          {/* Avatar Area */}
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF1FE] font-display text-2xl font-semibold text-[#2F5DE0] uppercase">
              {user?.name?.substring(0, 2) || "U"}
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#0B0D12]">{user?.name}</h2>
              <p className="text-[13.5px] text-[#8A8F98] mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-[#E7E9EC] pt-6 grid gap-6 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <span className="text-[12px] font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} /> Full Name
              </span>
              <p className="text-[14.5px] font-medium text-[#0B0D12] bg-[#F6F7F8] rounded-xl px-4 py-2.5">
                {user?.name}
              </p>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <span className="text-[12px] font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={13} /> Email Address
              </span>
              <p className="text-[14.5px] font-medium text-[#0B0D12] bg-[#F6F7F8] rounded-xl px-4 py-2.5">
                {user?.email}
              </p>
            </div>

            {/* Login Provider */}
            <div className="space-y-1.5">
              <span className="text-[12px] font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={13} /> Identity Provider
              </span>
              <p className="text-[14.5px] font-medium text-[#0B0D12] bg-[#F6F7F8] rounded-xl px-4 py-2.5 capitalize">
                {user?.provider} authentication
              </p>
            </div>

            {/* Email Verified */}
            <div className="space-y-1.5">
              <span className="text-[12px] font-semibold text-[#8A8F98] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} /> Verification Status
              </span>
              <div className="flex items-center gap-2 text-[14.5px] font-medium text-[#0B0D12] bg-[#F6F7F8] rounded-xl px-4 py-2.5">
                {user?.provider !== 'email' || user?.isEmailVerified ? (
                  <>
                    <ShieldCheck size={16} className="text-green-600" />
                    <span className="text-green-700">Verified</span>
                  </>
                ) : (
                  <>
                    <Shield size={16} className="text-red-500" />
                    <span className="text-red-600">Pending verification</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
