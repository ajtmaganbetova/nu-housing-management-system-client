"use client";

import ApplicationForm from "@/components/application/ApplicationForm";
import ApplicationsTable from "@/components/dashboard/ApplicationsTable";
import { useState } from "react";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<"apply" | "applications">("apply");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your housing application and check your status
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("apply")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "apply"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Submit Application
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "applications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Applications
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "apply" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Application Status Card */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Status
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Status:</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                      Ready to Apply
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900">-</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("applications")}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    View Application History
                  </button>
                  <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200">
                    Contact Housing Office
                  </button>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-2">
              <ApplicationForm />
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div>
            <ApplicationsTable />
          </div>
        )}
      </div>
    </div>
  );
}
