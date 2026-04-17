"use client";

import { useState, useEffect, useCallback } from "react";
import HousingApplicationsTable from "@/components/dashboard/HousingApplicationsTable";
import { apiJson } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  LayoutDashboard,
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

export default function HousingDashboard() {
  const { isLoading, isAuthenticated } = useAuthGuard("housing");

  // 2. Added missing state for User and ActiveSection
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] =
    useState<HousingSection>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // 3. Initialize User and Section from localStorage (Safely)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));

      const savedSection = localStorage.getItem("housingPortalSection");
      if (savedSection) setActiveSection(savedSection as HousingSection);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const apps =
        (await apiJson<{ status: string }[]>("/housing/applications", {
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

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, fetchStats]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const interval = setInterval(() => {
      fetchStats();
      setRefreshKey((k) => k + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, fetchStats]);

  const handleRefresh = useCallback(() => {
    fetchStats();
    setRefreshKey((k) => k + 1);
  }, [fetchStats]);

  const handleSectionChange = (section: HousingSection) => {
    setActiveSection(section);
    localStorage.setItem("housingPortalSection", section);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9e0f2] border-t-[#6f63ff]" />
      </div>
    );
  }

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
        {/* 4. Corrected Grid Structure */}
        <div className="grid gap-10 xl:grid-cols-[300px_1fr] items-start">
          <SidebarHousing
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            user={user}
            onLogout={handleLogout}
          />

          <div className="min-w-0 rounded-[40px] border border-white/70 bg-white/80 p-6 md:p-10 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 ">
                <div className="flex items-center gap-2 text-[#6f63ff] font-bold text-xs uppercase tracking-widest">
                  <LayoutDashboard size={14} />
                  <span>Management Portal</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">
                  Housing Dashboard
                </h1>
                <p className="text-[#7d879b] text-sm max-w-xl leading-relaxed">
                  Review, verify, and finalize student dormitory placements for
                  the Fall 2025 term.
                </p>
              </div>

              <button
                onClick={handleRefresh}
                className="group flex items-center gap-2 bg-[#17172f] hover:bg-[#2a2a4a] text-white py-3 px-6 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95"
              >
                <RefreshCw
                  size={16}
                  className="group-active:rotate-180 transition-transform duration-500"
                />
                Refresh Data
              </button>
            </div>

            {/* Stats */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="relative overflow-hidden rounded-[28px] border border-white bg-white/70 p-6 shadow-sm backdrop-blur-md"
                >
                  <div
                    className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${card.glow} blur-2xl`}
                  />
                  <div className="relative z-10 flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl ${card.color} flex items-center justify-center text-white shadow-lg`}
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
            <div className="mb-10 ">
              {/* Progress Section */}
              <div className="relative overflow-hidden rounded-[32px] border border-white bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-[#6f63ff]/5 flex items-center justify-center text-[#6f63ff]">
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

                <div className="w-full bg-[#f1f4f9] rounded-full h-3 overflow-hidden mb-4 ">
                  <div className="flex h-full rounded-full">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                      style={{
                        width: stats.total
                          ? `${(stats.approved / stats.total) * 100}%`
                          : "0%",
                      }}
                    />
                    <div
                      className="bg-rose-400 h-full transition-all duration-1000 ease-out"
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
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />{" "}
                    Approved
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />{" "}
                    Rejected
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4f9]" />{" "}
                    Remaining
                  </div>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="">
              <HousingApplicationsTable
                key={refreshKey}
                onStatsUpdate={fetchStats}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
