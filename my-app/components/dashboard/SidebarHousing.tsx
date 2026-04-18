"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  History,
  Settings,
  LogOut,
  Search,
  PieChart,
  Building2,
  ShieldCheck,
  ClipboardList,
  UserCog,
} from "lucide-react";

export type HousingSection =
  | "dashboard" // Staff: Applications | Admin: System Stats
  | "users" // Admin Only
  | "create-user" // Admin Only
  | "logs" // Admin Only
  | "search" // Staff Only
  | "analytics" // Staff Only
  | "dorms" // Staff Only
  | "settings"; // Shared

export function SidebarHousing({
  activeSection,
  onSectionChange,
  onLogout,
}: {
  activeSection: HousingSection;
  onSectionChange: (section: HousingSection) => void;
  onLogout: () => void;
}) {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!mounted) return <div className="w-[280px]" />;

  const isAdmin = user?.role === "admin";
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (isAdmin ? "System Admin" : "Housing Staff");

  return (
    <aside className="sticky top-6 h-fit rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-[#eceff6] pb-5">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-lg bg-black`}
        >NU
        </div>
        <div>
          <p className="text-sm font-bold text-[#17172f]">
            {isAdmin ? "Admin Portal" : "Staff Portal"}
          </p>
          <p className="text-xs text-[#7d879b]">Housing System</p>
        </div>
      </div>

      <nav className="mt-5 space-y-1">
        {/* SHARED OVERVIEW */}
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label={isAdmin ? "System Overview" : "Applications"}
          active={activeSection === "dashboard"}
          onClick={() => onSectionChange("dashboard")}
        />

        {isAdmin ? (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98a2b3]">
                User Management
              </p>
            </div>
            <SidebarItem
              icon={<Users size={18} />}
              label="Active Users"
              active={activeSection === "users"}
              onClick={() => onSectionChange("users")}
            />
            <SidebarItem
              icon={<UserPlus size={18} />}
              label="Provision Account"
              active={activeSection === "create-user"}
              onClick={() => onSectionChange("create-user")}
            />
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98a2b3]">
                Security
              </p>
            </div>
            <SidebarItem
              icon={<History size={18} />}
              label="Audit Logs"
              active={activeSection === "logs"}
              onClick={() => onSectionChange("logs")}
            />
          </>
        ) : (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98a2b3]">
                Operations
              </p>
            </div>
            <SidebarItem
              icon={<Search size={18} />}
              label="Student Search"
              active={activeSection === "search"}
              onClick={() => onSectionChange("search")}
            />
            <SidebarItem
              icon={<Building2 size={18} />}
              label="Dorm Inventory"
              active={activeSection === "dorms"}
              onClick={() => onSectionChange("dorms")}
            />
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#98a2b3]">
                Reports
              </p>
            </div>
            <SidebarItem
              icon={<PieChart size={18} />}
              label="Occupancy Stats"
              active={activeSection === "analytics"}
              onClick={() => onSectionChange("analytics")}
            />
          </>
        )}

        <div className="pt-4">
          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            active={activeSection === "settings"}
            onClick={() => onSectionChange("settings")}
          />
        </div>
      </nav>

      {/* User Info Card */}
      <div className="mt-8 rounded-[24px] bg-[#f7f8fc] p-4 border border-[#eceff6]">
        <div className="flex items-center gap-2 mb-3">
          
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#98a2b3]">
            Signed in as 
          </p>
        </div>
        <p className="text-sm font-bold text-[#17172f] truncate">
          {displayName}
        </p>
        <p className="mt-1 break-all text-[11px] text-[#667085]">
          {user?.email}
        </p>
      </div>

      <button
        onClick={onLogout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e7eaf4] bg-white px-4 py-3 text-sm font-medium text-rose-500 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 shadow-sm"
      >
        <LogOut size={17} />
        Log out
      </button>
    </aside>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
        active
          ? "bg-[#6f63ff] text-white shadow-[0_14px_28px_rgba(111,99,255,0.22)]"
          : "text-[#475467] hover:bg-[#f5f7ff] hover:text-[#17172f]"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-white/15" : "bg-[#f3f4f8]"}`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
