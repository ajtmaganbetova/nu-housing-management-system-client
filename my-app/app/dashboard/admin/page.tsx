"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  UserPlus,
  History,
  Settings,
  LogOut,
  Search,
  ShieldCheck,
  Mail,
  Phone,
  Fingerprint,
} from "lucide-react";
import {
  SidebarHousing,
  type HousingSection,
} from "@/components/dashboard/SidebarHousing";

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

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Mocking user state for the sidebar (in real app, get from auth context)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(data.users ?? data);
      } catch (err) {
        console.error("failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.nu_id.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9e0f2] border-t-[#6f63ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(195,198,244,0.90),_rgba(239,241,247,0.88)_35%,_rgba(232,236,247,0.94)_70%,_rgba(211,216,243,0.98)_100%)]">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 lg:px-10">
        <div className="grid gap-10 xl:grid-cols-[300px_1fr] items-start">
          {/* Reuse the Sidebar we built */}
          <SidebarHousing
            activeSection="search" // Setting search as active for this page
            onSectionChange={(s) => router.push(`/dashboard/admin/${s}`)}
            user={currentUser}
            onLogout={() => {
              localStorage.clear();
              router.push("/auth/login");
            }}
          />

          {/* MAIN CONTENT AREA */}
          <div className="min-w-0 rounded-[40px] border border-white/70 bg-white/80 p-6 md:p-10 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur-md">
            {/* HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#6f63ff] font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  <span>Administrative Control</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">
                  User Directory
                </h1>
                <p className="text-[#7d879b] text-sm">
                  Review system access and manage credentials for {users.length}{" "}
                  registered accounts.
                </p>
              </div>

              {/* SEARCH BAR */}
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa3b8] group-focus-within:text-[#6f63ff] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by ID or Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-80 bg-white border border-[#edf1f8] rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#6f63ff]/10 focus:border-[#6f63ff] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* USERS LIST (Replacing Table with Premium Cards) */}
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[28px] border border-white bg-white/50 hover:bg-white transition-all hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-[20px] bg-[#f3f4f8] flex items-center justify-center text-[#17172f] font-bold shadow-inner group-hover:bg-[#6f63ff] group-hover:text-white transition-all duration-300">
                        {u.nu_id.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#17172f]">
                            {u.email}
                          </h4>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                              u.role_id === 3
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : u.role_id === 2
                                  ? "border-[#6f63ff]/20 bg-[#6f63ff]/5 text-[#6f63ff]"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {roleLabel[u.role_id]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="flex items-center gap-1.5 text-xs text-[#9aa3b8]">
                            <Fingerprint size={12} /> {u.nu_id}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-[#9aa3b8]">
                            <Phone size={12} /> {u.phone || "No phone"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="h-10 px-4 rounded-xl text-xs font-bold text-[#7d879b] hover:bg-gray-100 transition-colors">
                        Edit Details
                      </button>
                      <button className="h-10 px-4 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors">
                        Revoke
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-[#edf1f8]">
                  <p className="text-[#9aa3b8] font-medium">
                    No users match your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
