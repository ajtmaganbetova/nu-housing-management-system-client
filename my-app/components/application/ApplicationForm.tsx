"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

type ApplicationStatus = "idle" | "submitted" | "error";
type ApplicantType = "local" | "international";
type BinaryChoice = "yes" | "no" | "";

const allSchoolOptions = ["CPS", "SEDS", "SSH", "SMG", "NUSOM", "GSB", "GSPP", "GSE"] as const;
const ugSchoolOptions = ["SEDS", "SSH", "SMG", "NUSOM"] as const;
const levelOptions = ["NUFYP", "UG", "GrM", "MD (Medical Doctor)", "Other"] as const;
const yearOptions = ["0","1", "2", "3", "4", "5+"] as const;

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

function SelectField({
  id, name, label, value, required = false, options, placeholder, onChange, disabled = false,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  required?: boolean;
  options: readonly string[];
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        id={id} name={name} required={required} value={value} onChange={onChange} disabled={disabled}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function RadioGroup({
  label, name, value, required = false, options, onChange,
}: {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  options: readonly string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option} className="inline-flex items-center gap-2 text-sm text-gray-900">
            <input
              type="radio" name={name} value={option.toLowerCase()}
              checked={value === option.toLowerCase()} required={required} onChange={onChange}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FileUploadField({ name, label, helperText, required = false, files, onChange }: FileUploadProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {helperText && <p className="text-xs text-gray-500 mb-2">{helperText}</p>}
      <input
        id={name} name={name} type="file" multiple required={required}
        accept=".pdf"
        onChange={(e) => onChange(name, Array.from(e.target.files ?? []))}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
      />
      <div className="mt-2 text-xs text-gray-600">
        <span className="font-medium">Selected:</span>{" "}
        {files.length > 0 ? files.map((f) => f.name).join(", ") : "None"}
      </div>
    </div>
  );
}

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>("idle");
  const [error, setError] = useState("");

  const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

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

  const [fileUploads, setFileUploads] = useState<Record<UploadFieldName, File[]>>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((current) => {
      if (name === "fullName" && value !== "" && !/^[a-zA-Z\s]*$/.test(value)) return current;
      if (name === "fullNameLocal" && value !== "" && !/^[а-яА-ЯёЁ\s-]*$/.test(value)) return current;
      if (name === "studentId" && value !== "" && !/^\d{0,9}$/.test(value)) return current;
      if (name === "iin" && value !== "" && !/^\d{0,12}$/.test(value)) return current;
      if (name === "preferredRoommate" && value !== "" && !/^\d{0,9}$/.test(value)) return current;

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
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in first");
        setApplicationStatus("error");
        return;
      }

      const additionalInfo = [
        `Applicant Type: ${formData.applicantType}`,
        `Student ID: ${formData.studentId}`,
        `Name Surname: ${formData.fullName}`,
        formData.applicantType === "local" ? `ФИО: ${formData.fullNameLocal}` : null,
        `Gender: ${formData.gender}`,
        `Phone: ${formData.phone}`,
        `Date of Birth: ${formData.dateOfBirth}`,
        `ИИН: ${formData.iin}`,
        `School: ${formData.school}`,
        `Level: ${formData.level}`,
        `Year of Study: ${formData.yearOfStudy}`,
        `Major: ${formData.level === "NUFYP" ? "NUFYP" : formData.major}`,
        formData.applicantType === "international" ? `Passport: ${formData.passportNumber}` : null,
        `Apartment in Astana: ${formData.hasApartmentInAstana}`,
        `Parents work in Astana: ${formData.parentsWorkInAstana}`,
        `Astana resident: ${formData.isAstanaResident}`,
        formData.preferredRoommate ? `Preferred Roommate: ${formData.preferredRoommate}` : null,
        formData.comments ? `Comments: ${formData.comments}` : null,
      ].filter(Boolean).join("\n");

      const response = await fetch("http://localhost:8080/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year: new Date().getFullYear(),
          major: formData.level === "NUFYP" ? "NUFYP" : formData.major,
          gender: formData.gender || "Other",
          additional_info: additionalInfo,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || `HTTP error! status: ${response.status}`);
      }

      if (data?.application_id) {
        const appId = data.application_id;
        const uploadFile = async (file: File, docType: string) => {
          const uploadData = new FormData();
          uploadData.append("application_id", String(appId));
          uploadData.append("type", docType);
          uploadData.append("file", file);
          await fetch("http://localhost:8080/documents/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: uploadData,
          });
        };

        const uploadTasks: Promise<void>[] = [];
        if (formData.applicantType === "international") {
          fileUploads.propertyCertificateSelf.forEach(f => uploadTasks.push(uploadFile(f, "passport_scan")));
          fileUploads.additionalDocuments.forEach(f => uploadTasks.push(uploadFile(f, "additional")));
        } else {
          fileUploads.propertyCertificateSelf.forEach(f => uploadTasks.push(uploadFile(f, "property_self")));
          fileUploads.propertyCertificateMother.forEach(f => uploadTasks.push(uploadFile(f, "property_mother")));
          fileUploads.propertyCertificateFather.forEach(f => uploadTasks.push(uploadFile(f, "property_father")));
          fileUploads.workCertificateMother.forEach(f => uploadTasks.push(uploadFile(f, "work_mother")));
          fileUploads.workCertificateFather.forEach(f => uploadTasks.push(uploadFile(f, "work_father")));
          fileUploads.residenceProofSelf.forEach(f => uploadTasks.push(uploadFile(f, "residence_self")));
          fileUploads.residenceProofMother.forEach(f => uploadTasks.push(uploadFile(f, "residence_mother")));
          fileUploads.residenceProofFather.forEach(f => uploadTasks.push(uploadFile(f, "residence_father")));
          fileUploads.additionalDocuments.forEach(f => uploadTasks.push(uploadFile(f, "additional")));
        }

        await Promise.all(uploadTasks);
        setApplicationStatus("submitted");
      } else {
        throw new Error(data?.error || "Unknown error");
      }
    } catch (submitError) {
      setError("Error: " + (submitError instanceof Error ? submitError.message : "Unknown error"));
      setApplicationStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationStatus === "submitted") {
    return (
      <Card className="max-w-4xl w-full">
        <div className="py-8 text-center">
          <div className="mb-4 text-6xl text-green-600">✓</div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900">Application Submitted!</h3>
          <p className="mb-4 text-gray-600">Your housing application has been submitted successfully.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Housing Application</h2>
        <p className="mt-2 text-gray-600">Submit your application for university housing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Student Information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <RadioGroup label="Applicant Type *" name="applicantType" value={formData.applicantType} required options={["Local", "International"]} onChange={handleChange} />

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">1. Student ID * <span className="text-xs text-gray-500">(9 digits)</span></label>
              <Input id="studentId" name="studentId" type="text" required value={formData.studentId} onChange={handleChange} placeholder="202400001" maxLength={9} readOnly={!!storedUser.nu_id} className={storedUser.nu_id ? "bg-gray-100 cursor-not-allowed" : ""} />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">2. Name Surname (English only) *</label>
              <Input id="fullName" name="fullName" type="text" required value={formData.fullName} onChange={handleChange} placeholder="" />
            </div>

            {formData.applicantType === "local" && (
              <div>
                <label htmlFor="fullNameLocal" className="block text-sm font-medium text-gray-700 mb-1">ФИО (Cyrillic only) *</label>
                <Input id="fullNameLocal" name="fullNameLocal" type="text" required value={formData.fullNameLocal} placeholder="" onChange={handleChange} />
              </div>
            )}

            <RadioGroup label="3. Gender *" name="gender" value={formData.gender} required options={["Male", "Female"]} onChange={handleChange} />

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">4. Phone Number *</label>
              <Input id="phone" name="phone" type="text" required value={formData.phone} onChange={handleChange} placeholder="e.g. +7 700 123 4567" readOnly={!!storedUser.phone} className={storedUser.phone ? "bg-gray-100 cursor-not-allowed" : ""} />
            </div>

            {formData.applicantType === "international" && (
              <div>
                <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-1">5. Passport Number *</label>
                <Input id="passportNumber" name="passportNumber" type="text" required value={formData.passportNumber} onChange={handleChange} placeholder="Passport number" />
              </div>
            )}

            <SelectField id="level" name="level" label="6. Level of Study *" value={formData.level} required options={levelOptions} placeholder="Select Level" onChange={handleChange} />

            <SelectField id="yearOfStudy" name="yearOfStudy" label="7. Year of Study *" value={formData.yearOfStudy} required options={yearOptions} placeholder="Select Year" onChange={handleChange} disabled={formData.level === "NUFYP"} />

            <SelectField id="school" name="school" label="8. School *" value={formData.school} required options={formData.level === "UG" ? ugSchoolOptions : formData.level === "MD (Medical Doctor)" ? (["NUSOM"] as const) : allSchoolOptions} placeholder="Select School" onChange={handleChange} disabled={formData.level === "NUFYP" || formData.level === "MD (Medical Doctor)"} />

            {formData.level !== "NUFYP" && (
              <div className="md:col-span-2">
                <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">9. Major *</label>
                <Input id="major" name="major" type="text" required value={formData.major} onChange={handleChange} placeholder="" />
              </div>
            )}

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (1990-2030) *</label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" required min="1990-01-01" max="2030-12-31" value={formData.dateOfBirth} onChange={handleChange} />
            </div>

            {formData.applicantType === "local" && (
              <div>
                <label htmlFor="iin" className="block text-sm font-medium text-gray-700 mb-1">ИИН (12 digits) *</label>
                <Input id="iin" name="iin" type="text" required value={formData.iin} onChange={handleChange} placeholder="" maxLength={12} />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Required Documents</h3>
          <p className="text-xs text-gray-500 mb-4">Only PDF files accepted. Max 10 GB per file.</p>

          <div className="space-y-6">
            {formData.applicantType === "international" ? (
              <>
                <FileUploadField name="propertyCertificateSelf" required files={fileUploads.propertyCertificateSelf} onChange={handleFileChange} label="Passport Scan *" helperText="Upload a clear scan of your passport. PDF format preferred." />
                <FileUploadField name="additionalDocuments" files={fileUploads.additionalDocuments} onChange={handleFileChange} label="Additional Supporting Documents" helperText="Any other documents to support your application." />
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <RadioGroup label="Do you or your parents have an apartment in Astana city? Note: giving wrong information is a serious violation! *" name="hasApartmentInAstana" value={formData.hasApartmentInAstana} required options={["Yes", "No"]} onChange={handleChange} />
                  <FileUploadField name="propertyCertificateSelf" required files={fileUploads.propertyCertificateSelf} onChange={handleFileChange} label="10. Certificate from eGov confirming absence of real estate in Astana — YOURSELF *" helperText="Issued for ASTANA only. Must be from eGov portal. PDF only. Name file: yourIIN_YourName_Surname_propertyEgov" />
                  <FileUploadField name="propertyCertificateMother" required files={fileUploads.propertyCertificateMother} onChange={handleFileChange} label="11. Certificate from eGov confirming absence of real estate in Astana — MOTHER *" helperText="PDF only. Name file: MotherIIN_MotherName_MotherSurname_propertyEgov_mother. Single-parent/orphan: upload empty file." />
                  <FileUploadField name="propertyCertificateFather" required files={fileUploads.propertyCertificateFather} onChange={handleFileChange} label="12. Certificate from eGov confirming absence of real estate in Astana — FATHER *" helperText="PDF only. Name file: FatherIIN_FatherName_FatherSurname_propertyEgov_father. Single-parent/orphan: upload empty file." />
                </div>
                <div className="space-y-3">
                  <RadioGroup label="Do your parents work in Astana city? Note: giving wrong information is a serious violation! *" name="parentsWorkInAstana" value={formData.parentsWorkInAstana} required options={["Yes", "No"]} onChange={handleChange} />
                  <FileUploadField name="workCertificateMother" required files={fileUploads.workCertificateMother} onChange={handleFileChange} label="13. Work certificate of MOTHER, issued not more than 10 days before application *" helperText="Must be stamped, dated, signed. Name file: YourName_Surname_parent1. If retired: retirement passport. If unemployed: eGov unemployment certificate. Single-parent: upload empty file." />
                  <FileUploadField name="workCertificateFather" required files={fileUploads.workCertificateFather} onChange={handleFileChange} label="14. Work certificate of FATHER, issued not more than 10 days before application *" helperText="Must be stamped, dated, signed. Name file: YourName_Surname_parent2. If retired: retirement passport. If unemployed: eGov unemployment certificate. Single-parent: upload empty file." />
                </div>
                <div className="space-y-3">
                  <RadioGroup label="Do you have registration (прописка) in Astana? *" name="isAstanaResident" value={formData.isAstanaResident} required options={["Yes", "No"]} onChange={handleChange} />
                  <FileUploadField name="residenceProofSelf" required files={fileUploads.residenceProofSelf} onChange={handleFileChange} label="15. eGov report confirming registration in Astana — YOURSELF *" helperText="Name file: yourIIN_YourName_Surname_residenceEgov. No screenshots." />
                  <FileUploadField name="residenceProofMother" required files={fileUploads.residenceProofMother} onChange={handleFileChange} label="16. eGov report confirming registration in Astana — MOTHER *" helperText="Name file: MotherIIN_MotherName_MotherSurname_residenceEgov_mother. Single-parent: upload empty file." />
                  <FileUploadField name="residenceProofFather" required files={fileUploads.residenceProofFather} onChange={handleFileChange} label="17. eGov report confirming registration in Astana — FATHER *" helperText="Name file: FatherIIN_FatherName_FatherSurname_residenceEgov_father. Single-parent: upload empty file." />
                </div>
                <FileUploadField name="additionalDocuments" files={fileUploads.additionalDocuments} onChange={handleFileChange} label="18. Additional documents (divorce/death certificates, etc.)" helperText="Name file: YourName_Surname_other. If apartment is rough finish (черновая отделка), include certificate from ОСИ/КСК and photos/video." />
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Additional Preferences</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="preferredRoommate" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Roommate <span className="text-xs text-gray-500">(optional — Student ID, 9 digits)</span>
              </label>
              <Input
                id="preferredRoommate"
                name="preferredRoommate"
                type="text"
                value={formData.preferredRoommate}
                onChange={handleChange}
                placeholder="e.g. 202400042"
                maxLength={9}
              />
              <p className="mt-1 text-xs text-gray-400">Enter the Student ID of the person you'd like to room with. Both students must list each other for the request to be considered.</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Let us know if you have any comments:</label>
          <textarea id="comments" name="comments" rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500" placeholder="Additional context" value={formData.comments} onChange={handleChange} />
        </div>

        <div className="flex justify-center pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-64">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Card>
  );
}