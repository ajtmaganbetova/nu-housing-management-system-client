"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  submit: "bg-blue-50 text-blue-700 border border-blue-200",
  approve: "bg-green-50 text-green-700 border border-green-200",
  reject: "bg-red-50 text-red-700 border border-red-200",
  create: "bg-purple-50 text-purple-700 border border-purple-200",
  delete: "bg-orange-50 text-orange-700 border border-orange-200",
  login: "bg-slate-50 text-slate-700 border border-slate-200",
  login_failed: "bg-red-50 text-red-700 border border-red-200",
  register: "bg-teal-50 text-teal-700 border border-teal-200",
};

const actionIcons: Record<string, string> = {
  submit: "📨",
  approve: "✅",
  reject: "❌",
  create: "➕",
  delete: "🗑️",
  login: "🔑",
  login_failed: "🚫",
  register: "🆕",
};

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/admin/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data: LogEntry[] = await res.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 30_000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = (logs ?? []).filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.actor_email?.toLowerCase().includes(q) ||
      log.actor_nu_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">System Logs</h1>
          <p className="mt-1 text-slate-500">
            Monitor important events in the housing management system.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative w-full sm:max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by action, entity, email or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading && <p className="text-sm text-slate-400 mb-4">Loading logs…</p>}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm max-h-[65vh] overflow-auto">
          {!loading && filteredLogs.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">
              No logs match your filter.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <li key={log.id} className="px-4 py-4 flex gap-4 items-start">
                  {/* Action badge */}
                  <div className="mt-0.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        actionStyles[log.action] ??
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {actionIcons[log.action] ?? "📋"} {log.action.toUpperCase()}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-mono text-blue-600">{log.entity}</span>
                      {log.entity_id && (
                        <span className="text-slate-500"> #{log.entity_id}</span>
                      )}
                    </p>

                    {/* Actor info */}
                    {log.actor_email && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        👤 <span className="font-medium">{log.actor_email}</span>
                        {log.actor_nu_id && (
                          <span className="text-slate-400"> · {log.actor_nu_id}</span>
                        )}
                      </p>
                    )}

                    <p className="text-xs text-slate-400 mt-0.5">
                      🕐 {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}