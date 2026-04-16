"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { apiJson } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface Stats {
  users: number;
  applications: number;
  approved: number;
}

export default function AdminDashboard() {
  const { isLoading, isAuthenticated } = useAuthGuard("admin");
  const [stats, setStats] = useState<Stats | null>(null);
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiJson<Stats>("/admin/stats", {
        method: "GET",
      });
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const timeoutId = window.setTimeout(() => {
      void fetchStats();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchStats, isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900">Loading Admin Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-gray-500 text-sm">System administration and monitoring</p>
            </div>
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Stats Overview */}
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">👥</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.users}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">📋</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.applications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-lg">✅</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-sm text-yellow-700">
                  Stats not available. Make sure you&apos;re logged in as admin.
                </p>
              </div>
            </div>
          )}

          {/* Admin Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500 mb-4">Manage system users and permissions.</p>
              <div className="flex gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => router.push("/dashboard/admin/users")}
                >
                  View All Users
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => router.push("/dashboard/admin/users/create")}
                >
                  Create User
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">System Monitoring</h2>
              <p className="text-sm text-gray-500 mb-4">Monitor system health and performance.</p>
              <div className="flex gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => router.push("/dashboard/admin/logs")}
                >
                  View Logs
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => router.push("/dashboard/admin/settings")}
                >
                  System Settings
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Database Operations</h2>
              <p className="text-sm text-gray-500 mb-4">Administrative database functions and maintenance.</p>
              <div className="flex gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => router.push("/dashboard/admin/backup")}
                >
                  Backup Database
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => router.push("/dashboard/admin/maintenance")}
                >
                  System Maintenance
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
