"use client";

import { useState, useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import ApplicationForm from "@/components/application/ApplicationForm";
import ApplicationsTable from "@/components/dashboard/ApplicationsTable";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { SupportTab } from "@/components/dashboard/SupportTab";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export interface User {
  id: number;
  email: string;
  nu_id: string;
  role: "student" | "admin" | "staff";
  phone: string;
  firstName?: string; // Optional
  lastName?: string; // Optional
}
export type StudentSection = "overview" | "apply" | "applications" | "support";

export default function StudentDashboard() {
  const { isLoading, isAuthenticated } = useAuthGuard("student");
  const [activeSection, setActiveSection] = useState<StudentSection>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studentPortalSection");
      return (saved as StudentSection) || "overview"; // Fallback to "overview"
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

  const handleSectionChange = (section: StudentSection) => {
    setActiveSection(section);
    localStorage.setItem("studentPortalSection", section);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  if (isLoading || !isAuthenticated) return <div>Loading...</div>;

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
            {/* Header Logic stays here */}
            <div className="p-5 md:p-8">
              {activeSection === "overview" && (
                <OverviewTab
                  onApply={() => handleSectionChange("apply")}
                  onTrack={() => handleSectionChange("applications")}
                  user={user}
                />
              )}

              {activeSection === "apply" && (
                <div id="application-container" className="relative">
          
                  <ScrollProgress targetId="application-container" />

                  <div className="mt-6">
                    <ApplicationForm />
                  </div>
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
