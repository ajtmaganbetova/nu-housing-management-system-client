"use client";

import { useState, useEffect } from "react";
import { apiJson } from "@/lib/auth";
import {
  ApplicationDocument,
  listApplicationDocuments,
  resolveDocumentDownloadUrl,
} from "@/lib/documents";
import {
  getApplicantFullName,
  getApplicantType,
  getPassportNumber,
  parseAdditionalInfo,
  readFirstString,
} from "@/lib/housing-applications";

interface Application {
  id: number;
  student_id: number;
  applicant_type?: string;
  fio?: string;
  passport_number?: string;
  year: number;
  major: string;
  gender: string;
  additional_info: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  rejected_reason?: string;
  rejectedReason?: string;
  manual_review_reason?: string;
  manualReviewReason?: string;
  review_reason?: string;
  reviewReason?: string;
  reasoning?: string;
  paid?: boolean;
  payed?: boolean;
  is_paid?: boolean;
  isPayed?: boolean;
  payment_status?: string;
  paymentStatus?: string;
}

function getApplicationReviewReason(application: Application) {
  return readFirstString([
    application.rejected_reason,
    application.rejectedReason,
    application.manual_review_reason,
    application.manualReviewReason,
    application.review_reason,
    application.reviewReason,
    application.reasoning,
  ]);
}

function getDocumentStatus(document: ApplicationDocument) {
  return readFirstString([
    document.status,
    document.review_status,
    document.reviewStatus,
    document.decision,
    document.decision_status,
    document.decisionStatus,
  ]);
}

function getDocumentReviewReason(document: ApplicationDocument) {
  return readFirstString([
    document.rejected_reason,
    document.rejectedReason,
    document.manual_review_reason,
    document.manualReviewReason,
    document.review_reason,
    document.reviewReason,
    document.reasoning,
    document.ai_reasoning,
    document.aiReasoning,
  ]);
}

