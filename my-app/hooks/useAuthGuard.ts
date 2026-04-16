"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, resolveSession } from "@/lib/auth";

type AuthGuardStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuthGuard(requiredRole?: string) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthGuardStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isActive = true;

    const checkSession = async () => {
      const session = await resolveSession(requiredRole);
      if (!isActive) return;

      if (!session?.user) {
        setUser(null);
        setStatus("unauthenticated");
        router.replace("/auth/login");
        return;
      }

      setUser(session.user);
      setStatus("authenticated");
    };

    void checkSession();

    return () => {
      isActive = false;
    };
  }, [requiredRole, router]);

  return {
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user,
  };
}
