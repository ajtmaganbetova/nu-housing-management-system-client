"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  users: number;
  applications: number;
  approved: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem("user");

      if (!userData) {
        router.push("/auth/login");
        return;
      }

      const user = JSON.parse(userData);

      // Check if user has admin role
      if (user.role !== "admin") {
        router.push("/dashboard/student");
        return;
      }

      setUser(user);
      await fetchStats(); // Now fetchStats is defined
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900">
            Loading Admin Dashboard...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            System administration and monitoring
          </p>
        </div>

        {/* Stats Overview */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.users}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📋</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Applications
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.applications}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.approved}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-600">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Stats not available. Make sure you`&apos;`re logged in as
                  admin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              User Management
            </h2>
            <p className="text-gray-600 mb-4">
              Manage system users and permissions.
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-3"
              onClick={() => alert("User management feature")}
            >
              View All Users
            </button>
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              onClick={() => alert("Create user feature")}
            >
              Create User
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              System Monitoring
            </h2>
            <p className="text-gray-600 mb-4">
              Monitor system health and performance.
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-3"
              onClick={() => alert("System logs feature")}
            >
              View Logs
            </button>
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              onClick={() => alert("Settings feature")}
            >
              System Settings
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Database Operations
            </h2>
            <p className="text-gray-600 mb-4">
              Administrative database functions and maintenance.
            </p>
            <div className="space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-3">
                Backup Database
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                System Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
