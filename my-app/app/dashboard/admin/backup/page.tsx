"use client";

import { useState } from "react";

export default function BackupPage() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle"
  );

  const startBackup = () => {
    setStatus("running");

    // Simulate slow backup process
    setTimeout(() => {
      setStatus("done");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow p-8 rounded-xl border border-slate-200">
        <h1 className="text-3xl font-bold mb-4 text-slate-900">Backup Database</h1>
        <p className="text-slate-600 mb-6">
          Create a backup of all system data. This is a demo version — no real
          database will be affected.
        </p>

        {/* Status Message */}
        {status === "running" && (
          <div className="mb-4 p-3 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            ⏳ Backup in progress… please wait.
          </div>
        )}

        {status === "done" && (
          <div className="mb-4 p-3 rounded-md bg-green-50 text-green-700 border border-green-200">
            ✅ Backup completed successfully! (simulation)
          </div>
        )}

        {/* Backup button */}
        <button
          onClick={startBackup}
          disabled={status === "running"}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {status === "running" ? "Backing up…" : "Start Backup"}
        </button>
      </div>
    </div>
  );
}
