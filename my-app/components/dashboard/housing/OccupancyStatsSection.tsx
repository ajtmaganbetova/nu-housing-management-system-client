"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/auth";
import { BarChart3, CheckCircle2, Clock3, RefreshCw, Users } from "lucide-react";

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

interface Resident {
  applicationId: number;
  studentId: string;
  name: string;
}

interface ApprovedApplicant extends Resident {
  preferredRoommateId: string;
}

interface RoomAllocation {
  roomLabel: string;
  residents: [Resident, Resident];
}

const TOTAL_ROOMS = 2772;

function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

function parseAdditionalInfo(info: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!info) return result;

  info.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key) result[key] = value;
  });

  return result;
}

function normalizeIdentifier(value: string | number | undefined | null) {
  if (value === undefined || value === null) return "";
  return String(value).trim().replace(/\s+/g, "").toLowerCase();
}

function extractStudentId(
  application: Application,
  info: Record<string, string>
) {
  return (
    info["Student ID"] ||
    info["StudentID"] ||
    info["NU ID"] ||
    info["NU_ID"] ||
    String(application.student_id)
  );
}

function extractPreferredRoommateId(info: Record<string, string>) {
  return (
    info["Preferred Roommate"] ||
    info["Preferred roommate"] ||
    info["Preferred Roommate ID"] ||
    info["Roommate ID"] ||
    ""
  );
}

function extractResidentName(
  application: Application,
  info: Record<string, string>
) {
  const name =
    info["Name Surname"] ||
    info["Name"] ||
    [info["First Name"], info["Last Name"]].filter(Boolean).join(" ").trim();

  return name || `Student ${extractStudentId(application, info)}`;
}

function buildApprovedRoomAllocations(applications: Application[]) {
  const approved = applications
    .filter((application) => application.status === "approved")
    .map((application) => {
      const info = parseAdditionalInfo(application.additional_info);
      const studentId = extractStudentId(application, info);
      const preferredRoommateId = extractPreferredRoommateId(info);

      return {
        application,
        studentId,
        preferredRoommateId,
        normalizedStudentId: normalizeIdentifier(studentId),
        normalizedPreferredRoommateId: normalizeIdentifier(preferredRoommateId),
        name: extractResidentName(application, info),
      };
    })
    .filter((application) => application.normalizedStudentId);

  const byStudentId = new Map(
    approved.map((application) => [application.normalizedStudentId, application])
  );

  const pairedApplicationIds = new Set<number>();
  const residentPairs: [Resident, Resident][] = [];

  approved.forEach((application) => {
    if (pairedApplicationIds.has(application.application.id)) return;
    if (!application.normalizedPreferredRoommateId) return;

    const roommate = byStudentId.get(application.normalizedPreferredRoommateId);
    if (!roommate) return;
    if (roommate.application.id === application.application.id) return;
    if (pairedApplicationIds.has(roommate.application.id)) return;

    if (
      roommate.normalizedPreferredRoommateId !== application.normalizedStudentId
    ) {
      return;
    }

    pairedApplicationIds.add(application.application.id);
    pairedApplicationIds.add(roommate.application.id);

    residentPairs.push([
      {
        applicationId: application.application.id,
        studentId: application.studentId,
        name: application.name,
      },
      {
        applicationId: roommate.application.id,
        studentId: roommate.studentId,
        name: roommate.name,
      },
    ]);
  });

  const rooms: RoomAllocation[] = residentPairs
    .sort((left, right) => left[0].name.localeCompare(right[0].name))
    .slice(0, TOTAL_ROOMS)
    .map((residents, index) => ({
      roomLabel: `Room ${index + 1}`,
      residents,
    }));

  const unassignedApprovedApplicants: ApprovedApplicant[] = approved
    .filter((application) => !pairedApplicationIds.has(application.application.id))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((application) => ({
      applicationId: application.application.id,
      studentId: application.studentId,
      name: application.name,
      preferredRoommateId: application.preferredRoommateId,
    }));

  return {
    rooms,
    unassignedApprovedApplicants,
  };
}

