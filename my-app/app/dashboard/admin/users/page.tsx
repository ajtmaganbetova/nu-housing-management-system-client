"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface User {
  id: number;
  nu_id: string;
  email: string;
  role_id: number;
  phone: string | null;
  created_at: string;
}

const roleLabel: Record<number, string> = {
  1: "Student",
  2: "Housing staff",
  3: "Admin",
};

const roleColor: Record<number, string> = {
  1: "bg-blue-50 text-blue-700 border border-blue-200",
  2: "bg-amber-50 text-amber-700 border border-amber-200",
  3: "bg-purple-50 text-purple-700 border border-purple-200",
};

export default function UsersPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard("admin");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchUsers = async () => {
      try {
        const data = await apiJson<{ users?: User[] } | User[]>("/admin/users", {
          method: "GET",
        });
        setUsers(Array.isArray(data) ? data : data.users ?? []);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchUsers();
  }, [authLoading, isAuthenticated]);

  const filteredUsers = useMemo<User[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nu_id.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        roleLabel[u.role_id]?.toLowerCase().includes(q)
    );
  }, [users, search]);

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">Loading users…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <div className="mb-5">
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">All Users</h1>
            <p className="mt-1 text-slate-500">
              Manage all accounts in the housing system.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-sm text-slate-500">
            <span>Total users</span>
            <span className="text-2xl font-semibold text-slate-900">
              {users.length}
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by NU ID, email, or role…"
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full text-sm text-left text-slate-700">
              <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">NU ID</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                  >
                    <td className="px-4 py-3 text-slate-500">{u.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{u.nu_id}</td>
                    <td className="px-4 py-3 text-slate-800">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColor[u.role_id] || "bg-slate-100 text-slate-700 border border-slate-200"}`}
                      >
                        {roleLabel[u.role_id] || `Role ${u.role_id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{u.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
