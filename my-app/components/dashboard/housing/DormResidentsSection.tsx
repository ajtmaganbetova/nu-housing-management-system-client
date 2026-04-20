"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/auth";
import { Building2, RefreshCw } from "lucide-react";

interface BackendRoommate {
  fio?: string;
  name?: string;
}

interface BackendDormInventoryRow {
  application_id?: number;
  block?: number;
  room_number?: number;
  fio?: string;
  roommates?: BackendRoommate[];
}

interface RoomResidentRecord {
  id: string;
  block: string;
  roomLabel: string;
  residents: string[];
}

const DORM_BLOCKS = ["19", "20", "21", "22", "23", "24", "25", "26", "27"] as const;

function readFirstString(values: Array<string | number | undefined | null>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function normalizeResidentName(value: BackendRoommate) {
  return readFirstString([value.fio, value.name]) || "";
}

function normalizeRoomRecord(
  room: BackendDormInventoryRow,
  index: number,
): RoomResidentRecord | null {
  const block = readFirstString([room.block]);
  const roomNumber = readFirstString([room.room_number]);
  if (!block || !roomNumber) return null;
  if (!DORM_BLOCKS.includes(block as (typeof DORM_BLOCKS)[number])) {
    return null;
  }

  const residents = [
    readFirstString([room.fio]) || "",
    ...(room.roommates ?? []).map(normalizeResidentName),
  ]
    .map((name) => name.trim())
    .filter(Boolean);

  return {
    id: String(room.application_id ?? `${block}.${roomNumber}-${index}`),
    block,
    roomLabel: `${block}.${roomNumber}`,
    residents: Array.from(new Set(residents)),
  };
}

function getRoomSortValue(roomLabel: string) {
  const [blockPart = "0", roomPart = "0"] = roomLabel.split(".");
  return Number(blockPart) * 10000 + Number(roomPart);
}

export default function DormResidentsSection() {
  const [rooms, setRooms] = useState<RoomResidentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchRooms = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const payload = await apiJson<BackendDormInventoryRow[]>(
        "/housing/dorm-inventory",
        {
        method: "GET",
        },
      );

      const groupedRooms = new Map<string, RoomResidentRecord>();

      (Array.isArray(payload) ? payload : []).forEach((room, index) => {
        const normalizedRoom = normalizeRoomRecord(room, index);
        if (!normalizedRoom) return;

        const existingRoom = groupedRooms.get(normalizedRoom.roomLabel);
        if (!existingRoom) {
          groupedRooms.set(normalizedRoom.roomLabel, normalizedRoom);
          return;
        }

        existingRoom.residents = Array.from(
          new Set([...existingRoom.residents, ...normalizedRoom.residents]),
        );
      });

      const normalizedRooms = Array.from(groupedRooms.values()).sort(
        (left, right) =>
          getRoomSortValue(left.roomLabel) - getRoomSortValue(right.roomLabel),
      );

      setRooms(normalizedRooms);
      setError("");
    } catch (fetchError) {
      console.error("Failed to load dorm residents", fetchError);
      setError("Failed to load dorm residents. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchRooms();
  }, []);

  const roomsByBlock = useMemo(
    () =>
      DORM_BLOCKS.map((block) => ({
        block,
        rooms: rooms.filter((room) => room.block === block),
      })).filter((entry) => entry.rooms.length > 0),
    [rooms],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f63ff]">
            Operations
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#17172f]">
            Dorm Residents
          </h1>
          <p className="mt-2 max-w-3xl text-base text-[#7d879b]">
            Rooms use the `block.floorRoom` format like `23.615`.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchRooms(true)}
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17172f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2a4a] active:scale-95"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : "transition-transform"}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Residents"}
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
      ) : roomsByBlock.length === 0 ? (
        <div className="rounded-[30px] border border-white/70 bg-white/85 px-6 py-12 text-center shadow-[0_18px_50px_rgba(122,132,173,0.12)]">
          <p className="text-lg font-semibold text-[#17172f]">
            No dorm residents found
          </p>
          <p className="mt-2 text-sm text-[#7d879b]">
            The backend did not return any room assignments for blocks 19 to 27.
          </p>
        </div>
      ) : (
        roomsByBlock.map((block) => (
          <div
            key={block.block}
            className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(122,132,173,0.12)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6f63ff]/10 text-[#6f63ff]">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-xl font-semibold text-[#17172f]">
                  Block {block.block}
                </p>
                <p className="text-sm text-[#667085]">
                  {block.rooms.length} {block.rooms.length === 1 ? "room" : "rooms"}
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[22px] border border-[#edf1f8] bg-[#f8faff]">
              <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-[#edf1f8] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#98a2b3]">
                <p>Room</p>
                <p>Residents</p>
              </div>
              {block.rooms.map((room) => (
                <div
                  key={room.id}
                  className="grid grid-cols-[120px_1fr] gap-4 border-b border-[#edf1f8] px-4 py-3 last:border-b-0"
                >
                  <p className="text-sm font-bold text-[#17172f]">
                    {room.roomLabel}
                  </p>

                  {room.residents.length === 0 ? (
                    <p className="text-sm text-[#7d879b]">
                      No residents assigned
                    </p>
                  ) : (
                    <p className="text-sm leading-6 text-[#475467]">
                      {room.residents.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
