"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function CreateUserPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuthGuard("admin");

  const [form, setForm] = useState({
    nu_id: "",
    email: "",
    phone: "",
    role: "housing",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiRequest("/admin/create-user", {
        method: "POST",
        jsonBody: form,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create user");
      }

      setSuccess("User created successfully!");
      setTimeout(() => router.push("/dashboard/admin/users"), 1200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
     <div className="mb-5">
              <button
                onClick={() => router.push("/dashboard/admin")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
              >
                ← Back to Dashboard
              </button>
            </div>
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 border border-slate-200">
        <h1 className="text-2xl font-bold mb-6 text-slate-900">
          Create New User
        </h1>

        {success && (
          <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 border border-green-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={submitForm} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              NU ID
            </label>
            <input
              name="nu_id"
              type="text"
              required
              value={form.nu_id}
              onChange={handleChange}
              placeholder="e.g., 20250001"
              className="w-full border border-slate-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="example@nu.edu.kz"
              className="w-full border text-gray-900 border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              placeholder="+77001234567"
              className="w-full border text-gray-900 border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-gray-900"
            >
              <option value="housing">Housing Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border text-gray-900 border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}
