"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<
    "idle" | "submitted" | "error"
  >("idle");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    year: 2024,
    major: "",
    gender: "",
    roomPreference: "",
    additionalInfo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Debug: log what we're sending
    console.log("Submitting application data:", formData);
    console.log("Token exists:", !!localStorage.getItem("token"));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in first");
        setApplicationStatus("error");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/applications/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            year: parseInt(formData.year.toString()), // Ensure it's a number
            major: formData.major,
            gender: formData.gender,
            room_preference: formData.roomPreference,
            additional_info: formData.additionalInfo,
          }),
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.application_id) {
        setApplicationStatus("submitted");
      } else {
        setError(
          "Failed to submit application: " + (data.error || "Unknown error")
        );
        setApplicationStatus("error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError(
        "Error: " + (error instanceof Error ? error.message : "Unknown error")
      );
      setApplicationStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationStatus === "submitted") {
    return (
      <Card className="max-w-2xl w-full">
        <div className="text-center py-8">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h3>
          <p className="text-gray-600 mb-4">
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
    <Card className="max-w-2xl w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Housing Application
        </h2>
        <p className="text-gray-600 mt-2">
          Submit your application for university housing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-600">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Academic Year
            </label>
            <Input
              id="year"
              name="year"
              type="number"
              required
              value={formData.year}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="major"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Major
            </label>
            <Input
              id="major"
              name="major"
              type="text"
              required
              placeholder="Computer Science"
              value={formData.major}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="roomPreference"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Room Preference
            </label>
            <Input
              id="roomPreference"
              name="roomPreference"
              type="text"
              placeholder="Single Room"
              value={formData.roomPreference}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="additionalInfo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any special requirements or preferences..."
            value={formData.additionalInfo}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-center pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-64">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
