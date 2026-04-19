"use client";

import { useState, useCallback, useEffect } from "react";
import { Lock, AlertTriangle } from "lucide-react";
import ApplicationForm from "@/components/application/ApplicationForm";
import ApplicationsTable from "@/components/dashboard/ApplicationsTable";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { SupportTab } from "@/components/dashboard/SupportTab";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { getSystemSettings } from "@/lib/system-settings";

export interface User {
  id: number;
  email: string;
  nu_id: string;
  role: "student" | "admin" | "staff";
  phone: string;
  firstName?: string;
  lastName?: string;
}
export type StudentSection = "overview" | "apply" | "applications" | "support";

export default function StudentDashboard() {
  const { isLoading, isAuthenticated } = useAuthGuard("student");
  const [isAppOpen, setIsAppOpen] = useState(true);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const [activeSection, setActiveSection] = useState<StudentSection>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studentPortalSection");
      return (saved as StudentSection) || "overview";
    }
    return "overview";
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      try {
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem("studentPortalSection", activeSection);
  }, [activeSection]);

  const fetchApplicationSettings = useCallback(async () => {
    try {
      const settings = await getSystemSettings();
      setIsAppOpen(settings.is_application_open);
    } catch (error) {
      console.error("Failed to load application settings:", error);
      setIsAppOpen(true);
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    fetchApplicationSettings();
  }, [fetchApplicationSettings, isAuthenticated, isLoading]);

  const handleSectionChange = (section: StudentSection) => {
    setActiveSection(section);
    localStorage.setItem("studentPortalSection", section);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  const isStudent = user?.role === "student";
  const shouldBlockApplication = isStudent && !isAppOpen;

  if (isLoading || !isAuthenticated || isSettingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9e0f2] border-t-[#6f63ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(195,198,244,0.90),_rgba(239,241,247,0.88)_35%,_rgba(232,236,247,0.94)_70%,_rgba(211,216,243,0.98)_100%)]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] items-start">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            user={user}
            onLogout={handleLogout}
          />

          <main className="min-w-0 rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur">
            <div className="p-5 md:p-8">
              {!isAppOpen && (
                <div className="mb-6 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <AlertTriangle size={20} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-rose-700">
                        Housing applications are currently closed
                      </h2>
                      <p className="mt-1 text-sm text-rose-600">
                        The housing office is not accepting new dormitory
                        applications at this time. You can still view your
                        dashboard and check your submitted applications.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "overview" && (
                <OverviewTab
                  onApply={() => handleSectionChange("apply")}
                  onTrack={() => handleSectionChange("applications")}
                  user={user}
                />
              )}

              {activeSection === "apply" && (
                <div id="application-container" className="relative">
                  {shouldBlockApplication ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 py-20">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <Lock size={32} />
                      </div>

                      <h2 className="text-xl font-bold text-[#17172f]">
                        Applications are Currently Closed
                      </h2>

                      <p className="mt-2 text-center text-[#7d879b]">
                        The administration is not accepting new housing
                        applications at this time.
                      </p>

                      <button
                        onClick={() => setActiveSection("overview")}
                        className="mt-6 rounded-xl bg-[#6f63ff] px-6 py-2 font-medium text-white"
                      >
                        Go Back to Overview
                      </button>
                    </div>
                  ) : (
                    <>
                      <ScrollProgress targetId="application-container" />
                      <div className="mt-6">
                        <ApplicationForm />
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeSection === "applications" && (
                <div className="space-y-4">
                  <ApplicationsTable key={refreshKey} />
                </div>
              )}

              {activeSection === "support" && <SupportTab />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
