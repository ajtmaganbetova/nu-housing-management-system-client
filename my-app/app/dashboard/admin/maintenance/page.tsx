"use client";

import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function MaintenancePage() {
  const { isLoading, isAuthenticated } = useAuthGuard("admin");
  const [mode, setMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const saveSettings = () => {
    setSaving(true);
    setMessage(null);

    setTimeout(() => {
      setSaving(false);
      setMessage(
        "System maintenance mode has been updated. (demo only — no backend call)"
      );
    }, 1000);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow p-8 rounded-xl border border-slate-200">
        <h1 className="text-3xl font-bold mb-4 text-slate-900">
          System Maintenance
        </h1>
        <p className="text-slate-600 mb-6">
          Enable or disable maintenance mode. When enabled, students cannot
          access the system. (This is a demo page — backend not yet connected.)
        </p>

        {message && (
          <div className="mb-4 p-3 rounded-md bg-green-50 text-green-700 border border-green-200">
            {message}
          </div>
        )}

        {/* Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            checked={mode}
            onChange={(e) => setMode(e.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-slate-700 text-sm">
            Enable system maintenance mode
          </span>
        </div>

        {/* Save button */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
