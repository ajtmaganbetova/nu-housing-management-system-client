"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/auth";
import { Building2, DoorOpen, RefreshCw, Users } from "lucide-react";

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
  block: DormBlock;
  roomNumber: number;
  roomLabel: string;
  residents: [Resident, Resident];
}

const TOTAL_ROOMS = 2772;
const DORM_BLOCKS = ["D1", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"] as const;
type DormBlock = (typeof DORM_BLOCKS)[number];
const ROOMS_PER_BLOCK = TOTAL_ROOMS / DORM_BLOCKS.length;

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
        info,
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

  const rooms = residentPairs
    .sort((left, right) => left[0].name.localeCompare(right[0].name))
    .slice(0, TOTAL_ROOMS)
    .map((residents, index) => {
      const block = DORM_BLOCKS[Math.floor(index / ROOMS_PER_BLOCK)];
      const roomNumber = (index % ROOMS_PER_BLOCK) + 1;

      return {
        block,
        roomNumber,
        roomLabel: `${block}-${String(roomNumber).padStart(3, "0")}`,
        residents,
      } satisfies RoomAllocation;
    });

  const unassignedApprovedApplicants = approved
    .filter((application) => !pairedApplicationIds.has(application.application.id))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((application) => ({
      applicationId: application.application.id,
      studentId: application.studentId,
      name: application.name,
      preferredRoommateId: application.preferredRoommateId,
    })) satisfies ApprovedApplicant[];

  return {
    rooms,
    unassignedApprovedApplicants,
  };
}

export default function DormInventorySection() {
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
      console.error("Failed to load dorm inventory data", fetchError);
      setError("Failed to load dorm inventory. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  const allocationResult = useMemo(
    () => buildApprovedRoomAllocations(applications),
    [applications]
  );
  const roomAllocations = allocationResult.rooms;
  const unassignedApprovedApplicants =
    allocationResult.unassignedApprovedApplicants;

  const blockSummaries = useMemo(
    () =>
      DORM_BLOCKS.map((block) => {
        const rooms = roomAllocations.filter((room) => room.block === block);
        return {
          block,
          occupied: rooms.length,
          available: ROOMS_PER_BLOCK - rooms.length,
          rooms,
        };
      }),
    [roomAllocations]
  );

  const occupiedRooms = roomAllocations.length;
  const availableRooms = TOTAL_ROOMS - occupiedRooms;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
            Operations
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#17172f]">
            Dorm Inventory
          </h1>
          <p className="mt-2 max-w-3xl text-base text-[#7d879b]">
            Rooms are marked occupied only when two approved applicants choose
            each other as roommates and their student IDs match mutually.
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
          {isRefreshing ? "Refreshing..." : "Refresh Inventory"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6f63ff]/10 text-[#6f63ff]">
              <Building2 size={20} />
            </div>
            <p className="text-sm font-semibold text-[#98a2b3]">Total rooms</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#17172f]">
            {TOTAL_ROOMS}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Users size={20} />
            </div>
            <p className="text-sm font-semibold text-[#98a2b3]">Occupied</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#17172f]">
            {occupiedRooms}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <DoorOpen size={20} />
            </div>
            <p className="text-sm font-semibold text-[#98a2b3]">Available</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#17172f]">
            {availableRooms}
          </p>
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
      ) : (
        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-[#17172f]">
                  Block summary
                </p>
                <p className="mt-1 text-sm text-[#667085]">
                  {roomAllocations.length} occupied{" "}
                  {roomAllocations.length === 1 ? "room" : "rooms"} generated
                  from approved mutual roommate pairs.
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">
                {ROOMS_PER_BLOCK} rooms per block
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {blockSummaries.map((block) => (
                <div
                  key={block.block}
                  className="rounded-2xl border border-[#eceff6] bg-[#f8f9fc] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#17172f]">
                      {block.block}
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                      {block.occupied} occupied
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#667085]">
                    {block.available} / {ROOMS_PER_BLOCK} available
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-[#17172f]">
                  Approved But Not Assigned
                </p>
                <p className="mt-1 text-sm text-[#667085]">
                  These applicants are approved but do not yet have a mutual
                  roommate match, so they are not occupying a room.
                </p>
              </div>
              <span className="rounded-full bg-[#f8faff] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                {unassignedApprovedApplicants.length} waiting
              </span>
            </div>

            {unassignedApprovedApplicants.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-[#e4e7f0] bg-[#f8faff] px-4 py-8 text-center text-sm text-[#7d879b]">
                All approved applicants are currently assigned to rooms.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {unassignedApprovedApplicants.map((applicant) => (
                  <article
                    key={applicant.applicationId}
                    className="rounded-[24px] border border-[#edf1f8] bg-[#f8faff] p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-bold text-[#17172f]">
                        {applicant.name}
                      </p>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                        Waiting
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-[#667085]">
                      <p>Student ID: {applicant.studentId}</p>
                      <p>
                        Preferred roommate:{" "}
                        {applicant.preferredRoommateId || "Not provided"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {blockSummaries.map((block) => (
            <div
              key={block.block}
              className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xl font-semibold text-[#17172f]">
                    {block.block} Block
                  </p>
                  <p className="mt-1 text-sm text-[#667085]">
                    {block.occupied} occupied, {block.available} available.
                  </p>
                </div>
              </div>

              {block.rooms.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#e4e7f0] bg-[#f8faff] px-4 py-8 text-center text-sm text-[#7d879b]">
                  No occupied rooms in this block yet.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {block.rooms.map((room) => (
                    <article
                      key={room.roomLabel}
                      className="rounded-[24px] border border-[#edf1f8] bg-[#f8faff] p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-bold text-[#17172f]">
                          Room {room.roomLabel}
                        </p>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          Occupied
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {room.residents.map((resident) => (
                          <div
                            key={resident.applicationId}
                            className="rounded-2xl border border-white bg-white/90 px-4 py-3"
                          >
                            <p className="text-sm font-semibold text-[#17172f]">
                              {resident.name}
                            </p>
                            <p className="mt-1 text-xs text-[#7d879b]">
                              Student ID: {resident.studentId}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
