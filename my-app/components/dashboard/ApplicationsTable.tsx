"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { apiJson } from "@/lib/auth";
import {
  ApplicationDocument,
  listApplicationDocuments,
  resolveDocumentDownloadUrl,
  uploadDocument,
} from "@/lib/documents";
import {
  formatRoomAllocation,
  type RoomAllocation,
} from "@/lib/housing-applications";

interface Application {
  id: number;
  student_id: number;
  applicant_type?: string;
  student_number?: string;
  name_surname?: string;
  fio?: string;
  birth_date?: string;
  iin?: string;
  school?: string;
  level?: string;
  passport_number?: string;
  comments?: string;
  year: number;
  major: string;
  gender: string;
  room_preference?: string;
  roomPreference?: string;
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
  room_allocation?: RoomAllocation | null;
  roomAllocation?: RoomAllocation | null;
  block?: number | string | null;
  room_number?: number | string | null;
  roomNumber?: number | string | null;
  bed_number?: number | string | null;
  bedNumber?: number | string | null;
  paid?: boolean;
  payed?: boolean;
  is_paid?: boolean;
  isPayed?: boolean;
  payment_status?: string;
  paymentStatus?: string;
  paid_at?: string | null;
  paidAt?: string | null;
}

interface ApplicationPatchPayload {
  applicant_type: string;
  name_surname: string;
  fio: string;
  birth_date: string;
  iin: string;
  school: string;
  level: string;
  passport_number: string;
  comments: string;
  year: number;
  major: string;
  gender: string;
  room_preference: string;
  additional_info: string;
}

interface EditableApplicationFields {
  applicantType: string;
  nameSurname: string;
  fio: string;
  gender: string;
  phone: string;
  birthDate: string;
  iin: string;
  school: string;
  level: string;
  yearOfStudy: string;
  major: string;
  passportNumber: string;
  roomPreference: string;
  apartmentInAstana: string;
  parentsWorkInAstana: string;
  astanaResident: string;
  preferredRoommate: string;
  comments: string;
}

const editableInfoKeys = {
  applicantType: ["Applicant Type"],
  nameSurname: ["Name Surname", "Full Name"],
  fio: ["ФИО", "FIO"],
  gender: ["Gender"],
  phone: ["Phone"],
  birthDate: ["Date of Birth"],
  iin: ["ИИН", "IIN"],
  school: ["School"],
  level: ["Level"],
  yearOfStudy: ["Year of Study", "Year"],
  major: ["Major"],
  passportNumber: ["Passport"],
  roomPreference: ["Room Preference", "Room preference", "Room Type"],
  apartmentInAstana: ["Apartment in Astana"],
  parentsWorkInAstana: ["Parents work in Astana"],
  astanaResident: ["Astana resident"],
  preferredRoommate: ["Preferred Roommate"],
  comments: ["Comments"],
} as const;

function readFirstString(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
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

function getApplicationFio(
  application: Application,
  info: Record<string, string>,
) {
  return readFirstString([
    application.fio,
    info["ФИО"],
    info["Name Surname"],
    info["Full Name"],
    info["FIO"],
  ]);
}

function getApplicationDisplayName(
  application: Application,
  info: Record<string, string>,
) {
  return readFirstString([
    application.name_surname,
    info["Name Surname"],
    info["Full Name"],
    [info["First Name"], info["Last Name"]].filter(Boolean).join(" "),
    application.fio,
    info["ФИО"],
    info["FIO"],
  ]);
}

function getRoomPreference(
  application: Application,
  info: Record<string, string>,
) {
  return readFirstString([
    application.room_preference,
    application.roomPreference,
    info["Room Preference"],
    info["Room preference"],
    info["Room Type"],
  ]);
}

function getApplicationYear(
  application: Application,
  info: Record<string, string>,
) {
  return readFirstString([
    info["Year of Study"],
    info["Year"],
    Number.isFinite(application.year) ? String(application.year) : "",
  ]);
}

function getApplicationMajor(
  application: Application,
  info: Record<string, string>,
) {
  return readFirstString([info["Major"], application.major, info["School"]]);
}

function normalizeBinaryChoice(value?: string) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "yes" || normalized === "no") return normalized;
  return value ?? ""; 
}

