"use client";

import { useState } from "react";
import Link from "next/link";
import OAuthButtons from "@/components/auth/OAuthButtons";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { getDashboardPathForRole, signInWithCredentials } from "@/lib/auth";

function FeaturePill({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col h-full rounded-[26px] border border-white/70 bg-white/75 p-5 shadow-[0_14px_32px_rgba(122,132,173,0.12)] transition-all hover:shadow-lg">
      <p className="text-sm font-semibold tracking-tight text-[#17172f]">
        {title}
      </p>
      <p className="mt-1 text-xs leading-5 text-[#5a6475]">{subtitle}</p>
    </div>
  );
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const session = await signInWithCredentials(email, password);
      window.location.href = getDashboardPathForRole(session.user?.role);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Network error: Could not connect to server",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[36px] antialiased">
      <Card className="relative mx-auto grid max-w-6xl gap-8 overflow-hidden p-6 md:grid-cols-[1.1fr_0.9fr] md:p-12 items-center">
        <div className="space-y-9">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-white">
              NU
            </div>
            <div>
              <p className="text-sm font-semibold text-[#17172f]">
                Student Portal
              </p>
              <p className="text-xs text-[#7d879b]">Housing System</p>
            </div>
          </div>

          <div>
            <h2 className="max-w-xl text-4xl font-semibold leading-[1.15] tracking-tight text-[#17172f] md:text-5xl">
              Welcome back. Apply for your dorm and track your housing status.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FeaturePill
              title="Easy application"
              subtitle="Fill out your dorm application quickly and clearly."
            />
            <FeaturePill
              title="Track status"
              subtitle="See whether your application is pending or updated."
            />
            <FeaturePill
              title="Student access"
              subtitle="Use your university account to access services securely."
            />
          </div>
        </div>

        <Card className="relative border border-white/80 bg-white/90 p-8 md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5e6578]">
              Student sign in
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#17172f]">
              Access the housing portal
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5a6475]">
              Sign in with your corporate account to manage your residency and
              applications.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <OAuthButtons />

            <div className="mt-8 text-center text-sm">
              <p className="text-[#5a6475]">Use your NU email to sign in.</p>
              <p className="mt-2 text-[#5a6475]">
                Having issues?{" "}
                <button className="text-[#17172f] font-bold hover:underline underline-offset-4 transition-all">
                  Contact support
                </button>
              </p>
            </div>
          </form>
        </Card>
      </Card>
    </div>
  );
}
