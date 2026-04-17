import React from "react";
import {
  ArrowRight,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Zap,
  LucideIcon,
} from "lucide-react";

function formatNameFromEmail(email?: string) {
  if (!email) return { first: "Student", full: "Student" };

  const namePart = email.split("@")[0];
  const parts = namePart
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/);

  const first = parts[0] ?? "Student";
  const capitalizedFirst = first.charAt(0).toUpperCase() + first.slice(1);

  return {
    first: capitalizedFirst,
    full: [capitalizedFirst, ...parts.slice(1)].join(" "),
  };
}

export interface User {
  id: number;
  email: string;
  nu_id: string;
  role: "student" | "admin" | "staff";
  phone: string;
  firstName?: string; // Optional
  lastName?: string; // Optional
}

export interface OverviewTabProps {
  onApply: () => void;
  onTrack: () => void;
  user: User | null;
}

export function InfoCard({
  title,
  value,
  subtitle,
  icon: Icon, // Added icon prop
  colorClass = "bg-[#6f63ff]",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  colorClass?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_16px_40px_rgba(122,132,173,0.10)] transition-all hover:shadow-[0_20px_50px_rgba(122,132,173,0.15)] hover:-translate-y-1">
      {/* Subtle Background Glow */}
      <div
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${colorClass} opacity-[0.03] transition-all group-hover:scale-150 group-hover:opacity-[0.06]`}
      />

      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass} text-white shadow-sm`}
        >
          <Icon size={20} />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#98a2b3]">
          {title}
        </p>
      </div>

      <p className="mt-4 text-xl font-bold tracking-tight text-[#17172f]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[#7d879b] line-clamp-2">
        {subtitle}
      </p>
    </div>
  );
}

export function OverviewTab({ onApply, onTrack, user }: OverviewTabProps) {
  const { first } = formatNameFromEmail(user?.email);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 text-[#6f63ff] font-medium text-sm">
          <Zap size={16} className="fill-[#6f63ff]" />
          <span>Summer 2026 Intake is Live</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#17172f] md:text-5xl">
          {`Welcome, ${first}!`}
        </h1>
        <p className="max-w-full text-[#7d879b]">
          Manage your on-campus living experience. Submit documents, track
          approval stages, and secure your housing for the upcoming term.
        </p>
      </div>

      {/* Visual Info Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          icon={ClipboardCheck}
          title="Step 1"
          value="New Application"
          subtitle="Complete your housing profile and upload mandatory residency certificates."
          colorClass="bg-[#6f63ff]"
        />
        <InfoCard
          icon={Search}
          title="Step 2"
          value="Track Status"
          subtitle="Real-time monitoring of your application through the verification pipeline."
          colorClass="bg-[#00d1ff]"
        />
        <InfoCard
          icon={ShieldCheck}
          title="Step 3"
          value="Get Secured"
          subtitle="Receive your digital permit and move-in instructions once approved."
          colorClass="bg-[#10b981]"
        />
      </div>

      {/* Main Action Callout */}
      <div className="relative overflow-hidden rounded-[32px] border border-[#eceff6] bg-[#17172f] p-8 text-white shadow-2xl md:p-12">
        {/* Decorative Element to act like a GIF/Animation */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#6f63ff]/20 to-transparent opacity-50" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#6f63ff] blur-[100px] opacity-20 animate-pulse" />

        <div className="relative z-10 flex flex-col items-start gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold md:text-3xl">
              Ready to secure your spot?
            </h2>
            <p className="max-w-xl text-white/70 text-sm leading-relaxed">
              The Summer 2026 application period is now open. Make sure you meet
              the eligibility criteria before starting.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onApply}
              className="group flex items-center gap-2 rounded-2xl bg-[#6f63ff] px-8 py-4 text-sm font-bold transition-all hover:bg-[#6053f7] hover:shadow-[0_0_20px_rgba(111,99,255,0.4)]"
            >
              Start New Application
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <button
              onClick={onTrack}
              className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/10"
            >
              Check My Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
