"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  History,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { SidebarHousing } from "@/components/dashboard/SidebarHousing";
import { apiJson } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface LogEntry {
  id: number;
  actor_id?: number;
  actor_email?: string;
  actor_nu_id?: string;
  action: string;
  entity: string;
  entity_id?: number;
  timestamp: string;
}

const actionStyles: Record<string, string> = {
  submit: "border-blue-200 bg-blue-50 text-blue-700",
  approve: "border-green-200 bg-green-50 text-green-700",
  reject: "border-red-200 bg-red-50 text-red-700",
  create: "border-purple-200 bg-purple-50 text-purple-700",
  delete: "border-orange-200 bg-orange-50 text-orange-700",
  login: "border-slate-200 bg-slate-50 text-slate-700",
  login_failed: "border-red-200 bg-red-50 text-red-700",
  register: "border-teal-200 bg-teal-50 text-teal-700",
  update_settings: "border-amber-200 bg-amber-50 text-amber-700",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LogsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard("admin");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await apiJson<LogEntry[]>("/admin/logs", {
        method: "GET",
      });
      setLogs(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    void fetchLogs();
    const interval = setInterval(() => {
      void fetchLogs(true);
    }, 30_000);

    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return logs;

    return logs.filter((log) => {
      return (
        log.action.toLowerCase().includes(query) ||
        log.entity.toLowerCase().includes(query) ||
        (log.actor_email ?? "").toLowerCase().includes(query) ||
        (log.actor_nu_id ?? "").toLowerCase().includes(query) ||
        String(log.entity_id ?? "").includes(query)
      );
    });
  }, [logs, search]);

  const failureCount = logs.filter((log) => log.action === "login_failed").length;
  const createCount = logs.filter((log) => log.action === "create").length;
  const deleteCount = logs.filter((log) => log.action === "delete").length;

  if (authLoading || !isAuthenticated || loading) {
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
            activeSection="logs"
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

          <div className="space-y-6 min-w-0">
            <div className="rounded-[40px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur md:p-10">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6f63ff]">
                    <ShieldCheck size={14} />
                    <span>Audit Trail</span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">
                    System Logs
                  </h1>
                  <p className="max-w-3xl text-sm text-[#7d879b]">
                    Inspect the full admin-visible action history across user access,
                    account management, and housing operations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void fetchLogs(true)}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#17172f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a4a] active:scale-95"
                >
                  <RefreshCw
                    size={16}
                    className={isRefreshing ? "animate-spin" : "transition-transform"}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh Logs"}
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <MiniStatCard
                icon={<History size={20} />}
                label="Total Logs"
                value={logs.length}
                color="text-[#6f63ff]"
                glow="bg-[#6f63ff]/10"
              />
              <MiniStatCard
                icon={<AlertCircle size={20} />}
                label="Login Failures"
                value={failureCount}
                color="text-red-600"
                glow="bg-red-500/10"
              />
              <MiniStatCard
                icon={<Activity size={20} />}
                label="Create/Delete"
                value={createCount + deleteCount}
                color="text-emerald-600"
                glow="bg-emerald-500/10"
              />
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[#17172f]">
                    Log Explorer
                  </p>
                  <p className="mt-1 text-sm text-[#667085]">
                    Search by action, entity, email, NU ID, or record ID.
                  </p>
                </div>

                <div className="relative w-full lg:max-w-sm">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa3b8]"
                  />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-2xl border border-[#edf1f8] bg-white py-3 pl-12 pr-4 text-sm text-[#17172f] shadow-sm outline-none transition focus:border-[#6f63ff] focus:ring-4 focus:ring-[#6f63ff]/10"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {filteredLogs.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#e4e7f0] bg-[#f8faff] px-4 py-10 text-center text-sm text-[#7d879b]">
                  No logs match your filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <article
                      key={log.id}
                      className="rounded-[24px] border border-[#edf1f8] bg-[#f8faff] px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${actionStyles[log.action] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}
                            >
                              {log.action}
                            </span>
                            <span className="text-sm font-semibold text-[#17172f]">
                              {log.entity}
                              {log.entity_id ? ` #${log.entity_id}` : ""}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#7d879b]">
                            <span>{log.actor_email || "System action"}</span>
                            {log.actor_nu_id && <span>{log.actor_nu_id}</span>}
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                        </div>

                        <div className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#667085]">
                          Log #{log.id}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStatCard({
  icon,
  label,
  value,
  color,
  glow,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  glow: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${glow} ${color}`}>
          {icon}
        </div>
        <p className="text-sm font-semibold text-[#98a2b3]">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold text-[#17172f]">{value}</p>
    </div>
  );
}
