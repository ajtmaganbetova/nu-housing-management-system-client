"use client";

import { useState } from "react";

type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogEntry {
  id: number;
  level: LogLevel;
  message: string;
  timestamp: string;
  source: string;
}

// Dummy data for now – later you can load from backend
const MOCK_LOGS: LogEntry[] = [
  {
    id: 1,
    level: "INFO",
    message: "User 20250001 submitted a new application",
    timestamp: "2025-11-24T15:32:00Z",
    source: "application-service",
  },
  {
    id: 2,
    level: "WARN",
    message: "Slow response from email provider",
    timestamp: "2025-11-24T15:20:10Z",
    source: "notification-service",
  },
  {
    id: 3,
    level: "ERROR",
    message: "Failed login attempt for admin@nu.edu.kz",
    timestamp: "2025-11-24T14:58:45Z",
    source: "auth-service",
  },
];

export default function LogsPage() {
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filteredLogs = MOCK_LOGS.filter((log) => {
    if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.message.toLowerCase().includes(q) ||
      log.source.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Logs</h1>
            <p className="mt-1 text-slate-500">
              Monitor important events in the housing management system.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="inline-flex rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
            {(["ALL", "INFO", "WARN", "ERROR"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl as any)}
                className={`px-3 py-1.5 text-xs font-medium ${
                  levelFilter === lvl
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search message or service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Logs list */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm max-h-[60vh] overflow-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">
              No logs match your filter.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <li key={log.id} className="px-4 py-3 flex gap-4 text-sm">
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        log.level === "INFO"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : log.level === "WARN"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900">{log.message}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()} •{" "}
                      <span className="font-mono">{log.source}</span>
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
