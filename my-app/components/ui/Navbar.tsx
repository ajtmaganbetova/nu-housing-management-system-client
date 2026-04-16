"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { clearStoredSession, getStoredSession } from "@/lib/auth";

function getInitials(email?: string, firstName?: string, lastName?: string) {
  const source =
    [firstName, lastName].filter(Boolean).join(" ").trim() || email || "NU";
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Navbar() {
  const router = useRouter();
  const user = useMemo(() => getStoredSession().user ?? {}, []);

  const handleLogout = () => {
    clearStoredSession();
    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-white/60 bg-white/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17172f] text-sm font-semibold text-white shadow-[0_14px_30px_rgba(23,23,47,0.2)]">
            NU
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-[#17172f]">
              NU Housing
            </p>
            <p className="text-xs text-[#7d879b]">Smart housing workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.email && (
            <div className="hidden rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-[#5e6578] shadow-[0_8px_24px_rgba(122,132,173,0.1)] md:flex md:items-center md:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-semibold text-[#17172f]">
                {getInitials(user.email, user.firstName, user.lastName)}
              </div>
              <span>{user.email}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full bg-[#17172f] px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(23,23,47,0.18)] transition hover:-translate-y-0.5"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
