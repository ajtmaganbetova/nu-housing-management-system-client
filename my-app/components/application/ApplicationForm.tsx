"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { apiJson, getStoredSession } from "@/lib/auth";
import { uploadDocument } from "@/lib/documents";
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Info,
  Users,
  UserRound,
  UploadCloud,
} from "lucide-react";
import React from "react";

type ApplicantType = "local" | "international";
type BinaryChoice = "" | "yes" | "no";
type ApplicationStatus = "idle" | "submitted" | "error";

const levelOptions = [
  "NUFYP",
  "UG",
  "MS",
  "PhD",
  "MD (Medical Doctor)",
] as const;

const yearOptions = ["0", "1", "2", "3", "4", "5", "6", "7"] as const;
const ugSchoolOptions = ["SEDS", "SSH", "SMG", "NUSOM"] as const;
const allSchoolOptions = [
  "CPS",
  "SEDS",
  "SSH",
  "SMG",
  "NUSOM",
  "GSE",
  "GSB",
] as const;

type UploadFieldName =
  | "propertyCertificateSelf"
  | "propertyCertificateMother"
  | "propertyCertificateFather"
  | "workCertificateMother"
  | "workCertificateFather"
  | "residenceProofSelf"
  | "residenceProofMother"
  | "residenceProofFather"
  | "additionalDocuments";

