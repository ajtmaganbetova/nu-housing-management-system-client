"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fingerprint,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { apiJson } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { SidebarHousing } from "@/components/dashboard/SidebarHousing";

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
  2: "Housing Staff",
  3: "Admin",
};

const roleBadgeClasses: Record<number, string> = {
  1: "border-emerald-200 bg-emerald-50 text-emerald-700",
  2: "border-[#6f63ff]/20 bg-[#6f63ff]/5 text-[#6f63ff]",
  3: "border-amber-200 bg-amber-50 text-amber-700",
};

const roleIdToApiRole: Record<number, string> = {
  1: "student",
  2: "housing",
  3: "admin",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard("admin");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const payload = await apiJson<{ users?: User[] } | User[]>("/admin/users", {
        method: "GET",
      });
      setUsers(Array.isArray(payload) ? payload : payload.users ?? []);
      setError("");
    } catch (loadError) {
      console.error("Failed to load users", loadError);
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    void loadUsers();
  }, [authLoading, isAuthenticated]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const role = roleLabel[user.role_id] ?? `Role ${user.role_id}`;
      const matchesRole =
        roleFilter === "all" || role.toLowerCase() === roleFilter.toLowerCase();
      const matchesQuery =
        !query ||
        user.nu_id.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        role.toLowerCase().includes(query) ||
        (user.phone ?? "").toLowerCase().includes(query);

      return matchesRole && matchesQuery;
    });
  }, [roleFilter, search, users]);

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;

    setDeletingUserId(user.id);
    setMessage("");
    try {
      await apiJson(`/admin/users/${user.id}`, { method: "DELETE" });
      setMessage("User deleted successfully.");
      await loadUsers();
    } catch (deleteError) {
      setMessage(
        deleteError instanceof Error ? deleteError.message : "Failed to delete user.",
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleRoleChange = async (user: User, nextRoleId: number) => {
    if (user.role_id === nextRoleId) return;

    setUpdatingUserId(user.id);
    setMessage("");
    try {
      await apiJson(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        jsonBody: {
          role: roleIdToApiRole[nextRoleId],
        },
      });
      setMessage("User role updated successfully.");
      await loadUsers();
    } catch (updateError) {
      setMessage(
        updateError instanceof Error ? updateError.message : "Failed to update role.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const totalStudents = users.filter((user) => user.role_id === 1).length;
  const totalHousing = users.filter((user) => user.role_id === 2).length;
  const totalAdmins = users.filter((user) => user.role_id === 3).length;

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
            activeSection="users"
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
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6f63ff]">
                    <ShieldCheck size={14} />
                    <span>Admin Database</span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">
                    User Accounts
                  </h1>
                  <p className="max-w-3xl text-sm text-[#7d879b]">
                    Review students, create housing staff or admin accounts, and
                    remove accounts from the system.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Students" value={totalStudents} />
                  <MiniStat label="Housing" value={totalHousing} />
                  <MiniStat label="Admins" value={totalAdmins} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[#17172f]">
                      Account Directory
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      Search all accounts and focus on students or staff by role.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:max-w-xl lg:flex-row">
                    <div className="relative flex-1">
                      <Search
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa3b8]"
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by NU ID, email, phone, or role..."
                        className="w-full rounded-2xl border border-[#edf1f8] bg-white py-3 pl-12 pr-4 text-sm text-[#17172f] shadow-sm outline-none transition focus:border-[#6f63ff] focus:ring-4 focus:ring-[#6f63ff]/10"
                      />
                    </div>

                    <select
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value)}
                      className="rounded-2xl border border-[#edf1f8] bg-white px-4 py-3 text-sm text-[#17172f] outline-none transition focus:border-[#6f63ff] focus:ring-4 focus:ring-[#6f63ff]/10"
                    >
                      <option value="all">All roles</option>
                      <option value="student">Students</option>
                      <option value="housing staff">Housing Staff</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="rounded-[28px] border-2 border-dashed border-[#edf1f8] px-6 py-12 text-center">
                      <p className="font-medium text-[#9aa3b8]">
                        No accounts match the current filters.
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <article
                        key={user.id}
                        className="flex flex-col gap-4 rounded-[28px] border border-white bg-white/60 p-5 transition hover:bg-white hover:shadow-xl md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#f3f4f8] font-bold text-[#17172f] shadow-inner">
                            {user.nu_id.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-bold text-[#17172f]">
                                {user.email}
                              </p>
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase ${roleBadgeClasses[user.role_id] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}
                              >
                                {roleLabel[user.role_id] ?? `Role ${user.role_id}`}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#8b94a8]">
                              <span className="inline-flex items-center gap-1.5">
                                <Fingerprint size={12} /> {user.nu_id}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Phone size={12} /> {user.phone || "No phone"}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Mail size={12} /> Created {formatDate(user.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={String(user.role_id)}
                            disabled={updatingUserId === user.id}
                            onChange={(event) =>
                              void handleRoleChange(user, Number(event.target.value))
                            }
                            className="h-10 rounded-xl border border-[#e5e9f4] bg-white px-3 text-xs font-semibold text-[#667085] outline-none disabled:cursor-not-allowed disabled:opacity-80"
                          >
                            <option value="1">Student</option>
                            <option value="2">Housing Staff</option>
                            <option value="3">Admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => void handleDeleteUser(user)}
                            disabled={deletingUserId === user.id}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            {deletingUserId === user.id ? "Removing..." : "Delete"}
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              {message && (
                <div
                  className={`rounded-[28px] px-5 py-4 text-sm ${
                    message.toLowerCase().includes("success")
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#17172f]">Role Changes</p>
                    <p className="mt-1 text-sm text-[#667085]">
                      Roles can now be updated directly from the account directory.
                      Student, Housing Staff, and Admin are supported.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-[#edf1f8] bg-white/70 px-4 py-4 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[#98a2b3]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#17172f]">{value}</p>
    </div>
  );
}
