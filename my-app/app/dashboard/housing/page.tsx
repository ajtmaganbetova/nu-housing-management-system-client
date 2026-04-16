'use client';

import { useState, useEffect, useCallback } from 'react';
import HousingApplicationsTable from '@/components/dashboard/HousingApplicationsTable';
import Navbar from "@/components/ui/Navbar";
import { apiJson } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function HousingDashboard() {
  const { isLoading, isAuthenticated } = useAuthGuard("housing");
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const apps =
        (await apiJson<{ status: string }[]>('/housing/applications', {
          method: "GET",
        })) || [];
      setStats({
        total: apps.length,
        pending: apps.filter((app) => app.status === 'pending').length,
        approved: apps.filter((app) => app.status === 'approved').length,
        rejected: apps.filter((app) => app.status === 'rejected').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchStats();
    setRefreshKey((k) => k + 1);
  }, [fetchStats]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const timeoutId = window.setTimeout(() => {
      void fetchStats();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchStats, isAuthenticated, isLoading]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const interval = setInterval(() => {
      void fetchStats();
      setRefreshKey((k) => k + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900">Loading Housing Dashboard...</h1>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Applications', value: stats.total, icon: '📋', color: 'bg-blue-500', light: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
    { label: 'Pending Review', value: stats.pending, icon: '⏳', color: 'bg-yellow-500', light: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-700' },
    { label: 'Approved', value: stats.approved, icon: '✅', color: 'bg-green-500', light: 'bg-green-50 border-green-100', text: 'text-green-700' },
    { label: 'Rejected', value: stats.rejected, icon: '❌', color: 'bg-red-500', light: 'bg-red-50 border-red-100', text: 'text-red-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Housing Staff Dashboard</h1>
              <p className="mt-1 text-gray-500 text-sm">Review and manage student housing applications</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
               Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className={`bg-white rounded-xl shadow-sm border ${card.light} p-5 flex items-center gap-4`}>
                <div className={`w-11 h-11 ${card.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {stats.total > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-600">Review Progress</p>
                <p className="text-xs text-gray-400">{stats.approved + stats.rejected} of {stats.total} reviewed</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="flex h-full rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-500"
                    style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                  />
                  <div
                    className="bg-red-400 h-full transition-all duration-500"
                    style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Approved</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>Rejected</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block"></span>Pending</span>
              </div>
            </div>
          )}

          {/* Table */}
          <HousingApplicationsTable key={refreshKey} onStatsUpdate={fetchStats} />

        </div>
      </div>
    </div>
  );
}