export default function OccupancyStatsSection() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchApplications = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const payload = await apiJson<Application[]>("/housing/applications", {
        method: "GET",
      });

      setApplications(Array.isArray(payload) ? payload : []);
      setError("");
    } catch (fetchError) {
      console.error("Failed to load occupancy statistics", fetchError);
      setError("Failed to load occupancy statistics. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  const stats = useMemo(() => {
    const approved = applications.filter(
      (application) => application.status === "approved"
    ).length;

    const pending = applications.filter(
      (application) => application.status === "pending"
    ).length;

    const rejected = applications.filter(
      (application) => application.status === "rejected"
    ).length;

    const totalApplications = applications.length;

    const allocationResult = buildApprovedRoomAllocations(applications);
    const occupiedRooms = allocationResult.rooms.length;
    const waitingApproved = allocationResult.unassignedApprovedApplicants.length;

    const occupancyRate =
      TOTAL_ROOMS === 0 ? 0 : (occupiedRooms / TOTAL_ROOMS) * 100;

    const availableRooms = Math.max(TOTAL_ROOMS - occupiedRooms, 0);

    const approvalRate =
      totalApplications === 0 ? 0 : (approved / totalApplications) * 100;

    return {
      approved,
      pending,
      rejected,
      totalApplications,
      occupiedRooms,
      waitingApproved,
      occupancyRate,
      availableRooms,
      approvalRate,
    };
  }, [applications]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
            Reports
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#17172f]">
            Occupancy Stats
          </h1>
          <p className="mt-2 max-w-3xl text-base text-[#7d879b]">
            Review actual room occupancy, approval flow, and room availability
            in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchApplications(true)}
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17172f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a4a] active:scale-95"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : "transition-transform"}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9e0f2] border-t-[#17172f]" />
        </div>
      ) : error ? (
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6f63ff]/10 text-[#6f63ff]">
                  <BarChart3 size={20} />
                </div>
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Occupancy rate
                </p>
              </div>
              <p className="mt-3 text-3xl font-bold text-[#17172f]">
                {formatPercentage(stats.occupancyRate)}
              </p>
              <p className="mt-2 text-sm text-[#7d879b]">
                Based on {stats.occupiedRooms} actually occupied rooms out of{" "}
                {TOTAL_ROOMS} total rooms.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <Clock3 size={20} />
                </div>
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Pending placements
                </p>
              </div>
              <p className="mt-3 text-3xl font-bold text-[#17172f]">
                {stats.pending}
              </p>
              <p className="mt-2 text-sm text-[#7d879b]">
                Applications waiting for review or decision.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Approved applications
                </p>
              </div>
              <p className="mt-3 text-3xl font-bold text-[#17172f]">
                {stats.approved}
              </p>
              <p className="mt-2 text-sm text-[#7d879b]">
                Total approved applications, not the same as occupied rooms.
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-[#17172f]">
                  Statistics overview
                </p>
                <p className="mt-1 text-sm text-[#667085]">
                  Real-time summary of room occupancy and application outcomes.
                </p>
              </div>
              <span className="rounded-full bg-[#f8faff] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                Live database results
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[#eceff6] bg-[#f8f9fc] p-5">
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Total applications
                </p>
                <p className="mt-2 text-2xl font-bold text-[#17172f]">
                  {stats.totalApplications}
                </p>
              </div>

              <div className="rounded-2xl border border-[#eceff6] bg-[#f8f9fc] p-5">
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Occupied rooms
                </p>
                <p className="mt-2 text-2xl font-bold text-[#17172f]">
                  {stats.occupiedRooms}
                </p>
              </div>

              <div className="rounded-2xl border border-[#eceff6] bg-[#f8f9fc] p-5">
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Available rooms
                </p>
                <p className="mt-2 text-2xl font-bold text-[#17172f]">
                  {stats.availableRooms}
                </p>
              </div>

              <div className="rounded-2xl border border-[#eceff6] bg-[#f8f9fc] p-5">
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Approval rate
                </p>
                <p className="mt-2 text-2xl font-bold text-[#17172f]">
                  {formatPercentage(stats.approvalRate)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-[#eceff6] bg-[#f8f9fc] p-5">
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Waiting approved students
                </p>
                <p className="mt-2 text-2xl font-bold text-[#17172f]">
                  {stats.waitingApproved}
                </p>
                <p className="mt-2 text-sm text-[#667085]">
                  Approved students without a mutual roommate match yet.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eceff6] bg-[#f8f9fc] p-5">
                <p className="text-sm font-semibold text-[#98a2b3]">
                  Rejected applications
                </p>
                <p className="mt-2 text-2xl font-bold text-[#17172f]">
                  {stats.rejected}
                </p>
                <p className="mt-2 text-sm text-[#667085]">
                  Applications that were not approved.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eceff6] bg-[#f8f9fc] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#98a2b3]">
                      Pairing status
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#17172f]">
                      {stats.occupiedRooms === 0 ? "Not started" : "Active"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#667085]">
                  Rooms become occupied only after mutual roommate matching.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-[#d6daea] bg-[#f8f9fc] p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9aa3b8]">
                    Occupancy
                  </p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e8ebf5]">
                    <div
                      className="h-full rounded-full bg-[#6f63ff] transition-all"
                      style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#667085]">
                    {formatPercentage(stats.occupancyRate)} of total rooms are
                    occupied.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9aa3b8]">
                    Pending share
                  </p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e8ebf5]">
                    <div
                      className="h-full rounded-full bg-[#f59e0b] transition-all"
                      style={{
                        width: `${
                          stats.totalApplications === 0
                            ? 0
                            : (stats.pending / stats.totalApplications) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#667085]">
                    {stats.totalApplications === 0
                      ? "0.0%"
                      : formatPercentage(
                          (stats.pending / stats.totalApplications) * 100
                        )}{" "}
                    of all applications are still pending.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9aa3b8]">
                    Approval share
                  </p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e8ebf5]">
                    <div
                      className="h-full rounded-full bg-[#10b981] transition-all"
                      style={{ width: `${Math.min(stats.approvalRate, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#667085]">
                    {formatPercentage(stats.approvalRate)} of applications are
                    approved.
                  </p>
                </div>
              </div>

              {stats.occupiedRooms === 0 && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  No occupied rooms yet. A room is counted as occupied only when
                  two approved students mutually select each other as roommates.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}