function formatDateForInput(value?: string | null) {
  if (!value) return "";
  const dateOnly = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : "";
}

function updateAdditionalInfo(
  currentInfo: string,
  fields: EditableApplicationFields,
) {
  const lines = currentInfo ? currentInfo.split("\n") : [];
  const updates: Record<string, string> = {
    applicantType: fields.applicantType,
    nameSurname: fields.nameSurname.trim(),
    fio: fields.fio.trim(),
    gender: fields.gender,
    phone: fields.phone.trim(),
    birthDate: fields.birthDate,
    iin: fields.iin.trim(),
    school: fields.school.trim(),
    level: fields.level.trim(),
    yearOfStudy: fields.yearOfStudy.trim(),
    major: fields.level === "NUFYP" ? "NUFYP" : fields.major.trim(),
    passportNumber:
      fields.applicantType === "international"
        ? fields.passportNumber.trim()
        : "",
    roomPreference: fields.roomPreference.trim(),
    apartmentInAstana: fields.apartmentInAstana,
    parentsWorkInAstana: fields.parentsWorkInAstana,
    astanaResident: fields.astanaResident,
    preferredRoommate: fields.preferredRoommate.trim(),
    comments: fields.comments.trim(),
  };
  const seen = new Set<keyof typeof editableInfoKeys>();

  const updatedLines = lines.map((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return line;

    const key = line.substring(0, colonIndex).trim();
    const field = (
      Object.keys(editableInfoKeys) as Array<keyof typeof editableInfoKeys>
    ).find((candidate) =>
      (editableInfoKeys[candidate] as readonly string[]).includes(key),
    );

    if (!field) return line;
    seen.add(field);
    return `${key}: ${updates[field]}`;
  });

  (Object.keys(editableInfoKeys) as Array<keyof typeof editableInfoKeys>)
    .filter((field) => !seen.has(field) && updates[field])
    .forEach((field) => {
      const key = editableInfoKeys[field][0];
      updatedLines.push(`${key}: ${updates[field]}`);
    });

  return updatedLines.filter(Boolean).join("\n");
}

function createEditFields(application: Application): EditableApplicationFields {
  const info = parseAdditionalInfo(application.additional_info);

  return {
    applicantType:
      application.applicant_type ?? info["Applicant Type"] ?? "local",
    nameSurname:
      application.name_surname ??
      readFirstString([info["Name Surname"], info["Full Name"]]) ??
      "",
    fio: getApplicationFio(application, info) ?? "",
    gender: info["Gender"] || application.gender || "",
    phone: info["Phone"] ?? "",
    birthDate:
      formatDateForInput(application.birth_date) || info["Date of Birth"] || "",
    iin: application.iin ?? info["ИИН"] ?? info["IIN"] ?? "",
    school: application.school ?? info["School"] ?? "",
    level: application.level ?? info["Level"] ?? "",
    yearOfStudy: getApplicationYear(application, info) ?? "",
    major: getApplicationMajor(application, info) ?? "",
    passportNumber: application.passport_number ?? info["Passport"] ?? "",
    roomPreference: getRoomPreference(application, info) ?? "",
    apartmentInAstana: normalizeBinaryChoice(info["Apartment in Astana"]),
    parentsWorkInAstana: normalizeBinaryChoice(info["Parents work in Astana"]),
    astanaResident: normalizeBinaryChoice(info["Astana resident"]),
    preferredRoommate: info["Preferred Roommate"] ?? "",
    comments: application.comments ?? info["Comments"] ?? "",
  };
}

