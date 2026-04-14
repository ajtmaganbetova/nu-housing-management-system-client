"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; role?: string }>({});

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser({});
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-blue-600 font-bold text-lg">NU Housing</span>
      </div>
      <div className="flex items-center gap-4">
        {user.email && (
          <span className="text-sm text-gray-600">{user.email}</span>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}