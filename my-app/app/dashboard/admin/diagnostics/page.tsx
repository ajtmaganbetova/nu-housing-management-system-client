"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Fingerprint,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserX,
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDiagnosticsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard("admin");

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchLogs = async () => {
      try {
        const payload = await apiJson<LogEntry[]>("/admin/logs", {
          method: "GET",
        });
        setLogs(Array.isArray(payload) ? payload : []);
        setError("");
      } catch (loadError) {
        console.error("Failed to load diagnostics", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load diagnostics.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchLogs();
  }, [authLoading, isAuthenticated]);

  const loginFailures = useMemo(
    () => logs.filter((log) => log.action === "login_failed"),
    [logs],
  );

  const riskyDeletes = useMemo(
    () => logs.filter((log) => log.action === "delete" && log.entity === "user"),
    [logs],
  );

  const studentSubmissionTrail = useMemo(
    () =>
      logs.filter((log) =>
        ["submit", "update", "approve", "reject", "register"].includes(log.action),
      ),
    [logs],
  );

  const filteredTrail = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return studentSubmissionTrail;

    return studentSubmissionTrail.filter((log) => {
      return (
        log.action.toLowerCase().includes(query) ||
        log.entity.toLowerCase().includes(query) ||
        (log.actor_email ?? "").toLowerCase().includes(query) ||
        (log.actor_nu_id ?? "").toLowerCase().includes(query) ||
        String(log.entity_id ?? "").includes(query)
      );
    });
  }, [search, studentSubmissionTrail]);

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
            activeSection="diagnostics"
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
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6f63ff]">
                  <ShieldCheck size={14} />
                  <span>Student Diagnostics</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">
                  Account And Submission Checks
                </h1>
                <p className="max-w-3xl text-sm text-[#7d879b]">
                  Use audit logs to investigate login failures, recent user deletions,
                  and student-side submission activity when someone reports a problem.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-3">
              <MiniAlertCard
                icon={<ShieldAlert size={20} />}
                label="Login Failures"
                value={loginFailures.length}
                color="text-red-600"
                glow="bg-red-500/10"
              />
              <MiniAlertCard
                icon={<UserX size={20} />}
                label="User Deletes"
                value={riskyDeletes.length}
                color="text-amber-600"
                glow="bg-amber-500/10"
              />
              <MiniAlertCard
                icon={<CheckCircle2 size={20} />}
                label="Submission Events"
                value={studentSubmissionTrail.length}
                color="text-emerald-600"
                glow="bg-emerald-500/10"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <section className="space-y-6">
                <DiagnosticsCard
                  title="Recent Login Failures"
                  description="Students who could not authenticate successfully."
                  emptyText="No recent login failures were recorded."
                  items={loginFailures.slice(0, 8).map((log) => ({
                    id: log.id,
                    title: log.actor_email || "Unknown user",
                    meta: log.actor_nu_id ? `NU ID ${log.actor_nu_id}` : "No NU ID",
                    detail: formatDate(log.timestamp),
                  }))}
                />

                <DiagnosticsCard
                  title="Recent User Deletions"
                  description="Potentially destructive account removals."
                  emptyText="No user deletions were recorded."
                  items={riskyDeletes.slice(0, 8).map((log) => ({
                    id: log.id,
                    title: log.actor_email || "Unknown actor",
                    meta: `${log.entity}${log.entity_id ? ` #${log.entity_id}` : ""}`,
                    detail: formatDate(log.timestamp),
                  }))}
                />
              </section>

              <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[#17172f]">
                      Submission Trace
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      Search student-side account and application actions.
                    </p>
                  </div>

                  <div className="relative w-full lg:max-w-sm">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa3b8]"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by email, NU ID, action, or entity..."
                      className="w-full rounded-2xl border border-[#edf1f8] bg-white py-3 pl-12 pr-4 text-sm text-[#17172f] shadow-sm outline-none transition focus:border-[#6f63ff] focus:ring-4 focus:ring-[#6f63ff]/10"
                    />
                  </div>
                </div>

                {filteredTrail.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-[#e4e7f0] bg-[#f8faff] px-4 py-8 text-center text-sm text-[#7d879b]">
                    No matching student-side events were found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTrail.slice(0, 20).map((log) => (
                      <div
                        key={log.id}
                        className="rounded-[24px] border border-[#edf1f8] bg-[#f8faff] px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                            {log.action}
                          </span>
                          <span className="text-sm font-semibold text-[#17172f]">
                            {log.entity}
                            {log.entity_id ? ` #${log.entity_id}` : ""}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#7d879b]">
                          <span className="inline-flex items-center gap-1.5">
                            <Fingerprint size={12} />
                            {log.actor_nu_id || "No NU ID"}
                          </span>
                          <span>{log.actor_email || "System action"}</span>
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
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

function MiniAlertCard({
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

function DiagnosticsCard({
  title,
  description,
  emptyText,
  items,
}: {
  title: string;
  description: string;
  emptyText: string;
  items: { id: number; title: string; meta: string; detail: string }[];
}) {
  return (
    <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
      <p className="text-lg font-semibold text-[#17172f]">{title}</p>
      <p className="mt-1 text-sm text-[#667085]">{description}</p>

      {items.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[#e4e7f0] bg-[#f8faff] px-4 py-8 text-center text-sm text-[#7d879b]">
          {emptyText}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-[#edf1f8] bg-[#f8faff] px-4 py-4"
            >
              <p className="text-sm font-semibold text-[#17172f]">{item.title}</p>
              <p className="mt-1 text-xs text-[#667085]">{item.meta}</p>
              <p className="mt-1 text-xs text-[#98a2b3]">{item.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