function normalizeUpdatedApplication(
  payload: unknown,
  fallback: Application,
  submitted: ApplicationPatchPayload,
): Application {
  const value =
    payload && typeof payload === "object" && "application" in payload
      ? (payload as { application?: unknown }).application
      : payload;

  if (value && typeof value === "object") {
    return {
      ...fallback,
      ...(value as Partial<Application>),
      applicant_type:
        (value as Partial<Application>).applicant_type ??
        submitted.applicant_type,
      name_surname:
        (value as Partial<Application>).name_surname ?? submitted.name_surname,
      fio: (value as Partial<Application>).fio ?? submitted.fio,
      birth_date:
        (value as Partial<Application>).birth_date ?? submitted.birth_date,
      iin: (value as Partial<Application>).iin ?? submitted.iin,
      school: (value as Partial<Application>).school ?? submitted.school,
      level: (value as Partial<Application>).level ?? submitted.level,
      passport_number:
        (value as Partial<Application>).passport_number ??
        submitted.passport_number,
      comments: (value as Partial<Application>).comments ?? submitted.comments,
      year: (value as Partial<Application>).year ?? submitted.year,
      major: (value as Partial<Application>).major ?? submitted.major,
      gender: (value as Partial<Application>).gender ?? submitted.gender,
      room_preference:
        (value as Partial<Application>).room_preference ??
        (value as Partial<Application>).roomPreference ??
        submitted.room_preference,
      additional_info:
        (value as Partial<Application>).additional_info ??
        submitted.additional_info,
      updated_at:
        (value as Partial<Application>).updated_at ??
        new Date().toISOString(),
    };
  }

  return {
    ...fallback,
    ...submitted,
    updated_at: new Date().toISOString(),
  };
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

function getPaidAt(application: Application) {
  return readFirstString([application.paid_at, application.paidAt]);
}

function InfoRow({
  label,
  value,
  children,
  forceVisible = false,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
  forceVisible?: boolean;
}) {
  if (!forceVisible && !children && !value) return null;

  return (
    <div className="grid gap-1 rounded-2xl border border-[#edf1f8] bg-white/75 px-4 py-3 md:grid-cols-[180px_1fr]">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#9aa3b8]">
        {label}
      </span>
      {children ?? <span className="text-sm text-[#17172f]">{value}</span>}
    </div>
  );
}

const inlineInputClass =
  "block min-h-0 w-full rounded-xl border border-[#dfe4f2] bg-white px-3 py-2 text-sm text-[#17172f] outline-none transition focus:border-[#bfc8e6] focus:ring-4 focus:ring-[#dfe6fb]";

function InlineTextField({
  name,
  value,
  onChange,
  type = "text",
}: {
  name: keyof EditableApplicationFields;
  value: string;
  type?: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={inlineInputClass}
    />
  );
}

function InlineSelectField({
  name,
  value,
  options,
  onChange,
}: {
  name: keyof EditableApplicationFields;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={inlineInputClass}
    >
      <option value="">Select option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function InlineChoiceField({
  name,
  value,
  onChange,
}: {
  name: keyof EditableApplicationFields;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required
      className={inlineInputClass}
    >
      <option value="">Select option</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
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

const applicantTypeOptions = [
  { label: "Local", value: "local" },
  { label: "International", value: "international" },
];

const genderOptions = [
  { label: "Female", value: "Female" },
  { label: "Male", value: "Male" },
  { label: "Other", value: "Other" },
];

const levelOptions = [
  { label: "NUFYP", value: "NUFYP" },
  { label: "Undergraduate", value: "UG" },
  { label: "MD (Medical Doctor)", value: "MD (Medical Doctor)" },
];

const schoolOptions = [
  { label: "CPS", value: "CPS" },
  { label: "SEDS", value: "SEDS" },
  { label: "SSH", value: "SSH" },
  { label: "SMG", value: "SMG" },
  { label: "NUSOM", value: "NUSOM" },
];

function ApplicationCard({
  application,
  onApplicationUpdated,
}: {
  application: Application;
  onApplicationUpdated: (application: Application) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditableApplicationFields>(() =>
    createEditFields(application),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [openingDocumentId, setOpeningDocumentId] = useState<
    string | number | null
  >(null);
  const [replacingDocumentId, setReplacingDocumentId] = useState<
    string | number | null
  >(null);
  const [documentError, setDocumentError] = useState("");

  const info = parseAdditionalInfo(application.additional_info);
  const currentFio = getApplicationFio(application, info);
  const displayName = getApplicationDisplayName(application, info);
  const currentYear = getApplicationYear(application, info);
  const currentMajor = getApplicationMajor(application, info);
  const assignedRoom = formatRoomAllocation(
    application.room_allocation ?? application.roomAllocation ?? application,
  );
  const applicationReviewReason = getApplicationReviewReason(application);
  const applicationReviewTone = getReviewTone(application.status);
  const editFormId = `application-edit-${application.id}`;
  const isPaid = isApplicationPaid(application);
  const paidAt = getPaidAt(application);
  const isApproved = application.status.toLowerCase() === "approved";

  useEffect(() => {
    if (!isEditing) {
      setEditFields(createEditFields(application));
    }
  }, [application, isEditing]);

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

  const getDocumentKey = (document: ApplicationDocument) =>
    document.id ?? document.name ?? document.type;

  const handleReplaceDocument = async (
    document: ApplicationDocument,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.type && file.type !== "application/pdf") {
      setDocumentError("Please upload a PDF file.");
      return;
    }

    const documentKey = getDocumentKey(document);
    setReplacingDocumentId(documentKey);
    setDocumentError("");

    try {
      await uploadDocument({
        applicationId: application.id,
        type: document.type,
        file,
      });
      const refreshedDocuments = await listApplicationDocuments(application.id);
      setDocuments(refreshedDocuments);
    } catch (error) {
      setDocumentError(
        error instanceof Error ? error.message : "Failed to replace document.",
      );
    } finally {
      setReplacingDocumentId(null);
    }
  };

  const handlePaymentClick = () => {
    window.location.href = `/dashboard/student/payment?applicationId=${application.id}`;
  };

  const handleEditFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setEditFields((current) => {
      if (name === "iin" && value !== "" && !/^\d{0,12}$/.test(value)) {
        return current;
      }
      if (
        name === "preferredRoommate" &&
        value !== "" &&
        !/^\d{0,9}$/.test(value)
      ) {
        return current;
      }

      const next = { ...current, [name]: value };
      if (name === "applicantType" && value === "local") {
        next.passportNumber = "";
      }
      if (name === "level" && value === "NUFYP") {
        next.school = "CPS";
        next.major = "Foundation";
        next.yearOfStudy = "0";
      }
      if (name === "level" && value === "UG") {
        const allowed = ["SEDS", "SSH", "SMG", "NUSOM"];
        if (!allowed.includes(next.school)) next.school = "";
      }
      if (name === "level" && value === "MD (Medical Doctor)") {
        next.school = "NUSOM";
      }
      return next;
    });
  };

  const handleStartEdit = () => {
    if (isApproved) return;
    setEditFields(createEditFields(application));
    setEditError("");
    setEditSuccess("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditFields(createEditFields(application));
    setEditError("");
    setIsEditing(false);
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const stableYear = Number(editFields.yearOfStudy || application.year);
    const normalizedMajor =
      editFields.level === "NUFYP" ? "NUFYP" : editFields.major.trim();

    const payload: ApplicationPatchPayload = {
      applicant_type: editFields.applicantType,
      name_surname: editFields.nameSurname.trim(),
      fio: editFields.fio.trim(),
      birth_date: editFields.birthDate,
      iin: editFields.iin.trim(),
      school: editFields.school.trim(),
      level: editFields.level.trim(),
      passport_number:
        editFields.applicantType === "international"
          ? editFields.passportNumber.trim()
          : "",
      comments: editFields.comments.trim(),
      year: Number.isInteger(stableYear) ? stableYear : application.year,
      major: normalizedMajor || application.major,
      gender: editFields.gender || application.gender,
      room_preference: editFields.roomPreference.trim(),
      additional_info: updateAdditionalInfo(
        application.additional_info,
        editFields,
      ),
    };

    setIsSaving(true);
    setEditError("");
    setEditSuccess("");

    try {
      const response = await apiJson<unknown>(`/applications/${application.id}`, {
        method: "PATCH",
        jsonBody: payload,
      });
      const updatedApplication = normalizeUpdatedApplication(
        response,
        application,
        payload,
      );
      onApplicationUpdated(updatedApplication);
      setEditSuccess("Submission updated.");
      setIsEditing(false);
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update submission.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/78 shadow-[0_18px_42px_rgba(122,132,173,0.14)] backdrop-blur-xl">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/55"
        onClick={handleExpand}
      >

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9aa3b8]">
            Application #{application.id}
          </p>
          <h4 className="mt-2 text-lg font-semibold tracking-tight text-[#17172f]">
            {displayName || "Application"}
          </h4>
          <p className="mt-1 text-sm text-[#7d879b]">
            {info["School"] || application.major} · Submitted{" "}
            {formatDate(application.submitted_at)}
          </p>
        </div>


        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(application.status)}`}
          >
            {application.status.charAt(0).toUpperCase() +
              application.status.slice(1)}
          </span>
          {isPaid && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Paid
            </span>
          )}
          <span className="text-sm text-[#7d879b]">
            {expanded ? "Hide" : "Open"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/70 bg-[#f8faff] px-6 py-6">
                  {application.status === "approved" && (
                    <div className="mt-6 mb-8 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                      {isPaid ? (
                        <>
                          <p className="font-semibold">
                            Your application is approved and paid.
                          </p>
                          {assignedRoom && (
                        <p className="mt-1 text-green-800">
                          Your room number: {assignedRoom}
                        </p>
                      )}

                          <p className="mt-1">
                            Housing payment has been received and your place is
                            confirmed.
                            {paidAt ? ` Paid on ${formatDate(paidAt)}.` : ""}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">
                            Your application has been approved.
                          </p>
                          {assignedRoom && (
                        <p className="mt-1 text-green-800">
                          Your room number: {assignedRoom}
                        </p>
                      )}

                          <p className="mt-1">
                            You can now continue to the payment step to confirm
                            your housing placement.
                          </p>

                          <button
                            type="button"
                            onClick={handlePaymentClick}
                            className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#17172f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a4a]"
                          >
                            Make a payment
                          </button>
                        </>
                      )}
                    </div>
                  )}

          <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[#edf1f8] bg-white/80 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa3b8]">
                Application details
              </h5>
              {editError && (
                <p className="mt-1 text-sm text-red-700">{editError}</p>
              )}
              {editSuccess && (
                <p className="mt-1 text-sm text-green-700">{editSuccess}</p>
              )}
            </div>

            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-xl border border-[#dfe4f2] bg-white px-4 py-2 text-sm font-semibold text-[#17172f] transition hover:bg-[#f8faff] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form={editFormId}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-xl bg-[#17172f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2a4a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : application.status !== "approved" ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center justify-center rounded-xl bg-[#17172f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2a4a]"
              >
                Edit Submission
              </button>
            ) : null}
          </div>

          <form id={editFormId} onSubmit={handleSaveEdit}>
            <div className="grid gap-6 lg:grid-cols-2">

            <div className="space-y-3">

              <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa3b8]">
                Student information
              </h5>
              <InfoRow
                label="Applicant type"
                value={info["Applicant Type"] || application.applicant_type}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineSelectField
                    name="applicantType"
                    value={editFields.applicantType}
                    options={applicantTypeOptions}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow label="Student ID" value={info["Student ID"]} />
              <InfoRow
                label="Name surname"
                value={displayName ?? undefined}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    name="nameSurname"
                    value={editFields.nameSurname}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="ФИО"
                value={currentFio ?? undefined}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    name="fio"
                    value={editFields.fio}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Gender"
                value={info["Gender"] || application.gender}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineSelectField
                    name="gender"
                    value={editFields.gender}
                    options={genderOptions}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Phone"
                value={info["Phone"]}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    name="phone"
                    value={editFields.phone}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Date of birth"
                value={info["Date of Birth"]}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    type="date"
                    name="birthDate"
                    value={editFields.birthDate}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="ИИН"
                value={info["ИИН"] || application.iin}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    name="iin"
                    value={editFields.iin}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Passport"
                value={info["Passport"] || application.passport_number}
                forceVisible={
                  isEditing && editFields.applicantType === "international"
                }
              >
                {isEditing && editFields.applicantType === "international" ? (
                  <InlineTextField
                    name="passportNumber"
                    value={editFields.passportNumber}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
            </div>



            <div className="space-y-3">
              <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9aa3b8]">
                Academic information
              </h5>
              <InfoRow
                label="School"
                value={info["School"] || application.school}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineSelectField
                    name="school"
                    value={editFields.school}
                    options={schoolOptions}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Level"
                value={info["Level"] || application.level}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineSelectField
                    name="level"
                    value={editFields.level}
                    options={levelOptions}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Major"
                value={currentMajor ?? undefined}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    name="major"
                    value={editFields.major}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Year"
                value={currentYear ?? undefined}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    type="number"
                    name="yearOfStudy"
                    value={editFields.yearOfStudy}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              
              <InfoRow
                label="Apartment in Astana"
                value={info["Apartment in Astana"]}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineChoiceField
                    name="apartmentInAstana"
                    value={editFields.apartmentInAstana}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Parents work in Astana"
                value={info["Parents work in Astana"]}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineChoiceField
                    name="parentsWorkInAstana"
                    value={editFields.parentsWorkInAstana}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Astana resident"
                value={info["Astana resident"]}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineChoiceField
                    name="astanaResident"
                    value={editFields.astanaResident}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Preferred roommate"
                value={info["Preferred Roommate"]}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    name="preferredRoommate"
                    value={editFields.preferredRoommate}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
              <InfoRow
                label="Comments"
                value={info["Comments"] || application.comments}
                forceVisible={isEditing}
              >
                {isEditing ? (
                  <InlineTextField
                    name="comments"
                    value={editFields.comments}
                    onChange={handleEditFieldChange}
                  />
                ) : undefined}
              </InfoRow>
            </div>
            </div>
          </form>

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
            {documentError && (
              <p className="mt-3 text-sm text-red-700">{documentError}</p>
            )}
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
                    key={getDocumentKey(doc)}
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
                      <div className="flex flex-wrap justify-end gap-2">
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#dfe4f2] bg-white px-4 py-2 text-xs font-medium text-[#17172f] transition hover:bg-[#f8faff]">
                          {replacingDocumentId === getDocumentKey(doc)
                            ? "Replacing..."
                            : "Replace"}
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            disabled={replacingDocumentId === getDocumentKey(doc)}
                            onChange={(event) =>
                              handleReplaceDocument(doc, event)
                            }
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleOpenDocument(doc)}
                          className="rounded-full bg-[#17172f] px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5"
                        >
                          {openingDocumentId === getDocumentKey(doc)
                            ? "Opening..."
                            : "Open"}
                        </button>
                      </div>
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

export default function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      const apps = await apiJson<Application[]>("/applications/my", {
        method: "GET",
      });
      setApplications(Array.isArray(apps) ? apps : []);
      setError("");
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplications();

    const handleWindowFocus = () => {
      void fetchApplications();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchApplications();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleApplicationUpdated = (updatedApplication: Application) => {
    setApplications((current) =>
      current.map((application) =>
        application.id === updatedApplication.id
          ? updatedApplication
          : application,
      ),
    );
  };

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-[#17172f]">
            Applications overview
          </h3>
          <p className="text-sm font-medium text-[#5e6578]">
            Click on any application to expand its details.
          </p>
        </div>
        <div className="rounded-full bg-[#17172f] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_30px_rgba(23,23,47,0.18)]">
          {applications.length} total
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-[30px] border border-white/70 bg-white/78 px-6 py-12 text-center shadow-[0_18px_42px_rgba(122,132,173,0.14)]">
          <p className="text-lg font-medium text-[#17172f]">
            No applications yet
          </p>
          <p className="mt-2 text-sm text-[#7d879b]">
            Once you submit a housing application, it will appear here.
          </p>
        </div>
      ) : (
        applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onApplicationUpdated={handleApplicationUpdated}
          />
        ))
      )}
    </div>
  );
}
