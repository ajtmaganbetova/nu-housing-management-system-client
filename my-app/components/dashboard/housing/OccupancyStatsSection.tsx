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

interface BackendDormInventoryRow {
  application_id?: number | null;
  block?: number | string | null;
  room_number?: number | string | null;
}

const TOTAL_ROOMS = 2772;
const DORM_BLOCKS = ["19", "20", "21", "22", "23", "24", "25", "26", "27"] as const;

function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

function readFirstString(values: Array<string | number | undefined | null>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
}

function getInventoryRoomLabel(room: BackendDormInventoryRow) {
  const block = readFirstString([room.block]);
  const roomNumber = readFirstString([room.room_number]);

  if (!block || !roomNumber) return null;
  if (!DORM_BLOCKS.includes(block as (typeof DORM_BLOCKS)[number])) return null;

  return `${block}.${roomNumber}`;
}

export default function OccupancyStatsSection() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [inventoryRows, setInventoryRows] = useState<BackendDormInventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStatsData = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [applicationsPayload, inventoryPayload] = await Promise.all([
        apiJson<Application[]>("/housing/applications", {
          method: "GET",
        }),
        apiJson<BackendDormInventoryRow[]>("/housing/dorm-inventory", {
          method: "GET",
        }),
      ]);

      setApplications(Array.isArray(applicationsPayload) ? applicationsPayload : []);
      setInventoryRows(Array.isArray(inventoryPayload) ? inventoryPayload : []);
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
    void fetchStatsData();
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

    const occupiedRoomLabels = new Set<string>();
    const assignedApplicationIds = new Set<number>();

    inventoryRows.forEach((row) => {
      const roomLabel = getInventoryRoomLabel(row);
      if (!roomLabel) return;

      occupiedRoomLabels.add(roomLabel);

      if (typeof row.application_id === "number" && Number.isFinite(row.application_id)) {
        assignedApplicationIds.add(row.application_id);
      }
    });

    const occupiedRooms = occupiedRoomLabels.size;
    const waitingApproved = applications.filter(
      (application) =>
        application.status === "approved" &&
        !assignedApplicationIds.has(application.id)
    ).length;

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
  }, [applications, inventoryRows]);

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
          onClick={() => void fetchStatsData(true)}
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
                Based on {stats.occupiedRooms} occupied rooms in dorm inventory out of{" "}
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
                Total approved applications, separate from occupied-room count.
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
                  Summary based on housing applications and dorm inventory records.
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
                  Approved applications with no recorded room assignment yet.
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
                      Assignment status
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#17172f]">
                      {stats.occupiedRooms === 0 ? "No assignments" : "Active"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#667085]">
                  Status is based on whether dorm inventory currently contains room assignments.
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
                  No occupied rooms are currently recorded in dorm inventory.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