function getReviewTone(status: string | null) {
  switch (status) {
    case "rejected":
      return {
        container: "border-red-200 bg-red-50 text-red-700",
        label: "Rejection reason",
      };
    case "approved":
      return null;
    default:
      return {
        container: "border-amber-200 bg-amber-50 text-amber-700",
        label: "Manual review reason",
      };
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "approved":
      return "border-green-200 bg-green-50 text-green-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isApplicationPaid(application: Application) {
  const booleanValue = [
    application.paid,
    application.payed,
    application.is_paid,
    application.isPayed,
  ].find((value) => typeof value === "boolean");

  if (typeof booleanValue === "boolean") return booleanValue;

  const normalizedStatus = readFirstString([
    application.payment_status,
    application.paymentStatus,
  ])?.toLowerCase();

  return normalizedStatus
    ? ["paid", "payed", "completed", "success", "successful", "succeeded"].includes(
        normalizedStatus,
      )
    : false;
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[#f0f3f9] bg-white/50 px-4 py-3 transition-colors hover:border-[#6f63ff]/20">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9aa3b8]">
        {label}
      </span>
      <span
        className="text-sm font-semibold text-[#17172f] truncate"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

const docTypeLabels: Record<string, string> = {
  passport_scan: "Passport Scan",
  property_self: "Property Certificate (Self)",
  property_mother: "Property Certificate (Mother)",
  property_father: "Property Certificate (Father)",
  work_mother: "Work Certificate (Mother)",
  work_father: "Work Certificate (Father)",
  residence_self: "Residence Proof (Self)",
  residence_mother: "Residence Proof (Mother)",
  residence_father: "Residence Proof (Father)",
  additional: "Additional Documents",
};

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#17172f] text-white shadow-[0_14px_30px_rgba(23,23,47,0.18)]"
          : "border border-white/80 bg-white/85 text-[#5e6578] shadow-[0_8px_24px_rgba(122,132,173,0.08)]"
      }`}
    >
      {label}
    </button>
  );
}

function ApplicationCard({
  application,
  onApprove,
  onReject,
}: {
  application: Application;
  onApprove: (applicationId: number) => void;
  onReject: (applicationId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [openingDocumentId, setOpeningDocumentId] = useState<
    string | number | null
  >(null);
  const info = parseAdditionalInfo(application.additional_info);
  const applicantName =
    getApplicantFullName(application, info) || "Anonymous Applicant";
  const applicantType = getApplicantType(application, info);
  const passportNumber = getPassportNumber(application, info);
  const applicationReviewReason = getApplicationReviewReason(application);
  const applicationReviewTone = getReviewTone(application.status);

  const fetchDocuments = async () => {
    if (documents.length > 0) return;
    setDocsLoading(true);
    try {
      const docs = await listApplicationDocuments(application.id);
      setDocuments(docs);
    } catch (e) {
      console.error("Failed to fetch documents", e);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleExpand = () => {
    setExpanded((current) => !current);
    if (!expanded) void fetchDocuments();
  };

  const handleOpenDocument = async (document: ApplicationDocument) => {
    const docId = document.id ?? document.name ?? document.type;
    setOpeningDocumentId(docId);
    try {
      const url = await resolveDocumentDownloadUrl(document);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to resolve document download", error);
      window.alert(
        error instanceof Error ? error.message : "Unable to open document.",
      );
    } finally {
      setOpeningDocumentId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/78 shadow-[0_18px_42px_rgba(122,132,173,0.14)] backdrop-blur-xl">
      <div
        className="grid cursor-pointer grid-cols-[auto_1fr_auto_auto] items-center gap-6 p-6 transition hover:bg-white/50"
        onClick={handleExpand}
      >
        {/* 1. ID Indicator - Fixed Width */}
        <div className="flex items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
            <span className="text-xs font-bold">#{application.id}</span>
          </div>
        </div>

        {/* 2. Name & Date - Occupies remaining space (1fr) */}
        <div className="min-w-0">
          <h4 className="truncate text-base font-bold text-[#17172f]">
            {applicantName}
          </h4>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getStatusClasses(application.status)}`}
            >
              {application.status}
            </span>
            <span className="text-xs tracking-tight text-[#9aa3b8]">
              · {formatDate(application.submitted_at)}
            </span>
          </div>
        </div>

        {/* 3. Actions & Status Badge - Fixed container to prevent shifting */}
        <div className="flex items-center justify-end gap-3 min-w-[180px]">
          {application.status === "pending" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(application.id);
                }}
                className="rounded-full bg-[#17172f] px-5 py-2 text-xs font-bold text-white transition hover:scale-105 active:scale-95"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(application.id);
                }}
                className="rounded-full border border-red-100 bg-red-50 px-5 py-2 text-xs font-bold text-red-600 transition hover:scale-105 active:scale-95"
              >
                Reject
              </button>
            </div>
          ) : (
            <span
              className={`rounded-full border px-4 py-1.5 text-xs font-bold shadow-sm ${getStatusClasses(application.status)}`}
            >
              {application.status.charAt(0).toUpperCase() +
                application.status.slice(1)}
            </span>
          )}
          {/* <span className="text-sm font-medium text-[#7d879b]">
            {expanded ? "Hide" : "Open"}
          </span> */}
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-[#7d879b]">
            {expanded ? "Hide" : "Open"}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/70 bg-[#f8faff] px-6 py-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa3b8]">
                Student information
              </h5>
              <InfoRow
                label="Applicant type"
                value={applicantType ?? undefined}
              />
              <InfoRow
                label="Student ID"
                value={info["Student ID"] || String(application.student_id)}
              />
              <InfoRow label="Name surname" value={applicantName} />
              <InfoRow label="ФИО" value={info["ФИО"]} />
              <InfoRow
                label="Gender"
                value={info["Gender"] || application.gender}
              />
              <InfoRow label="Phone" value={info["Phone"]} />
              <InfoRow label="Date of birth" value={info["Date of Birth"]} />
              <InfoRow label="ИИН" value={info["ИИН"]} />
              <InfoRow
                label="Passport"
                value={passportNumber ?? undefined}
              />
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa3b8]">
                Academic and housing details
              </h5>
              <InfoRow
                label="School"
                value={info["School"] || application.major}
              />
              <InfoRow label="Level" value={info["Level"]} />
              <InfoRow label="Major" value={info["Major"]} />
              <InfoRow label="Year" value={info["Year of Study"]} />
              <InfoRow
                label="Apartment in Astana"
                value={info["Apartment in Astana"]}
              />
              <InfoRow
                label="Parents work in Astana"
                value={info["Parents work in Astana"]}
              />
              <InfoRow
                label="Astana resident"
                value={info["Astana resident"]}
              />
              <InfoRow
                label="Preferred roommate"
                value={info["Preferred Roommate"]}
              />
            </div>
          </div>

          {applicationReviewReason && applicationReviewTone && (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${applicationReviewTone.container}`}
            >
              <span className="font-semibold">
                {applicationReviewTone.label}:
              </span>{" "}
              {applicationReviewReason}
            </div>
          )}

          {application.status === "approved" && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Application approved successfully.
            </div>
          )}

          {info["Comments"] && (
            <div className="mt-6 rounded-[24px] border border-[#edf1f8] bg-white/80 p-4">
              <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa3b8]">
                Comments
              </h5>
              <p className="mt-2 text-sm leading-6 text-[#5e6578]">
                {info["Comments"]}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-[24px] border border-[#edf1f8] bg-white/80 p-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa3b8]">
              Submitted documents
            </h5>
            {docsLoading ? (
              <p className="mt-3 text-sm text-[#7d879b]">
                Loading documents...
              </p>
            ) : documents.length === 0 ? (
              <p className="mt-3 text-sm text-[#7d879b]">
                No documents uploaded.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-2xl border border-[#edf1f8] bg-[#f8faff] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#17172f]">
                          {docTypeLabels[doc.type] || doc.type}
                        </p>
                        <p className="text-xs text-[#9aa3b8]">
                          {doc.name || "PDF document"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenDocument(doc)}
                        className="rounded-full bg-[#17172f] px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5"
                      >
                        {openingDocumentId === (doc.id ?? doc.name ?? doc.type)
                          ? "Opening..."
                          : "Open"}
                      </button>
                    </div>
                    {(() => {
                      const reason = getDocumentReviewReason(doc);
                      const tone = getReviewTone(getDocumentStatus(doc));
                      if (!reason || !tone) return null;

                      return (
                        <div
                          className={`mt-3 rounded-xl border px-3 py-2 text-xs ${tone.container}`}
                        >
                          <span className="font-semibold">{tone.label}:</span>{" "}
                          {reason}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#9aa3b8]">
            <span>Submitted: {formatDate(application.submitted_at)}</span>
            <span>Updated: {formatDate(application.updated_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HousingApplicationsTable({
  onStatsUpdate,
}: {
  onStatsUpdate?: () => void;
}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showPayedOnly, setShowPayedOnly] = useState(false);

  useEffect(() => {
    void fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const apps = await apiJson<Application[]>("/housing/applications", {
        method: "GET",
      });
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (applicationId: number) => {
    try {
      await apiJson(`/housing/applications/${applicationId}/approve`, {
        method: "PATCH",
      });
      void fetchApplications();
      onStatsUpdate?.();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Error approving application",
      );
    }
  };

  const handleReject = async (applicationId: number) => {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason) return;
    try {
      await apiJson(`/housing/applications/${applicationId}/reject`, {
        method: "PATCH",
        jsonBody: { reason },
      });
      void fetchApplications();
      onStatsUpdate?.();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Error rejecting application",
      );
    }
  };

  const statusFilteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  const filteredApplications = showPayedOnly
    ? statusFilteredApplications.filter((app) => isApplicationPaid(app))
    : statusFilteredApplications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9e0f2] border-t-[#17172f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-[#17172f]">
            Housing applications
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {["all", "pending"].map((status) => (
            <FilterChip
              key={status}
              active={filterStatus === status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              onClick={() => {
                setFilterStatus(status);
                setShowPayedOnly(false);
              }}
            />
          ))}

          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip
              active={filterStatus === "approved"}
              label="Approved"
              onClick={() => setFilterStatus("approved")}
            />
            <FilterChip
              active={showPayedOnly}
              label="Payed"
              onClick={() => {
                setFilterStatus("approved");
                setShowPayedOnly((current) =>
                  filterStatus === "approved" ? !current : true,
                );
              }}
            />
          </div>

          <FilterChip
            active={filterStatus === "rejected"}
            label="Closed"
            onClick={() => {
              setFilterStatus("rejected");
              setShowPayedOnly(false);
            }}
          />
        </div>
      </div>
      {filteredApplications.length === 0 ? (
        <div className="rounded-[30px] border border-white/70 bg-white/78 px-6 py-12 text-center shadow-[0_18px_42px_rgba(122,132,173,0.14)]">
          <p className="text-lg font-medium text-[#17172f]">
            No applications found
          </p>
          <p className="mt-2 text-sm text-[#7d879b]">
            No records match the selected status filter.
          </p>
        </div>
      ) : (
        filteredApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))
      )}
    </div>
  );
}
