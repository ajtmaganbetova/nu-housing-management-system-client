"use client";

import { useState, useEffect, useCallback } from "react";
import HousingApplicationsTable from "@/components/dashboard/HousingApplicationsTable";
import StudentSearchSection from "@/components/dashboard/housing/StudentSearchSection";
import DormInventorySection from "@/components/dashboard/housing/DormInventorySection";
import OccupancyStatsSection from "@/components/dashboard/housing/OccupancyStatsSection";

import { apiJson } from "@/lib/auth";
import {
  getHousingSystemSettings,
  type SystemSettings,
  updateHousingSystemSettings,
} from "@/lib/system-settings";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  LayoutDashboard,
  Lock,
  Unlock,
  Mail,
} from "lucide-react";

import {
  SidebarHousing,
  type HousingSection,
} from "@/components/dashboard/SidebarHousing";

export interface User {
  id: number;
  email: string;
  nu_id: string;
  role: "student" | "admin" | "staff";
  phone: string;
  firstName?: string;
  lastName?: string;
}

interface HousingApplicationSummary {
  status: string;
  email?: string | null;
}

export default function HousingDashboard() {
  const { isLoading, isAuthenticated } = useAuthGuard("housing");

  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] =
    useState<HousingSection>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    null,
  );
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isTogglingApplications, setIsTogglingApplications] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }

      const savedSection = localStorage.getItem("housingPortalSection");
      if (savedSection) setActiveSection(savedSection as HousingSection);
    }
  }, []);

  const fetchApplicationSettings = useCallback(async () => {
    try {
      const settings = await getHousingSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error("Error fetching application settings:", error);
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const apps =
        (await apiJson<HousingApplicationSummary[]>("/housing/applications", {
          method: "GET",
        })) || [];

      setStats({
        total: apps.length,
        pending: apps.filter((app) => app.status === "pending").length,
        approved: apps.filter((app) => app.status === "approved").length,
        rejected: apps.filter((app) => app.status === "rejected").length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const handleSendEmails = async () => {
    setIsSendingEmail(true);

    try {
      const apps =
        (await apiJson<HousingApplicationSummary[]>("/housing/applications", {
          method: "GET",
        })) || [];

      const rejectedEmails = apps
        .filter((app) => app.status === "rejected")
        .map((app) => app.email)
        .filter(Boolean);

      if (rejectedEmails.length === 0) {
        alert("No rejected applications found.");
        return;
      }

      await apiJson("/housing/notify-rejected", {
        method: "POST",
        body: JSON.stringify({
          emails: rejectedEmails,
          subject: "Application Update: Please Re-submit",
          message:
            "Please re-submit your application. We have updated our requirements.",
        }),
      });

      alert(
        `Success! Notifications sent to ${rejectedEmails.length} students.`,
      );
    } catch (error) {
      console.error("Failed to send emails:", error);
      alert("Email automation failed. Please check backend logs.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const toggleAppStatus = useCallback(async () => {
    const isCurrentlyOpen = systemSettings?.is_application_open ?? false;
    const newStatus = !isCurrentlyOpen;
    setIsTogglingApplications(true);

    try {
      const settings = await updateHousingSystemSettings(
        newStatus
          ? {
              applications_enabled: true,
              application_open: new Date().toISOString().slice(0, 10),
              application_close: "",
            }
          : {
              applications_enabled: false,
            },
      );
      setSystemSettings(settings);
    } catch (error) {
      console.error("Failed to update application status:", error);
      alert("Failed to update application status. Please try again.");
    } finally {
      setIsTogglingApplications(false);
    }
  }, [systemSettings]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    fetchApplicationSettings();
    fetchStats();
  }, [isAuthenticated, isLoading, fetchApplicationSettings, fetchStats]);

  const handleRefresh = useCallback(() => {
    fetchApplicationSettings();
    fetchStats();
    setRefreshKey((k) => k + 1);
  }, [fetchApplicationSettings, fetchStats]);

  const handleSectionChange = (section: HousingSection) => {
    setActiveSection(section);
    localStorage.setItem("housingPortalSection", section);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  if (isLoading || !isAuthenticated || isSettingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9e0f2] border-t-[#6f63ff]" />
      </div>
    );
  }

  const isAppOpen = systemSettings?.is_application_open ?? false;

  const statCards = [
    {
      label: "Total Received",
      value: stats.total,
      icon: Users,
      color: "bg-[#6f63ff]",
      glow: "bg-[#6f63ff]/10",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "bg-amber-500",
      glow: "bg-amber-500/10",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "bg-emerald-500",
      glow: "bg-emerald-500/10",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "bg-rose-500",
      glow: "bg-rose-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(195,198,244,0.90),_rgba(239,241,247,0.88)_35%,_rgba(232,236,247,0.94)_70%,_rgba(211,216,243,0.98)_100%)]">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 lg:px-10">
        <div className="grid gap-10 xl:grid-cols-[300px_1fr] items-start">
          <SidebarHousing
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            user={user}
            onLogout={handleLogout}
          />

          <div className="min-w-0 rounded-[40px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur md:p-10">
            {activeSection === "dashboard" && (
              <>
                {/* Header */}
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6f63ff]">
                      <LayoutDashboard size={14} />
                      <span>Management Portal</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">
                      Housing Dashboard
                    </h1>
                    <p className="max-w-xl text-sm leading-relaxed text-[#7d879b]">
                      Status:{" "}
                      <span
                        className={`font-bold ${
                          isAppOpen ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isAppOpen
                          ? "Accepting Applications"
                          : "Applications Closed"}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {!isAppOpen && (
                      <button
                        onClick={handleSendEmails}
                        disabled={isSendingEmail}
                        className="flex items-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95 hover:bg-rose-600 disabled:opacity-50"
                      >
                        <Mail size={16} />
                        {isSendingEmail ? "Sending..." : "Notify Rejected"}
                      </button>
                    )}

                    <button
                      onClick={toggleAppStatus}
                      disabled={isTogglingApplications}
                      className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                        isAppOpen
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {isAppOpen ? <Lock size={16} /> : <Unlock size={16} />}
                      {isTogglingApplications
                        ? "Saving..."
                        : isAppOpen
                          ? "Close Applications"
                          : "Open Applications"}
                    </button>

                    <button
                      onClick={handleRefresh}
                      className="group flex items-center gap-2 rounded-2xl bg-[#17172f] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95 hover:bg-[#2a2a4a]"
                    >
                      <RefreshCw
                        size={16}
                        className="transition-transform duration-500 group-active:rotate-180"
                      />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className="relative flex-1 overflow-hidden rounded-[28px] border border-white bg-white/70 p-6 shadow-sm backdrop-blur-md"
                    >
                      <div
                        className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${card.glow} blur-2xl`}
                      />
                      <div className="relative z-10 flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.color} text-white shadow-lg`}
                        >
                          <card.icon size={22} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#98a2b3]">
                            {card.label}
                          </p>
                          <p className="text-2xl font-black text-[#17172f]">
                            {card.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="relative mb-10 overflow-hidden rounded-[32px] border border-white bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6f63ff]/5 text-[#6f63ff]">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#17172f]">
                        Verification Progress
                      </h3>
                      <p className="text-xs text-[#98a2b3]">
                        {stats.approved + stats.rejected} of {stats.total}{" "}
                        reviewed
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-[#f1f4f9]">
                    <div className="flex h-full rounded-full">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{
                          width: stats.total
                            ? `${(stats.approved / stats.total) * 100}%`
                            : "0%",
                        }}
                      />
                      <div
                        className="h-full bg-rose-400 transition-all duration-1000"
                        style={{
                          width: stats.total
                            ? `${(stats.rejected / stats.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 text-[11px] font-bold text-[#7d879b] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Approved
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      Rejected
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4f9]" />
                      Remaining
                    </div>
                  </div>
                </div>

                {/* Applications Table */}
                <div>
                  <HousingApplicationsTable
                    key={refreshKey}
                    onStatsUpdate={fetchStats}
                  />
                </div>
              </>
            )}

            {activeSection === "search" && <StudentSearchSection />}
            {activeSection === "dorms" && <DormInventorySection />}
            {activeSection === "analytics" && <OccupancyStatsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
