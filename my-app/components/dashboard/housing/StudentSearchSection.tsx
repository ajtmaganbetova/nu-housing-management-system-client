"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/auth";
import {
  ApplicationDocument,
  listApplicationDocuments,
  resolveDocumentDownloadUrl,
} from "@/lib/documents";
import { RefreshCw, Search, UserRound } from "lucide-react";

interface Application {
  id: number;
  student_id: number;
  year: number;
  major: string;
  gender: string;
  additional_info: string;
  status: "pending" | "approved" | "rejected" | string;
  submitted_at: string;
  updated_at: string;
  rejected_reason?: string;
}

function parseAdditionalInfo(info: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!info) return result;

  info.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    if (key) result[key] = value;
  });

  return result;
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

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[#f0f3f9] bg-white/50 px-4 py-3 transition-colors hover:border-[#6f63ff]/20">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9aa3b8]">
        {label}
      </span>
      <span
        className="truncate text-sm font-semibold text-[#17172f]"
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

function SearchResultCard({ application }: { application: Application }) {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [openingDocumentId, setOpeningDocumentId] = useState<
    string | number | null
  >(null);
  const info = parseAdditionalInfo(application.additional_info);
  const fullName = info["Name Surname"] || "Anonymous Applicant";
  const email = info["Email"] || info["NU Email"] || info["Personal Email"];
  const studentId = info["Student ID"] || String(application.student_id);
  const school = info["School"] || application.major;
  const phone = info["Phone"];

  const fetchDocuments = async () => {
    if (documents.length > 0) return;
    setDocsLoading(true);
    try {
      const docs = await listApplicationDocuments(application.id);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents", error);
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
    <article className="overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_42px_rgba(122,132,173,0.12)] backdrop-blur">
      <div
        className="grid cursor-pointer gap-4 p-5 transition hover:bg-white/50 lg:grid-cols-[1fr_auto]"
        onClick={handleExpand}
      >
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#17172f] text-white shadow-lg">
              <UserRound size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-[#17172f]">
                {fullName}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="truncate text-sm text-[#667085]">
                  Student ID: {studentId}
                </p>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase ${getStatusClasses(application.status)}`}
                >
                  {application.status}
                </span>
                <span className="text-xs tracking-tight text-[#9aa3b8]">
                  {formatDate(application.submitted_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoRow label="Email" value={email} />
            <InfoRow label="Phone" value={phone} />
            <InfoRow label="School" value={school} />
            <InfoRow label="Application ID" value={String(application.id)} />
          </div>
        </div>

        <div className="flex items-start justify-end gap-3">
          <span className="rounded-full border border-[#edf1f8] bg-[#f8faff] px-4 py-2 text-xs font-semibold text-[#667085]">
            #{application.id}
          </span>
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
              <InfoRow label="Applicant type" value={info["Applicant Type"]} />
              <InfoRow label="Student ID" value={studentId} />
              <InfoRow label="Name surname" value={info["Name Surname"]} />
              <InfoRow label="Gender" value={info["Gender"] || application.gender} />
              <InfoRow label="Phone" value={info["Phone"]} />
              <InfoRow label="Email" value={email} />
              <InfoRow label="Date of birth" value={info["Date of Birth"]} />
              <InfoRow label="Passport" value={info["Passport"]} />
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa3b8]">
                Academic and housing details
              </h5>
              <InfoRow label="School" value={info["School"] || application.major} />
              <InfoRow label="Level" value={info["Level"]} />
              <InfoRow label="Major" value={info["Major"] || application.major} />
              <InfoRow label="Year" value={info["Year of Study"] || String(application.year)} />
              <InfoRow
                label="Apartment in Astana"
                value={info["Apartment in Astana"]}
              />
              <InfoRow
                label="Parents work in Astana"
                value={info["Parents work in Astana"]}
              />
              <InfoRow label="Astana resident" value={info["Astana resident"]} />
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
              <p className="mt-3 text-sm text-[#7d879b]">Loading documents...</p>
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
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleOpenDocument(doc);
                      }}
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
    </article>
  );
}

export default function StudentSearchSection() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchApplications = async (
    showRefreshState = false,
    searchQuery = "",
    searchStatus = "all"
  ) => {
    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const params = new URLSearchParams();
      const normalizedQuery = searchQuery.trim();
      if (normalizedQuery) params.set("search", normalizedQuery);
      if (searchStatus !== "all") params.set("status", searchStatus);

      const endpoint = params.toString()
        ? `/housing/applications?${params.toString()}`
        : "/housing/applications";
      const apps = await apiJson<Application[]>(endpoint, { method: "GET" });
      setApplications(Array.isArray(apps) ? apps : []);
      setError("");
    } catch (err) {
      console.error("Error fetching housing applications:", err);
      setError("Failed to load student applications. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchApplications(false, query, status);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query, status]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
            Operations
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#17172f]">
            Student Search
          </h1>
          <p className="mt-2 text-base text-[#7d879b]">
            Search and review student housing applicants.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchApplications(true, query, status)}
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17172f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a4a] active:scale-95"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : "transition-transform"}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Results"}
        </button>
      </div>

      <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)] backdrop-blur">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <label className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98a2b3]"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by student name, ID, email, phone, or school"
              className="h-12 w-full rounded-2xl border border-[#e7eaf4] bg-[#f9faff] pl-11 pr-4 text-sm text-[#17172f] outline-none transition focus:border-[#6f63ff]"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 rounded-2xl border border-[#e7eaf4] bg-[#f9faff] px-4 text-sm text-[#475467] outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#eceff6] bg-[#f8f9fc] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#17172f]">
                Search results
              </p>
              <p className="mt-1 text-sm text-[#667085]">
                {applications.length} matching{" "}
                {applications.length === 1 ? "application" : "applications"}
                {query.trim() ? ` for "${query.trim()}"` : ""}.
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">
              Live database results
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9e0f2] border-t-[#17172f]" />
        </div>
      ) : error ? (
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-[30px] border border-white/70 bg-white/78 px-6 py-12 text-center shadow-[0_18px_42px_rgba(122,132,173,0.14)]">
          <p className="text-lg font-medium text-[#17172f]">
            No students found
          </p>
          <p className="mt-2 text-sm text-[#7d879b]">
            Adjust the search text or status filter to find a matching housing
            application.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <SearchResultCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </section>
  );
}
