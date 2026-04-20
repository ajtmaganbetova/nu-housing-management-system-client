"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SidebarHousing } from "@/components/dashboard/SidebarHousing";
import { apiJson } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface AdminStats {
  users: number;
  applications: number;
  approved: number;
}

interface LogEntry {
  id: number;
  actor_email?: string;
  actor_nu_id?: string;
  action: string;
  entity: string;
  entity_id?: number;
  timestamp: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAlertAction(action: string) {
  switch (action) {
    case "login_failed":
      return "Login failed";
    case "delete":
      return "Deleted";
    case "update_role":
      return "Role changed";
    default:
      return action.replaceAll("_", " ");
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard("admin");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [statsPayload, logsPayload] = await Promise.all([
        apiJson<AdminStats>("/admin/stats", { method: "GET" }),
        apiJson<LogEntry[]>("/admin/logs", { method: "GET" }),
      ]);

      setStats(statsPayload);
      setLogs(Array.isArray(logsPayload) ? logsPayload : []);
      setError("");
    } catch (loadError) {
      console.error("Failed to load admin dashboard", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load admin dashboard.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    void loadDashboard();
  }, [authLoading, isAuthenticated]);

  const recentAlerts = useMemo(
    () =>
      logs
        .filter((log) =>
          ["login_failed", "delete", "update_role"].includes(log.action),
        )
        .slice(0, 6),
    [logs],
  );

  if (authLoading || !isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9e0f2] border-t-[#6f63ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(195,198,244,0.90),_rgba(239,241,247,0.88)_35%,_rgba(232,236,247,0.94)_70%,_rgba(211,216,243,0.98)_100%)]">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 lg:px-10">
        <div className="grid items-start gap-10 xl:grid-cols-[300px_1fr]">
          <SidebarHousing
            activeSection="dashboard"
            onSectionChange={(section) =>
              router.push(
                section === "dashboard"
                  ? "/dashboard/admin"
                  : `/dashboard/admin/${section}`,
              )
            }
            onLogout={() => {
              localStorage.clear();
              router.push("/auth/login");
            }}
          />

          <div className="min-w-0 rounded-[40px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur md:p-10">
            <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6f63ff]">
                  <ShieldCheck size={14} />
                  <span>Administrative Overview</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">
                  Admin Dashboard
                </h1>
                <p className="max-w-3xl text-sm text-[#7d879b]">
                  Monitor system activity, manage user accounts, and review
                  platform health from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadDashboard(true)}
                className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#17172f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a4a] active:scale-95"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin" : "transition-transform"}
                />
                {isRefreshing ? "Refreshing..." : "Refresh Overview"}
              </button>
            </div>

            {error && (
              <div className="mb-8 rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-3">
              <StatCard
                icon={<Users size={20} />}
                label="Total Users"
                value={stats?.users ?? 0}
                accent="text-[#6f63ff]"
                glow="bg-[#6f63ff]/10"
              />
              <StatCard
                icon={<Clock3 size={20} />}
                label="Applications"
                value={stats?.applications ?? 0}
                accent="text-amber-600"
                glow="bg-amber-500/10"
              />
              <StatCard
                icon={<CheckCircle2 size={20} />}
                label="Approved"
                value={stats?.approved ?? 0}
                accent="text-emerald-600"
                glow="bg-emerald-500/10"
              />
            </div>

            <div className="mt-8">
              <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#17172f]">
                      Recent Alerts
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      High-signal actions from the audit log.
                    </p>
                  </div>
                </div>

                {recentAlerts.length === 0 ? (
                  <div className="mt-5 rounded-[24px] border border-dashed border-[#e4e7f0] bg-[#f8faff] px-4 py-8 text-center text-sm text-[#7d879b]">
                    No recent alert-type events were found.
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {recentAlerts.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-[24px] border border-[#edf1f8] bg-[#f8faff] px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                            {formatAlertAction(log.action)}
                          </span>
                          <span className="text-sm font-semibold text-[#17172f]">
                            {log.entity}
                            {log.entity_id ? ` #${log.entity_id}` : ""}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#667085]">
                          {log.actor_email || "System action"}
                          {log.actor_nu_id ? ` · ${log.actor_nu_id}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[#98a2b3]">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  glow,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  glow: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${glow} ${accent}`}>
          {icon}
        </div>
        <p className="text-sm font-semibold text-[#98a2b3]">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold text-[#17172f]">{value}</p>
    </div>
  );
}
