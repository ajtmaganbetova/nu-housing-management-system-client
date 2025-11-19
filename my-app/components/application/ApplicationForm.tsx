"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<
    "idle" | "submitted" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Connect to backend API
      console.log("Submitting housing application...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setApplicationStatus("submitted");
    } catch (error) {
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-600">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Application Information
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your application will be automatically linked to your student
                  account. The housing office will review your eligibility based
                  on university records.
                </p>
              </div>
            </div>
          </div>
        </div>

        {applicationStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-600">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error submitting application
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>
                    Please try again later or contact support if the problem
                    persists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-64">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
