"use client";

import { useState, useEffect } from "react";

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

interface Document {
  id: number;
  type: string;
  download_url: string;
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

function getStatusColor(status: string) {
  switch (status) {
    case "approved": return "bg-green-100 text-green-800 border-green-200";
    case "rejected": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
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
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="text-xs font-medium text-gray-500 min-w-[180px]">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const info = parseAdditionalInfo(application.additional_info);

  const fetchDocuments = async () => {
    if (documents.length > 0) return;
    setDocsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/documents/application/${application.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const docs = await response.json();
        setDocuments(Array.isArray(docs) ? docs : []);
      }
    } catch (e) {
      console.error("Failed to fetch documents", e);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) fetchDocuments();
  };

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={handleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-gray-400">#{application.id}</div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {info["Name Surname"] || "Application"} — {info["School"] || application.major}
            </p>
            <p className="text-xs text-gray-500">Submitted: {formatDate(application.submitted_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(application.status)}`}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
          <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 px-6 py-5 space-y-6 bg-gray-50">
          {application.status === "rejected" && application.rejected_reason && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
              <p className="text-sm text-red-700 mt-1">{application.rejected_reason}</p>
            </div>
          )}
          {application.status === "approved" && (
            <div className="rounded-md bg-green-50 border border-green-200 p-3">
              <p className="text-sm font-medium text-green-800">✓ Your application has been approved!</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Student Information</h4>
            <div className="space-y-2">
              <InfoRow label="Applicant Type" value={info["Applicant Type"]} />
              <InfoRow label="Student ID" value={info["Student ID"]} />
              <InfoRow label="Name Surname" value={info["Name Surname"]} />
              <InfoRow label="ФИО" value={info["ФИО"]} />
              <InfoRow label="Gender" value={info["Gender"] || application.gender} />
              <InfoRow label="Phone" value={info["Phone"]} />
              <InfoRow label="Date of Birth" value={info["Date of Birth"]} />
              <InfoRow label="ИИН" value={info["ИИН"]} />
              <InfoRow label="Passport" value={info["Passport"]} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Academic Information</h4>
            <div className="space-y-2">
              <InfoRow label="School" value={info["School"] || application.major} />
              <InfoRow label="Level" value={info["Level"]} />
              <InfoRow label="Major" value={info["Major"]} />
              <InfoRow label="Year" value={info["Year of Study"]} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Housing Questions</h4>
            <div className="space-y-2">
              <InfoRow label="Apartment in Astana" value={info["Apartment in Astana"]} />
              <InfoRow label="Parents work in Astana" value={info["Parents work in Astana"]} />
              <InfoRow label="Astana resident" value={info["Astana resident"]} />
            </div>
          </div>

          {info["Preferred Roommate"] && (
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Preferences</h4>
              <div className="space-y-2">
                <InfoRow label="Preferred Roommate" value={info["Preferred Roommate"]} />
              </div>
            </div>
          )}

          {info["Comments"] && (
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Comments</h4>
              <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded p-3">{info["Comments"]}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Submitted Documents</h4>
            {docsLoading ? (
              <p className="text-sm text-gray-400">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-200 rounded p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">📄</span>
                      <span className="text-sm text-gray-700">{docTypeLabels[doc.type] || doc.type}</span>
                    </div>
                    <a href={doc.download_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">Download</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-200 flex gap-6 text-xs text-gray-400">
            <span>Submitted: {formatDate(application.submitted_at)}</span>
            <span>Last Updated: {formatDate(application.updated_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in first");
          setIsLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8080/applications/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

        const apps = await response.json();
        setApplications(Array.isArray(apps) ? apps : []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("Failed to load applications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center gap-3">
          <span className="text-red-600">⚠️</span>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          My Applications ({applications.length})
        </h3>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-300 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg mb-2">No applications found</p>
          <p className="text-gray-400 text-sm">Submit your first housing application to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}