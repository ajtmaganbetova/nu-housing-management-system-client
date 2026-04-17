import {
  LayoutDashboard,
  Search,
  PieChart,
  Building2,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

// Update this type to match your admin needs
export type HousingSection =
  | "dashboard"
  | "search"
  | "analytics"
  | "dorms"
  | "settings";

export interface User {
  id: number;
  email: string;
  nu_id: string;
  role: "student" | "admin" | "staff";
  phone: string;
  firstName?: string;
  lastName?: string;
}

interface HousingSidebarProps {
  activeSection: HousingSection;
  onSectionChange: (section: HousingSection) => void;
  user: User | null;
  onLogout: () => void;
}

export function SidebarHousing({
  activeSection,
  onSectionChange,
  user,
  onLogout,
}: HousingSidebarProps) {
  // Use the name from the DB, or fallback to their role title
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (user?.role === "admin" ? "System Admin" : "Housing Staff");

  return (
    <aside className="sticky top-6 h-fit rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur">
      {/* Brand Header - Changed to Indigo to differentiate from Student Black */}
      <div className="flex items-center gap-3 border-b border-[#eceff6] pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-white">
          NU
        </div>
        <div>
          <p className="text-sm font-semibold text-[#17172f]">Staff Portal</p>
          <p className="text-xs text-[#7d879b]">Housing accommodation</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={activeSection === "dashboard"}
          onClick={() => onSectionChange("dashboard")}
        />
        <SidebarItem
          icon={<Search size={18} />}
          label="Student Search"
          active={activeSection === "search"}
          onClick={() => onSectionChange("search")}
        />
        <SidebarItem
          icon={<PieChart size={18} />}
          label="Analytics"
          active={activeSection === "analytics"}
          onClick={() => onSectionChange("analytics")}
        />
        <SidebarItem
          icon={<Building2 size={18} />}
          label="Dorm Assets"
          active={activeSection === "dorms"}
          onClick={() => onSectionChange("dorms")}
        />
        <SidebarItem
          icon={<Settings size={18} />}
          label="Settings"
          active={activeSection === "settings"}
          onClick={() => onSectionChange("settings")}
        />
      </div>

      <div className="mt-8 rounded-[24px] bg-[#f7f8fc] p-4 border border-[#eceff6]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#98a2b3]">
          signed in as
        </p>
        <p className="mt-3 text-base font-bold text-[#17172f] truncate">
          {displayName}
        </p>
        <p className="mt-1 break-all text-sm text-[#667085]">
          {user?.email || "student@nu.edu.kz"}
        </p>
      </div>

      <button
        onClick={onLogout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e7eaf4] bg-white px-4 py-3 text-sm font-medium text-rose-500 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
      >
        <LogOut size={17} />
        Log out
      </button>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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
