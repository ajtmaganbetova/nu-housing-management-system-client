"use client";

import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function SettingsPage() {
  const { isLoading, isAuthenticated } = useAuthGuard("admin");
  const [applicationOpen, setApplicationOpen] = useState("2025-01-01");
  const [applicationClose, setApplicationClose] = useState("2025-12-31");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // TODO: replace this with a real API call through the shared API layer.

    setTimeout(() => {
      setSaving(false);
      setMessage("Settings saved (demo only, no backend yet 😄)");
    }, 700);
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          System Settings
        </h1>
        <p className="text-slate-500 mb-6">
          Configure global settings for the dormitory application system.
        </p>

        {message && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6"
        >
          {/* Application window */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Application Period
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              Control when students can submit housing applications.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Open from
                </label>
                <input
                  type="date"
                  value={applicationOpen}
                  onChange={(e) => setApplicationOpen(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Close on
                </label>
                <input
                  type="date"
                  value={applicationClose}
                  onChange={(e) => setApplicationClose(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Maintenance mode */}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Maintenance Mode
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              Temporarily disable access for students while you perform system
              updates.
            </p>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                Enable maintenance mode
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
