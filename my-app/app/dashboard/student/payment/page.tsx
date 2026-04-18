"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function StudentPaymentPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(195,198,244,0.90),_rgba(239,241,247,0.88)_35%,_rgba(232,236,247,0.94)_70%,_rgba(211,216,243,0.98)_100%)] p-6">
      <div className="mx-auto max-w-3xl rounded-[30px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur">


       <Link
         href="/dashboard/student"
         className="inline-flex items-center gap-2 text-sm font-medium text-[#6f63ff] transition hover:underline"
       >
         <ArrowLeft size={16} />
         Back to My Applications
       </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
          Payment
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17172f]">
          Housing payment
        </h1>

        <p className="mt-3 text-[#667085]">
          Application ID: {applicationId ?? "Not provided"}
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-[#d6daea] bg-[#f8f9fc] p-6 text-sm text-[#667085]">
          This is a placeholder payment page. Later you can connect it to:
          <br />
          - your backend payment endpoint
          <br />
          - Kaspi / Stripe / bank transfer flow
          <br />- payment status saving in the database
        </div>
      </div>
    </div>
  );
}