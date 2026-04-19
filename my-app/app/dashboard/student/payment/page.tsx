"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  getApplicationPaymentSummary,
  initiateApplicationPayment,
  PaymentSummaryResponse,
  syncApplicationPayment,
} from "@/lib/payments";

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString();
}

function formatCurrency(amount: number, currency?: string | null) {
  const resolvedCurrency = currency?.trim().toUpperCase() || "USD";

  return new Intl.NumberFormat(
    resolvedCurrency === "KZT" ? "ru-KZ" : "en-US",
    {
      style: "currency",
      currency: resolvedCurrency,
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

function getStatusCopy(status?: string | null) {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        className: "border-green-200 bg-green-50 text-green-700",
      };
    case "awaiting_confirmation":
      return {
        label: "Awaiting confirmation",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "expired":
      return {
        label: "Expired",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    default:
      return {
        label: "Pending",
        className: "border-[#d6daea] bg-[#f8f9fc] text-[#5f6b85]",
      };
  }
}

export default function StudentPaymentPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const stripeSessionId = searchParams.get("stripe_session_id");
  const paymentQueryStatus = searchParams.get("payment");
  const numericApplicationId = applicationId ? Number(applicationId) : NaN;

  const [summary, setSummary] = useState<PaymentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingPayment, setStartingPayment] = useState(false);
  const [syncingPayment, setSyncingPayment] = useState(false);
  const [error, setError] = useState("");

  const payment = summary?.payment ?? null;
  const displayCurrency = payment?.currency ?? summary?.currency ?? "USD";
  const statusCopy = useMemo(
    () => getStatusCopy(payment?.status),
    [payment?.status],
  );

  useEffect(() => {
    if (!Number.isInteger(numericApplicationId)) {
      setLoading(false);
      setError("A valid applicationId query parameter is required.");
      return;
    }

    let cancelled = false;

    const load = async (createIfMissing = false) => {
      try {
        const shouldSyncOnReturn =
          Boolean(stripeSessionId) && paymentQueryStatus === "success";

        const payload = createIfMissing
          ? await initiateApplicationPayment(numericApplicationId)
          : shouldSyncOnReturn
            ? await syncApplicationPayment(numericApplicationId, stripeSessionId)
            : await getApplicationPaymentSummary(numericApplicationId);

        if (cancelled) return;

        if (
          createIfMissing &&
          payload.payable &&
          !payload.payment
        ) {
          setSummary(payload);
          setError("The payment request was not created.");
          return;
        }

        if (!createIfMissing && payload.payable && !payload.payment) {
          const created = await initiateApplicationPayment(numericApplicationId);
          if (cancelled) return;
          setSummary(created);
          setError("");
          return;
        }

        setSummary(payload);
        setError("");
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load payment information.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [numericApplicationId, paymentQueryStatus, stripeSessionId]);

  useEffect(() => {
    if (!Number.isInteger(numericApplicationId)) return;
    if (!payment) return;
    if (payment.status === "paid" || payment.status === "expired") return;

    const interval = window.setInterval(async () => {
      try {
        const refreshed = await getApplicationPaymentSummary(
          numericApplicationId,
        );
        setSummary(refreshed);
      } catch {
        // Ignore polling errors to avoid interrupting the page.
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [numericApplicationId, payment]);

  const handleStartPayment = async () => {
    if (!Number.isInteger(numericApplicationId)) return;

    setStartingPayment(true);
    setError("");

    try {
      const payload = await initiateApplicationPayment(numericApplicationId);
      setSummary(payload);
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Failed to start payment.",
      );
    } finally {
      setStartingPayment(false);
    }
  };

  const handleSync = async () => {
    if (!Number.isInteger(numericApplicationId)) return;

    setSyncingPayment(true);
    setError("");

    try {
      const payload = await syncApplicationPayment(
        numericApplicationId,
        stripeSessionId,
      );
      setSummary(payload);
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : "Failed to sync payment status.",
      );
    } finally {
      setSyncingPayment(false);
    }
  };

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

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#d6daea] bg-[#f8f9fc] p-6 text-sm text-[#5f6b85]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading payment information...
          </div>
        ) : summary ? (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusCopy.className}`}
              >
                {statusCopy.label}
              </span>
              <span className="text-sm text-[#667085]">
                Amount due: {formatCurrency(summary.payment?.amount_kzt ?? summary.amount_kzt, displayCurrency)}
              </span>
            </div>

            {!summary.payable ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
                This application is not payable yet. Payment becomes available only after the housing application is approved.
              </div>
            ) : (
              <>
                {payment?.status === "paid" ? (
                  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-700">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-semibold">Payment confirmed</p>
                        <p className="mt-1 text-sm">
                          Your Stripe test payment was marked as paid on{" "}
                          {formatDate(payment.paid_at)}.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-5">
                    <div className="rounded-2xl border border-[#d6daea] bg-[#f8f9fc] p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b8198]">
                        Stripe payment details
                      </p>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <DetailCard
                          label="Reference"
                          value={payment?.payment_reference ?? "Will be generated"}
                        />
                        <DetailCard
                          label="Amount"
                          value={formatCurrency(payment?.amount_kzt ?? summary.amount_kzt, displayCurrency)}
                        />
                        <DetailCard
                          label="Merchant"
                          value={
                            summary.merchant_name ||
                            "Configure STRIPE_MERCHANT_NAME"
                          }
                        />
                        <DetailCard
                          label="Stripe session"
                          value={payment?.provider_session_id ?? "Not created yet"}
                        />
                        <DetailCard
                          label="Created"
                          value={formatDate(payment?.created_at)}
                        />
                        <DetailCard
                          label="Expires"
                          value={formatDate(payment?.expires_at)}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#d6daea] bg-white p-6 text-sm text-[#4f5b75]">
                      <div className="flex items-start gap-3">
                        <Clock3 className="mt-0.5 h-5 w-5 text-[#6f63ff]" />
                        <div>
                          <p className="font-semibold text-[#17172f]">
                            How to pay with Stripe test mode
                          </p>
                          <p className="mt-2">
                            {payment?.instructions ||
                              "Create a payment request, complete it in Stripe Checkout, then return here to monitor the status."}
                          </p>
                          {payment?.provider_message && (
                            <p className="mt-3 rounded-xl bg-[#f8f9fc] px-4 py-3 text-[#5f6b85]">
                              {payment.provider_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {!payment || payment.status === "expired" ? (
                        <button
                          type="button"
                          onClick={handleStartPayment}
                          disabled={startingPayment}
                          className="inline-flex items-center justify-center rounded-xl bg-[#17172f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a4a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {startingPayment ? "Creating..." : "Create payment request"}
                        </button>
                      ) : (
                        <>
                          {payment.provider_checkout_url && (
                            <button
                              type="button"
                              onClick={() => {
                                window.location.href = payment.provider_checkout_url!;
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17172f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a4a]"
                            >
                              Open Stripe Checkout
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={handleSync}
                            disabled={syncingPayment}
                            className="inline-flex items-center justify-center rounded-xl border border-[#d6daea] bg-white px-5 py-3 text-sm font-semibold text-[#17172f] transition hover:bg-[#f8f9fc] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {syncingPayment ? "Syncing..." : "Sync Stripe status"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (Number.isInteger(numericApplicationId)) {
                                void getApplicationPaymentSummary(
                                  numericApplicationId,
                                )
                                  .then(setSummary)
                                  .catch(() => {});
                              }
                            }}
                            className="inline-flex items-center justify-center rounded-xl border border-[#d6daea] bg-white px-5 py-3 text-sm font-semibold text-[#17172f] transition hover:bg-[#f8f9fc]"
                          >
                            Refresh status
                          </button>
                        </>
                      )}
                    </div>

                    {paymentQueryStatus === "cancelled" && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                        The Stripe Checkout session was cancelled before payment completed.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9aa3b8]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[#17172f]">{value}</p>
    </div>
  );
}
