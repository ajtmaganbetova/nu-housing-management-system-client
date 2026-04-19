export interface HousingApplicationIdentity {
  fio?: string | null;
  name?: string | null;
  full_name?: string | null;
  fullName?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  applicant_type?: string | null;
  passport_number?: string | null;
}

export interface RoomAllocation {
  block?: number | string | null;
  room_number?: number | string | null;
  roomNumber?: number | string | null;
  bed_number?: number | string | null;
  bedNumber?: number | string | null;
}

export type AdditionalInfo = Record<string, string>;

export function readFirstString(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
}

export function parseAdditionalInfo(info: string): AdditionalInfo {
  const result: AdditionalInfo = {};
  if (!info) return result;

  info.split(/\r?\n/).forEach((line) => {
    const separatorIndex = line.search(/[:-]/);
    if (separatorIndex === -1) return;

    const key = line.substring(0, separatorIndex).trim();
    const value = line.substring(separatorIndex + 1).trim();

    if (key) result[key] = value;
  });

  return result;
}

export function getAdditionalInfoValue(
  info: AdditionalInfo,
  keys: string[],
) {
  return readFirstString(keys.map((key) => info[key]));
}

function joinNameParts(firstName: unknown, lastName: unknown) {
  return readFirstString([
    [firstName, lastName]
      .filter((value) => typeof value === "string" && value.trim())
      .join(" "),
  ]);
}

export function getApplicantFullName(
  application: HousingApplicationIdentity,
  info: AdditionalInfo,
) {
  return readFirstString([
    application.fio,
    application.full_name,
    application.fullName,
    joinNameParts(application.first_name, application.last_name),
    joinNameParts(application.firstName, application.lastName),
    application.name,
    getAdditionalInfoValue(info, ["Name Surname", "Full Name", "FIO", "ФИО"]),
    joinNameParts(info["First Name"], info["Last Name"]),
    joinNameParts(info["Name"], info["Surname"]),
  ]);
}

export function getApplicantType(
  application: HousingApplicationIdentity,
  info: AdditionalInfo,
) {
  return readFirstString([
    application.applicant_type,
    getAdditionalInfoValue(info, ["Applicant Type", "Type"]),
  ]);
}

export function getPassportNumber(
  application: HousingApplicationIdentity,
  info: AdditionalInfo,
) {
  return readFirstString([
    application.passport_number,
    getAdditionalInfoValue(info, ["Passport", "Passport Number"]),
  ]);
}

export function formatRoomAllocation(
  allocation?: RoomAllocation | null,
) {
  if (!allocation) return null;

  const block = readFirstString([allocation.block]);
  const roomNumber = readFirstString([
    allocation.room_number,
    allocation.roomNumber,
  ]);
  const bedNumber = readFirstString([
    allocation.bed_number,
    allocation.bedNumber,
  ]);

  if (!roomNumber) return null;

  const roomLabel = block ? `${block}.${roomNumber}` : roomNumber;
  return bedNumber ? `${roomLabel}, bed ${bedNumber}` : roomLabel;
}
