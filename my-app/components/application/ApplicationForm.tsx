"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { apiJson, getStoredSession } from "@/lib/auth";
import { uploadDocument } from "@/lib/documents";

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
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/75 bg-white/80 p-5 shadow-[0_16px_40px_rgba(122,132,173,0.12)] md:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold tracking-tight text-[#17172f]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm leading-6 text-[#7d879b]">{description}</p>
        )}
      </div>
      {children}
    </div>
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
        className="block w-full rounded-2xl border border-[#e5e9f4] bg-white/90 px-4 py-3 text-sm text-[#17172f] outline-none transition focus:border-[#bfc8e6] focus:bg-white focus:ring-4 focus:ring-[#dfe6fb] disabled:cursor-not-allowed disabled:bg-[#f4f6fb]"
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
                  ? "border-[#17172f] bg-[#17172f] text-white shadow-[0_12px_28px_rgba(23,23,47,0.18)]"
                  : "border-white/80 bg-white/85 text-[#5e6578] shadow-[0_8px_24px_rgba(122,132,173,0.08)]"
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
    <div className="rounded-[24px] border border-[#e6ebf6] bg-[#f9fbff] p-4">
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
        className="mt-3 block w-full rounded-2xl border border-dashed border-[#cfd7ec] bg-white px-4 py-3 text-sm text-[#5e6578] file:mr-3 file:rounded-full file:border-0 file:bg-[#17172f] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
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
      <Card className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-white/75 bg-white/80 px-6 py-12 text-center shadow-[0_16px_40px_rgba(122,132,173,0.12)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#17172f] text-3xl text-white">
            ✓
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
    <div className="relative overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_top_left,_rgba(202,206,251,0.95),_rgba(240,242,248,0.72)_38%,_rgba(237,240,248,0.9)_70%,_rgba(213,217,243,0.95)_100%)] p-4 md:p-8">
      <Card className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#5e6578]">
              Housing workflow
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#17172f] md:text-4xl">
              Submit your housing application
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7d879b]">
              Complete your profile, upload required documents, and send your
              application in one clean flow inspired by the new portal style.
            </p>
          </div>
          <div className="rounded-full bg-[#17172f] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(23,23,47,0.18)]">
            Student form
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
            description="Add your identity and academic details. Required fields are marked by the browser validation."
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
                  label="ФИО (Cyrillic only)"
                  required
                  value={formData.fullNameLocal}
                  onChange={handleChange}
                  placeholder="ФИО"
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
            description="Upload PDF files only. Keep the original labels so your backend mapping remains unchanged."
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
                    label="Certificate of no real estate in Astana — yourself"
                    helperText="Issued for Astana only. From eGov. PDF only."
                  />
                  <FileUploadField
                    name="propertyCertificateMother"
                    required
                    files={fileUploads.propertyCertificateMother}
                    onChange={handleFileChange}
                    label="Certificate of no real estate in Astana — mother"
                    helperText="Upload eGov certificate or an empty file where applicable."
                  />
                  <FileUploadField
                    name="propertyCertificateFather"
                    required
                    files={fileUploads.propertyCertificateFather}
                    onChange={handleFileChange}
                    label="Certificate of no real estate in Astana — father"
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
                    label="Work certificate — mother"
                    helperText="Issued not more than 10 days before the application."
                  />
                  <FileUploadField
                    name="workCertificateFather"
                    required
                    files={fileUploads.workCertificateFather}
                    onChange={handleFileChange}
                    label="Work certificate — father"
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
                    label="Registration report in Astana — yourself"
                    helperText="No screenshots. Use the official eGov report."
                  />
                  <FileUploadField
                    name="residenceProofMother"
                    required
                    files={fileUploads.residenceProofMother}
                    onChange={handleFileChange}
                    label="Registration report in Astana — mother"
                    helperText="Upload the official report or empty file where applicable."
                  />
                  <FileUploadField
                    name="residenceProofFather"
                    required
                    files={fileUploads.residenceProofFather}
                    onChange={handleFileChange}
                    label="Registration report in Astana — father"
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
                  className="block w-full rounded-2xl border border-[#e5e9f4] bg-white/90 px-4 py-3 text-sm text-[#17172f] outline-none transition placeholder:text-[#9aa3b8] focus:border-[#bfc8e6] focus:bg-white focus:ring-4 focus:ring-[#dfe6fb]"
                />
              </div>
            </div>
          </SectionCard>

          <div className="flex flex-col gap-4 rounded-[28px] border border-white/75 bg-white/80 p-5 shadow-[0_16px_40px_rgba(122,132,173,0.12)] md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[#7d879b]">
              Review your form carefully before submitting. The new design keeps
              the original validation and upload behavior from your existing
              component.
            </p>
            <div className="w-full md:w-[240px]">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit application"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
