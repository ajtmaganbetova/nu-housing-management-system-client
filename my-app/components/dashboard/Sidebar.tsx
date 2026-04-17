import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  LifeBuoy,
  LogOut,
} from "lucide-react";

type StudentSection = "overview" | "apply" | "applications" | "support";

export interface User {
  id: number;
  email: string;
  nu_id: string;
  role: "student" | "admin" | "staff";
  phone: string;
  firstName?: string; // Optional
  lastName?: string; // Optional
}

interface SidebarProps {
  activeSection: StudentSection;
  onSectionChange: (section: StudentSection) => void;
  user: User | null;
  onLogout: () => void;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  user,
  onLogout,
}: SidebarProps) {
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Student";

  return (
    // Added sticky top-6 to keep it visible during long scrolls
    <aside className="sticky top-6 h-fit rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur">
      <div className="flex items-center gap-3 border-b border-[#eceff6] pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-white">
          NU
        </div>
        <div>
          <p className="text-sm font-semibold text-[#17172f]">Student Portal</p>
          <p className="text-xs text-[#7d879b]">Housing accommodation</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Overview"
          active={activeSection === "overview"}
          onClick={() => onSectionChange("overview")}
        />
        <SidebarItem
          icon={<FileText size={18} />}
          label="New Application"
          active={activeSection === "apply"}
          onClick={() => onSectionChange("apply")}
        />
        <SidebarItem
          icon={<ClipboardList size={18} />}
          label="My Applications"
          active={activeSection === "applications"}
          onClick={() => onSectionChange("applications")}
        />
        <SidebarItem
          icon={<LifeBuoy size={18} />}
          label="Support"
          active={activeSection === "support"}
          onClick={() => onSectionChange("support")}
        />
      </div>

      <div className="mt-8 rounded-[24px] bg-[#f7f8fc] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">
          Signed in as
        </p>
        <p className="mt-3 text-base font-semibold text-[#17172f]">
          {displayName}
        </p>
        <p className="mt-1 break-all text-sm text-[#667085]">
          {user?.email || "student@nu.edu.kz"}
        </p>
      </div>

      <button
        onClick={onLogout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e7eaf4] bg-white px-4 py-3 text-sm font-medium text-[#475467] transition hover:border-[#d7dcf0] hover:bg-[#f8f9fc] hover:text-[#17172f]"
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
