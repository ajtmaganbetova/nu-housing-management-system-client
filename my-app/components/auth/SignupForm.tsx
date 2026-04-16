"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import {
  getDashboardPathForRole,
  registerStudent,
  signInWithCredentials,
} from "@/lib/auth";

function MiniInfo({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-[0_12px_28px_rgba(122,132,173,0.1)]">
      <p className="text-sm font-semibold tracking-tight text-[#17172f]">
        {title}
      </p>
      <p className="mt-1 text-xs leading-5 text-[#7d879b]">{text}</p>
    </div>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nuId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "nuId" && value !== "" && !/^\d{0,9}$/.test(value)) return;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim().endsWith("@nu.edu.kz")) {
      setError("Only @nu.edu.kz email addresses are allowed.");
      return;
    }

    if (formData.nuId.length !== 9) {
      setError("Student ID must be exactly 9 digits.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await registerStudent({
        nu_id: formData.nuId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "student",
      });

      const session = await signInWithCredentials(
        formData.email.trim(),
        formData.password,
      );
      setSuccess("Account created successfully. Redirecting...");
      setTimeout(
        () => router.push(getDashboardPathForRole(session.user?.role)),
        1200,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create account. Check if the backend is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_top_left,_rgba(202,206,251,0.95),_rgba(240,242,248,0.72)_38%,_rgba(237,240,248,0.9)_70%,_rgba(213,217,243,0.95)_100%)] p-4 md:p-8">
      <Card className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_18px_40px_rgba(122,132,173,0.12)]">
            <p className="text-sm font-medium text-[#5e6578]">
              Student onboarding
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-[#17172f]">
              Create your housing portal account
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#7d879b]">
              Set up your profile once and use it for application submission,
              status tracking, and housing communication.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MiniInfo
              title="NU email only"
              text="Registration is restricted to official university email addresses."
            />
            <MiniInfo
              title="Fast profile setup"
              text="Your student ID, contact details, and account access are saved together."
            />
            <MiniInfo
              title="Secure access"
              text="Your credentials are validated before redirecting to your dashboard."
            />
            <MiniInfo
              title="Built for students"
              text="Designed to match the soft dashboard style across the platform."
            />
          </div>
        </div>

        <Card className="border border-white/80 bg-white/82">
          <div>
            <p className="text-sm font-medium text-[#5e6578]">Registration</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-[#17172f]">
              Open your account
            </h3>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="nuId"
                name="nuId"
                type="text"
                label="Student ID"
                required
                placeholder="202400001"
                value={formData.nuId}
                onChange={handleChange}
                maxLength={9}
              />
              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone number"
                required
                placeholder="+7 700 123 4567"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                label="First name"
                required
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                label="Last name"
                required
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <Input
              id="email"
              name="email"
              type="email"
              label="University email"
              autoComplete="email"
              required
              placeholder="name@nu.edu.kz"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="new-password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7d879b]">
            Already registered?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#17172f] transition hover:opacity-75"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </Card>
    </div>
  );
}