interface FileUploadProps {
  name: UploadFieldName;
  label: string;
  helperText?: string;
  required?: boolean;
  files: File[];
  onChange: (name: UploadFieldName, files: File[]) => void;
}

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#eceff6] bg-white p-5 shadow-[0_14px_34px_rgba(122,132,173,0.08)] md:p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4f3ff] text-[#6f63ff]">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[#17172f]">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm leading-6 text-[#7d879b]">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function SelectField({
  id,
  name,
  label,
  value,
  required = false,
  options,
  placeholder,
  onChange,
  disabled = false,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  required?: boolean;
  options: readonly string[];
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#5e6578]">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        disabled={disabled}
        className="block w-full rounded-2xl border border-[#e5e9f4] bg-[#fcfdff] px-4 py-3 text-sm text-[#17172f] outline-none transition focus:border-[#c7c2ff] focus:bg-white focus:ring-4 focus:ring-[#ece9ff] disabled:cursor-not-allowed disabled:bg-[#f4f6fb]"
      >
        <option value="">{placeholder ?? "Select an option"}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function RadioGroup({
  label,
  name,
  value,
  required = false,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  options: readonly string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#5e6578]">{label}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const normalized = option.toLowerCase();
          const active = value === normalized;

          return (
            <label
              key={option}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-[#6f63ff] bg-[#6f63ff] text-white shadow-[0_12px_28px_rgba(111,99,255,0.20)]"
                  : "border-[#e7eaf4] bg-white text-[#5e6578] hover:border-[#d8dcf0]"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={normalized}
                checked={active}
                required={required}
                onChange={onChange}
                className="sr-only"
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function FileUploadField({
  name,
  label,
  helperText,
  required = false,
  files,
  onChange,
}: FileUploadProps) {
  return (
    <div className="rounded-[24px] border border-[#e6ebf6] bg-[#fafbff] p-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[#17172f]"
      >
        {label}
      </label>

      {helperText && (
        <p className="mt-1 text-xs leading-5 text-[#7d879b]">{helperText}</p>
      )}

      <input
        id={name}
        name={name}
        type="file"
        multiple
        required={required}
        accept=".pdf"
        onChange={(e) => onChange(name, Array.from(e.target.files ?? []))}
        className="mt-3 block w-full rounded-2xl border border-dashed border-[#cfd7ec] bg-white px-4 py-3 text-sm text-[#5e6578] file:mr-3 file:rounded-full file:border-0 file:bg-[#6f63ff] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
      />

      <p className="mt-3 text-xs text-[#7d879b]">
        <span className="font-semibold text-[#17172f]">Selected:</span>{" "}
        {files.length > 0 ? files.map((file) => file.name).join(", ") : "None"}
      </p>
    </div>
  );
}

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus>("idle");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const storedUser = getStoredSession().user ?? {};

  const [formData, setFormData] = useState({
    applicantType: "local" as ApplicantType,
    studentId: storedUser.nu_id || "",
    fullName: "",
    fullNameLocal: "",
    gender: "",
    phone: storedUser.phone || "",
    dateOfBirth: "",
    iin: "",
    school: "",
    level: "",
    yearOfStudy: "",
    major: "",
    passportNumber: "",
    hasApartmentInAstana: "" as BinaryChoice,
    parentsWorkInAstana: "" as BinaryChoice,
    isAstanaResident: "" as BinaryChoice,
    preferredRoommate: "",
    comments: "",
  });

  // Добавляем специфические казахские буквы к стандартной кириллице
  const kazakhRegex = /^[а-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ\s-]+$/;

  const handleChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Если строка пустая или соответствует расширенному алфавиту — обновляем стейт
    if (value === "" || kazakhRegex.test(value)) {
      setFormData({ ...formData, fullNameLocal: value });
    }
  };

  const [fileUploads, setFileUploads] = useState<
    Record<UploadFieldName, File[]>
  >({
    propertyCertificateSelf: [],
    propertyCertificateMother: [],
    propertyCertificateFather: [],
    workCertificateMother: [],
    workCertificateFather: [],
    residenceProofSelf: [],
    residenceProofMother: [],
    residenceProofFather: [],
    additionalDocuments: [],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((current) => {
      if (name === "fullName" && value !== "" && !/^[a-zA-Z\s]*$/.test(value))
        return current;
      if (
        name === "fullNameLocal" &&
        value !== "" &&
        !/^[а-яА-ЯёЁ\s-]*$/.test(value)
      )
        return current;
      if (name === "studentId" && value !== "" && !/^\d{0,9}$/.test(value))
        return current;
      if (name === "iin" && value !== "" && !/^\d{0,12}$/.test(value))
        return current;
      if (
        name === "preferredRoommate" &&
        value !== "" &&
        !/^\d{0,9}$/.test(value)
      )
        return current;

      const next = { ...current, [name]: value };

      if (name === "applicantType") {
        if (value === "local") next.passportNumber = "";
        else next.fullNameLocal = "";
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

  const handleFileChange = (name: UploadFieldName, files: File[]) => {
    setFileUploads((current) => ({ ...current, [name]: files }));
  };

  // const criteria = [
  //   "Students with registered Summer courses (Registrar verified)",
  //   "Confirmed internships (CAC verified)",
  //   "Paid Research Assistants (Signed contract with NU Schools)",
  //   "Graduation Volunteers (DSS confirmed)",
  //   "Military Training participants (DSS confirmed)",
  // ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.studentId.length !== 9) {
      setError("Student ID must be exactly 9 digits.");
      return;
    }

    if (formData.applicantType === "local" && formData.iin.length !== 12) {
      setError("IIN must be exactly 12 digits.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (!storedUser) {
        setError("Please log in first");
        setApplicationStatus("error");
        return;
      }

      const additionalInfo = [
        `Applicant Type: ${formData.applicantType}`,
        `Student ID: ${formData.studentId}`,
        `Name Surname: ${formData.fullName}`,
        formData.applicantType === "local"
          ? `ФИО: ${formData.fullNameLocal}`
          : null,
        `Gender: ${formData.gender}`,
        `Phone: ${formData.phone}`,
        `Date of Birth: ${formData.dateOfBirth}`,
        `ИИН: ${formData.iin}`,
        `School: ${formData.school}`,
        `Level: ${formData.level}`,
        `Year of Study: ${formData.yearOfStudy}`,
        `Major: ${formData.level === "NUFYP" ? "NUFYP" : formData.major}`,
        formData.applicantType === "international"
          ? `Passport: ${formData.passportNumber}`
          : null,
        `Apartment in Astana: ${formData.hasApartmentInAstana}`,
        `Parents work in Astana: ${formData.parentsWorkInAstana}`,
        `Astana resident: ${formData.isAstanaResident}`,
        formData.preferredRoommate
          ? `Preferred Roommate: ${formData.preferredRoommate}`
          : null,
        formData.comments ? `Comments: ${formData.comments}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const data = await apiJson<{ application_id?: number; error?: string }>(
        "/applications/submit",
        {
          method: "POST",
          jsonBody: {
            year: new Date().getFullYear(),
            major: formData.level === "NUFYP" ? "NUFYP" : formData.major,
            gender: formData.gender || "Other",
            additional_info: additionalInfo,
          },
        },
      );

      if (data?.application_id) {
        const appId = data.application_id;

        const uploadFile = async (file: File, docType: string) => {
          await uploadDocument({
            applicationId: appId,
            type: docType,
            file,
          });
        };

        const uploadTasks: Promise<void>[] = [];

        if (formData.applicantType === "international") {
          fileUploads.propertyCertificateSelf.forEach((f) =>
            uploadTasks.push(uploadFile(f, "passport_scan")),
          );
          fileUploads.additionalDocuments.forEach((f) =>
            uploadTasks.push(uploadFile(f, "additional")),
          );
        } else {
          fileUploads.propertyCertificateSelf.forEach((f) =>
            uploadTasks.push(uploadFile(f, "property_self")),
          );
          fileUploads.propertyCertificateMother.forEach((f) =>
            uploadTasks.push(uploadFile(f, "property_mother")),
          );
          fileUploads.propertyCertificateFather.forEach((f) =>
            uploadTasks.push(uploadFile(f, "property_father")),
          );
          fileUploads.workCertificateMother.forEach((f) =>
            uploadTasks.push(uploadFile(f, "work_mother")),
          );
          fileUploads.workCertificateFather.forEach((f) =>
            uploadTasks.push(uploadFile(f, "work_father")),
          );
          fileUploads.residenceProofSelf.forEach((f) =>
            uploadTasks.push(uploadFile(f, "residence_self")),
          );
          fileUploads.residenceProofMother.forEach((f) =>
            uploadTasks.push(uploadFile(f, "residence_mother")),
          );
          fileUploads.residenceProofFather.forEach((f) =>
            uploadTasks.push(uploadFile(f, "residence_father")),
          );
          fileUploads.additionalDocuments.forEach((f) =>
            uploadTasks.push(uploadFile(f, "additional")),
          );
        }

        await Promise.all(uploadTasks);
        setApplicationStatus("submitted");
      } else {
        throw new Error(data?.error || "Unknown error");
      }
    } catch (submitError) {
      setError(
        "Error: " +
          (submitError instanceof Error
            ? submitError.message
            : "Unknown error"),
      );
      setApplicationStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationStatus === "submitted") {
    return (
      <Card className="mx-auto max-w-5xl">
        <div className="rounded-[28px] border border-[#eceff6] bg-white px-6 py-12 text-center shadow-[0_16px_40px_rgba(122,132,173,0.10)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#6f63ff] text-white">
            <CheckCircle2 size={34} />
          </div>

          <h3 className="mt-6 text-3xl font-semibold tracking-tight text-[#17172f]">
            Application submitted
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#7d879b]">
            Your housing application was sent successfully. You can return to
            the dashboard later to track review status and updates.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="mb-10 space-y-6">
      {/* 1. Hero Welcome & Deadline */}
      <div className="rounded-[32px] bg-indigo-50/50 border border-indigo-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Calendar size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#17172f]">
                Fall 2025 Dormitory Application
              </h2>
              <p className="mt-1 text-[#7d879b] text-sm max-w-xl">
                Continuing UG, NUFYP, GrM, and DocMed students. Please ensure
                your data is accurate to avoid automatic invalidation.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 border border-indigo-200 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-indigo-600 leading-none mb-1">
                  Application Deadline
                </p>
                <p className="text-lg font-black text-[#17172f]">
                  June 27 • 23:59
                </p>
              </div>
            </div>
            <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
              <ShieldAlert size={12} /> No late submissions or editing accepted.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 2. Eligibility & Strict Rules */}
        <div className="rounded-[28px] border border-[#eceff6] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-[#6f63ff]" />
            <h3 className="font-bold text-[#17172f]">
              Eligibility Requirements
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                Non-Astana Residents
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-[#7d879b] flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500" />{" "}
                  International Students
                </li>
                <li className="text-sm text-[#7d879b] flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500" /> No
                  property/registration in Astana
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="flex gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase">
                    Important for Astana Residents
                  </p>
                  <p className="text-[12px] text-amber-700 leading-relaxed mt-1">
                    Do not apply now. Astana residents (including those whose
                    parents work in Astana) will be rejected automatically. Wait
                    for the September announcement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-red-50 p-4 border border-red-100">
            <div className="flex gap-3">
              <ShieldAlert size={18} className="text-red-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-red-900 uppercase tracking-tight">
                  Academic Integrity
                </p>
                <p className="text-[12px] text-red-800 leading-relaxed">
                  False or misleading info results in a{" "}
                  <strong>permanent ban</strong> from university housing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FAQ & Documentation Helper */}
        <div className="rounded-[28px] border border-[#eceff6] bg-[#fbfcff] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#6f63ff]" />
            <h3 className="font-bold text-[#17172f]">
              Document Checklist (FAQ)
            </h3>
          </div>

          <div className="space-y-3">
            <div className="group p-4 rounded-2xl bg-white border border-[#eceff6] hover:border-indigo-200 transition-colors">
              <p className="text-xs font-bold text-[#17172f]">
                Unemployed Parents
              </p>
              <p className="text-[12px] text-[#7d879b] mt-1 italic">
                Submit Egov/ЕНПФ registration or pension report (6+ months).
              </p>
            </div>

            <div className="group p-4 rounded-2xl bg-white border border-[#eceff6] hover:border-indigo-200 transition-colors">
              <p className="text-xs font-bold text-[#17172f]">
                Retired Parents
              </p>
              <p className="text-[12px] text-[#7d879b] mt-1 italic">
                Submit Retirement passport/certificate (пенсионное
                удостоверение).
              </p>
            </div>

                <div className="group p-4 rounded-2xl bg-white border border-[#eceff6] hover:border-indigo-200 transition-colors">
                  <p className="text-xs font-bold text-[#17172f]">
                    Missing Parent Information
                  </p>
                  <p className="text-[12px] text-[#7d879b] mt-1 italic">
                    If information or documents for one of your parents are unavailable, submit a blank file in the corresponding section.
                  </p>
                </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex gap-3">
                <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-indigo-900 uppercase">
                    Office Hours
                  </p>
                  <p className="text-[12px] text-indigo-800">
                    10:00 - 12:00 & 14:00 - 16:00 (Mon-Fri)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-[#98a2b3] text-center leading-tight">
            DSS will not provide advance notifications for incomplete
            applications. <br />
            <strong>Check-in dates will follow the Academic Calendar.</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <SectionCard
          title="Student information"
          description="Add your identity and academic details."
          icon={<UserRound size={20} />}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <RadioGroup
              label="Applicant type"
              name="applicantType"
              value={formData.applicantType}
              required
              options={["Local", "International"]}
              onChange={handleChange}
            />

            <Input
              id="studentId"
              name="studentId"
              type="text"
              label="Student ID"
              required
              value={formData.studentId}
              onChange={handleChange}
              placeholder="202400001"
              maxLength={9}
              readOnly={!!storedUser.nu_id}
              className={
                storedUser.nu_id ? "cursor-not-allowed bg-[#f4f6fb]" : ""
              }
            />

            <Input
              id="fullName"
              name="fullName"
              type="text"
              label="Name surname (English only)"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
            />

            {formData.applicantType === "local" && (
              <Input
                id="fullNameLocal"
                name="fullNameLocal"
                type="text"
                // Updated label to be more accurate
                label="ФИО (Cyrillic/Kazakh characters)"
                required
                value={formData.fullNameLocal}
                onChange={handleChangeLocal}
                placeholder="Айтмаганбетова Дильназ Талгатқызы"
                // Native HTML5 validation pattern for Cyrillic + Kazakh extensions
                pattern="^[А-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ\s-]+$"
                title="Please use Cyrillic or Kazakh alphabet characters only"
              />
            )}

            <RadioGroup
              label="Gender"
              name="gender"
              value={formData.gender}
              required
              options={["Male", "Female"]}
              onChange={handleChange}
            />

            <Input
              id="phone"
              name="phone"
              type="text"
              label="Phone number"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 700 123 4567"
              readOnly={!!storedUser.phone}
              className={
                storedUser.phone ? "cursor-not-allowed bg-[#f4f6fb]" : ""
              }
            />

            {formData.applicantType === "international" && (
              <Input
                id="passportNumber"
                name="passportNumber"
                type="text"
                label="Passport number"
                required
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="Passport number"
              />
            )}

            <SelectField
              id="level"
              name="level"
              label="Level of study"
              value={formData.level}
              required
              options={levelOptions}
              placeholder="Select level"
              onChange={handleChange}
            />

            <SelectField
              id="yearOfStudy"
              name="yearOfStudy"
              label="Year of study"
              value={formData.yearOfStudy}
              required
              options={yearOptions}
              placeholder="Select year"
              onChange={handleChange}
              disabled={formData.level === "NUFYP"}
            />

            <SelectField
              id="school"
              name="school"
              label="School"
              value={formData.school}
              required
              options={
                formData.level === "UG"
                  ? ugSchoolOptions
                  : formData.level === "MD (Medical Doctor)"
                    ? (["NUSOM"] as const)
                    : allSchoolOptions
              }
              placeholder="Select school"
              onChange={handleChange}
              disabled={
                formData.level === "NUFYP" ||
                formData.level === "MD (Medical Doctor)"
              }
            />

            {formData.level !== "NUFYP" && (
              <div className="md:col-span-2">
                <Input
                  id="major"
                  name="major"
                  type="text"
                  label="Major"
                  required
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="Program name"
                />
              </div>
            )}

            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              label="Date of birth"
              required
              min="1990-01-01"
              max="2030-12-31"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            {formData.applicantType === "local" && (
              <Input
                id="iin"
                name="iin"
                type="text"
                label="ИИН"
                required
                value={formData.iin}
                onChange={handleChange}
                placeholder="12 digits"
                maxLength={12}
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Required documents"
          description="Upload PDF files only."
          icon={<UploadCloud size={20} />}
        >
          <div className="space-y-4">
            {formData.applicantType === "international" ? (
              <>
                <FileUploadField
                  name="propertyCertificateSelf"
                  required
                  files={fileUploads.propertyCertificateSelf}
                  onChange={handleFileChange}
                  label="Passport scan"
                  helperText="Upload a clear scan of your passport. PDF format preferred."
                />
                <FileUploadField
                  name="additionalDocuments"
                  files={fileUploads.additionalDocuments}
                  onChange={handleFileChange}
                  label="Additional supporting documents"
                  helperText="Optional files that support your application."
                />
              </>
            ) : (
              <>
                <RadioGroup
                  label="Do you or your parents have an apartment in Astana city?"
                  name="hasApartmentInAstana"
                  value={formData.hasApartmentInAstana}
                  required
                  options={["Yes", "No"]}
                  onChange={handleChange}
                />

                <FileUploadField
                  name="propertyCertificateSelf"
                  required
                  files={fileUploads.propertyCertificateSelf}
                  onChange={handleFileChange}
                  label="Certificate of no real estate in Astana (yourself)"
                  helperText="Issued for Astana only. From eGov. PDF only."
                />

                <FileUploadField
                  name="propertyCertificateMother"
                  required
                  files={fileUploads.propertyCertificateMother}
                  onChange={handleFileChange}
                  label="Certificate of no real estate in Astana (mother)"
                  helperText="Upload eGov certificate or an empty file where applicable."
                />

                <FileUploadField
                  name="propertyCertificateFather"
                  required
                  files={fileUploads.propertyCertificateFather}
                  onChange={handleFileChange}
                  label="Certificate of no real estate in Astana (father)"
                  helperText="Upload eGov certificate or an empty file where applicable."
                />

                <RadioGroup
                  label="Do your parents work in Astana city?"
                  name="parentsWorkInAstana"
                  value={formData.parentsWorkInAstana}
                  required
                  options={["Yes", "No"]}
                  onChange={handleChange}
                />

                <FileUploadField
                  name="workCertificateMother"
                  required
                  files={fileUploads.workCertificateMother}
                  onChange={handleFileChange}
                  label="Work certificate (mother)"
                  helperText="Issued not more than 10 days before the application."
                />

                <FileUploadField
                  name="workCertificateFather"
                  required
                  files={fileUploads.workCertificateFather}
                  onChange={handleFileChange}
                  label="Work certificate (father)"
                  helperText="Issued not more than 10 days before the application."
                />

                <RadioGroup
                  label="Do you have registration (прописка) in Astana?"
                  name="isAstanaResident"
                  value={formData.isAstanaResident}
                  required
                  options={["Yes", "No"]}
                  onChange={handleChange}
                />

                <FileUploadField
                  name="residenceProofSelf"
                  required
                  files={fileUploads.residenceProofSelf}
                  onChange={handleFileChange}
                  label="Registration report in Astana (yourself)"
                  helperText="No screenshots. Use the official eGov report."
                />

                <FileUploadField
                  name="residenceProofMother"
                  required
                  files={fileUploads.residenceProofMother}
                  onChange={handleFileChange}
                  label="Registration report in Astana (mother)"
                  helperText="Upload the official report or empty file where applicable."
                />

                <FileUploadField
                  name="residenceProofFather"
                  required
                  files={fileUploads.residenceProofFather}
                  onChange={handleFileChange}
                  label="Registration report in Astana (father)"
                  helperText="Upload the official report or empty file where applicable."
                />

                <FileUploadField
                  name="additionalDocuments"
                  files={fileUploads.additionalDocuments}
                  onChange={handleFileChange}
                  label="Additional documents"
                  helperText="Divorce, death certificates, or extra evidence for the review committee."
                />
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Additional preferences"
          description="Optional details that can help with planning your accommodation."
          icon={<FileText size={20} />}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              id="preferredRoommate"
              name="preferredRoommate"
              type="text"
              label="Preferred roommate"
              value={formData.preferredRoommate}
              onChange={handleChange}
              placeholder="Student ID"
              maxLength={9}
            />

            <div className="md:col-span-2 space-y-2">
              <label
                htmlFor="comments"
                className="block text-sm font-medium text-[#5e6578]"
              >
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={5}
                placeholder="Add anything the housing office should know."
                className="block w-full rounded-2xl border border-[#e5e9f4] bg-[#fcfdff] px-4 py-3 text-sm text-[#17172f] outline-none transition placeholder:text-[#9aa3b8] focus:border-[#c7c2ff] focus:bg-white focus:ring-4 focus:ring-[#ece9ff]"
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex flex-col gap-4 rounded-[28px] border border-[#eceff6] bg-white p-5 shadow-[0_14px_34px_rgba(122,132,173,0.08)] md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-3 max-w-2xl cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[#7d879b]"
            />
            <span className="text-sm leading-6 text-[#7d879b]">
              I confirm that the information provided is accurate to the best of
              my knowledge, and I agree to pay according to the option I have
              chosen upon submitting this application.
            </span>
          </label>

          <div className="w-full md:w-[250px]">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit application"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
