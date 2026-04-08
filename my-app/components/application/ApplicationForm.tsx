"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

type ApplicationStatus = "idle" | "submitted" | "error";
type ApplicantType = "local" | "international";
type BinaryChoice = "yes" | "no" | "";

const schoolOptions = [
  "SSH",
  "SEDS",
  "SMG",
  "SOM",
  "GSE",
  "GSB",
  "GSPP",
  "CPS",
] as const;

const levelOptions = ["Undergraduate", "Masters", "Docmed"] as const;

type UploadFieldName =
  | "propertyCertificate"
  | "parentWorkCertificates"
  | "residenceProof"
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
  id,
  name,
  label,
  value,
  required = false,
  options,
  placeholder,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  required?: boolean;
  options: readonly string[];
  placeholder: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
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
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}) {
  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label
            key={option}
            className="inline-flex items-center gap-2 text-sm text-gray-900"
          >
            <input
              type="radio"
              name={name}
              value={option.toLowerCase()}
              checked={value === option.toLowerCase()}
              required={required}
              onChange={onChange}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{option}</span>
          </label>
        ))}
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
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {helperText && <p className="text-sm text-gray-500 mb-2">{helperText}</p>}
      <input
        id={name}
        name={name}
        type="file"
        multiple
        required={required}
        onChange={(e) =>
          onChange(name, Array.from(e.target.files ? e.target.files : []))
        }
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
      />
      <div className="mt-2 text-sm text-gray-600">
        <span className="font-medium">Submitted files:</span>{" "}
        {files.length > 0 ? files.map((file) => file.name).join(", ") : "None"}
      </div>
    </div>
  );
}

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus>("idle");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    applicantType: "local" as ApplicantType,
    studentId: "",
    fullName: "",
    fullNameLocal: "",
    dateOfBirth: "",
    iin: "",
    school: "",
    level: "",
    passportNumber: "",
    hasApartmentInNurSultan: "" as BinaryChoice,
    parentsWorkInNurSultan: "" as BinaryChoice,
    isNurSultanResident: "" as BinaryChoice,
    comments: "",
  });

  const [fileUploads, setFileUploads] = useState<Record<UploadFieldName, File[]>>(
    {
      propertyCertificate: [],
      parentWorkCertificates: [],
      residenceProof: [],
      additionalDocuments: [],
    }
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === "applicantType") {
        if (value === "local") {
          next.passportNumber = "";
        } else {
          next.fullNameLocal = "";
        }
      }

      return next;
    });
  };

  const handleFileChange = (name: UploadFieldName, files: File[]) => {
    setFileUploads((current) => ({
      ...current,
      [name]: files,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in first");
        setApplicationStatus("error");
        return;
      }

      const additionalInfoSections = [
        `Applicant Type: ${formData.applicantType}`,
        `Student ID: ${formData.studentId}`,
        `Name Surname: ${formData.fullName}`,
        formData.applicantType === "local"
          ? `ФИО: ${formData.fullNameLocal}`
          : null,
        `Date of Birth: ${formData.dateOfBirth}`,
        `ИИН: ${formData.iin}`,
        `School: ${formData.school}`,
        `Level: ${formData.level}`,
        formData.applicantType === "international"
          ? `Passport Number: ${formData.passportNumber}`
          : null,
        `Apartment in Nur-Sultan: ${formData.hasApartmentInNurSultan}`,
        `Parents work in Nur-Sultan: ${formData.parentsWorkInNurSultan}`,
        `Nur-Sultan resident: ${formData.isNurSultanResident}`,
        `Property certificate files: ${
          fileUploads.propertyCertificate.map((file) => file.name).join(", ") ||
          "None"
        }`,
        `Parent work certificate files: ${
          fileUploads.parentWorkCertificates
            .map((file) => file.name)
            .join(", ") || "None"
        }`,
        `Residence proof files: ${
          fileUploads.residenceProof.map((file) => file.name).join(", ") ||
          "None"
        }`,
        `Additional document files: ${
          fileUploads.additionalDocuments.map((file) => file.name).join(", ") ||
          "None"
        }`,
        formData.comments ? `Comments: ${formData.comments}` : null,
      ].filter(Boolean);

      const response = await fetch("http://localhost:8080/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year: new Date().getFullYear(),
          major: formData.school,
          gender: "Other",
          room_preference: formData.level,
          additional_info: additionalInfoSections.join("\n"),
        }),
      });

      const responseText = await response.text();
      let data: { application_id?: number; error?: string; message?: string } | null =
        null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || `HTTP error! status: ${response.status}`
        );
      }

      if (data?.application_id) {
        setApplicationStatus("submitted");
      } else {
        setError(
          "Failed to submit application: " +
            (data?.error || data?.message || "Unknown error")
        );
        setApplicationStatus("error");
      }
    } catch (submitError) {
      console.error("Submission error:", submitError);
      setError(
        "Error: " +
          (submitError instanceof Error ? submitError.message : "Unknown error")
      );
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
          <h3 className="mb-2 text-2xl font-bold text-gray-900">
            Application Submitted!
          </h3>
          <p className="mb-4 text-gray-600">
            Your housing application has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500">
            You will be notified via email once your application is reviewed.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Housing Application
        </h2>
        <p className="mt-2 text-gray-600">
          Submit your application for university housing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Student Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <RadioGroup
              label="Applicant Type *"
              name="applicantType"
              value={formData.applicantType}
              required
              options={["Local", "International"]}
              onChange={handleChange}
            />

            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Student ID *
              </label>
              <Input
                id="studentId"
                name="studentId"
                type="text"
                required
                value={formData.studentId}
                onChange={handleChange}
                placeholder="20240001"
              />
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name Surname *
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Smith"
              />
            </div>

            {formData.applicantType === "local" && (
              <div>
                <label
                  htmlFor="fullNameLocal"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ФИО (only for local) *
                </label>
                <Input
                  id="fullNameLocal"
                  name="fullNameLocal"
                  type="text"
                  required
                  value={formData.fullNameLocal}
                  onChange={handleChange}
                  placeholder="Иванов Иван Иванович"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth *
              </label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="iin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ИИН *
              </label>
              <Input
                id="iin"
                name="iin"
                type="text"
                required
                value={formData.iin}
                onChange={handleChange}
                placeholder="12-digit IIN"
              />
            </div>

            <SelectField
              id="school"
              name="school"
              label="School *"
              value={formData.school}
              required
              options={schoolOptions}
              placeholder="Select School"
              onChange={handleChange}
            />

            <SelectField
              id="level"
              name="level"
              label="Level *"
              value={formData.level}
              required
              options={levelOptions}
              placeholder="Select Level"
              onChange={handleChange}
            />

            {formData.applicantType === "international" && (
              <div>
                <label
                  htmlFor="passportNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Passport Number (only for international students) *
                </label>
                <Input
                  id="passportNumber"
                  name="passportNumber"
                  type="text"
                  required
                  value={formData.passportNumber}
                  onChange={handleChange}
                  placeholder="Passport number"
                />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Required Documents
          </h3>

          <div className="space-y-6">
            <div className="space-y-3">
              <RadioGroup
                label="Do you or your parents have an apartment in Nur-Sultan city? Note: that giving a wrong information is a serious violation! *"
                name="hasApartmentInNurSultan"
                value={formData.hasApartmentInNurSultan}
                required
                options={["Yes", "No"]}
                onChange={handleChange}
              />
              <FileUploadField
                name="propertyCertificate"
                required
                files={fileUploads.propertyCertificate}
                onChange={handleFileChange}
                label="Please upload a Certificate confirming absence of real estate/property in Nur-Sultan from EGOV for you and your parents (Справка об отсутствии/наличии недвижимости в г. Нур-Султан). The document should be issued for Nur-Sultan region only. Please name it with YourName_Surname_propertyEgov *"
              />
            </div>

            <div className="space-y-3">
              <RadioGroup
                label="Do your parents work in Nur-Sultan city? Note: that giving a wrong information is a serious violation! *"
                name="parentsWorkInNurSultan"
                value={formData.parentsWorkInNurSultan}
                required
                options={["Yes", "No"]}
                onChange={handleChange}
              />
              <FileUploadField
                name="parentWorkCertificates"
                required
                files={fileUploads.parentWorkCertificates}
                onChange={handleFileChange}
                label="Please upload a Work certificates of your parents. Please name it with YourName_Surname_parent1 *"
              />
            </div>

            <div className="space-y-3">
              <RadioGroup
                label="Are you a Nur-Sultan city resident? *"
                name="isNurSultanResident"
                value={formData.isNurSultanResident}
                required
                options={["Yes", "No"]}
                onChange={handleChange}
              />
              <FileUploadField
                name="residenceProof"
                required
                files={fileUploads.residenceProof}
                onChange={handleFileChange}
                label="Please upload EGov screenshot on your and your parents place of residence (место прописки). Please name it with YourName_Surname_residenceEgov *"
              />
            </div>

            <FileUploadField
              name="additionalDocuments"
              required
              files={fileUploads.additionalDocuments}
              onChange={handleFileChange}
              label="Please upload any other additional documents to support your application (divorce certificates/death certificates/marriage certificate and documents of your spouse if you are a family student). Please name it with YourName_Surname_other *"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="comments"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Let us know if you have any comments:
          </label>
          <textarea
            id="comments"
            name="comments"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Additional context for your application"
            value={formData.comments}
            onChange={handleChange}
          />
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
