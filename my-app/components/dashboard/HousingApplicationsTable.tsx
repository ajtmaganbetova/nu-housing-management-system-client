"use client";

import { useState, useEffect } from "react";
import { apiJson } from "@/lib/auth";
import {
  ApplicationDocument,
  listApplicationDocuments,
  resolveDocumentDownloadUrl,
} from "@/lib/documents";

interface Application {
  id: number;
  student_id: number;
  year: number;
  major: string;
  gender: string;
  additional_info: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  rejected_reason?: string;
}

function parseAdditionalInfo(info: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!info) return result;
  info.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      result[key] = value;
    }
  });
  return result;
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

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="grid gap-1 rounded-2xl border border-[#edf1f8] bg-white/75 px-4 py-3 md:grid-cols-[180px_1fr]">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#9aa3b8]">
        {label}
      </span>
      <span className="text-sm text-[#17172f]">{value}</span>
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
        className="flex cursor-pointer flex-col gap-4 px-6 py-5 transition hover:bg-white/55 lg:flex-row lg:items-center lg:justify-between"
        onClick={handleExpand}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9aa3b8]">
            Application #{application.id}
          </p>
          <h4 className="mt-2 text-lg font-semibold tracking-tight text-[#17172f]">
            {info["Name Surname"] || "Application"}
          </h4>
          <p className="mt-1 text-sm text-[#7d879b]">
            {info["Student ID"]
              ? `Student ID: ${info["Student ID"]}`
              : `Student DB ID: ${application.student_id}`}{" "}
            · Submitted {formatDate(application.submitted_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {application.status === "pending" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(application.id);
                }}
                className="rounded-full bg-[#17172f] px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(application.id);
                }}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 transition hover:-translate-y-0.5"
              >
                Reject
              </button>
            </>
          )}
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(application.status)}`}
          >
            {application.status.charAt(0).toUpperCase() +
              application.status.slice(1)}
          </span>
          <span className="text-sm text-[#7d879b]">
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
              <InfoRow label="Applicant type" value={info["Applicant Type"]} />
              <InfoRow
                label="Student ID"
                value={info["Student ID"] || String(application.student_id)}
              />
              <InfoRow label="Name surname" value={info["Name Surname"]} />
              <InfoRow label="ФИО" value={info["ФИО"]} />
              <InfoRow
                label="Gender"
                value={info["Gender"] || application.gender}
              />
              <InfoRow label="Phone" value={info["Phone"]} />
              <InfoRow label="Date of birth" value={info["Date of Birth"]} />
              <InfoRow label="ИИН" value={info["ИИН"]} />
              <InfoRow label="Passport" value={info["Passport"]} />
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

          {application.status === "rejected" && application.rejected_reason && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">Rejection reason:</span>{" "}
              {application.rejected_reason}
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
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[#edf1f8] bg-[#f8faff] px-4 py-3"
                  >
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

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

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
          <p className="text-sm font-medium text-[#5e6578]">Admin review</p>
          <h3 className="text-2xl font-semibold tracking-tight text-[#17172f]">
            Housing applications
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <FilterChip
              key={status}
              active={filterStatus === status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              onClick={() => setFilterStatus(status)}
            />
          ))}
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
