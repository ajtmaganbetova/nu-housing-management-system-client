"use client";

import ApplicationForm from "@/components/application/ApplicationForm";
import ApplicationsTable from "@/components/dashboard/ApplicationsTable";
import { useState, useCallback } from "react";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<"apply" | "applications">("apply");
  const [showContact, setShowContact] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

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
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                  >
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
            <div className="flex justify-end mb-4">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 text-sm font-medium"
              >
                🔄 Refresh
              </button>
            </div>
            <ApplicationsTable key={refreshKey} />
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Contact Housing Office</h2>
              <button
                onClick={() => setShowContact(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 mt-1">📧</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <a href="mailto:student_housing@nu.edu.kz" className="text-blue-600 hover:underline">student_housing@nu.edu.kz</a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-blue-600 mt-1">🏢</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Office</p>
                  <p className="text-gray-900">Block 24, Office 050</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-blue-600 mt-1">🕐</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Working Hours</p>
                  <p className="text-gray-900">10:00 – 18:00</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-blue-600 mt-1">📞</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone Numbers</p>
                  <div className="space-y-1 mt-1">
                    <div>
                      <a href="tel:+77172706471" className="text-blue-600 hover:underline">
                        8(7172) 70-6471
                      </a>
                      <span className="text-gray-600 text-sm"> — Yerzhan Kani</span>
                    </div>
                    <div>
                      <a href="tel:+77172708983" className="text-blue-600 hover:underline">
                        8(7172) 70-8983
                      </a>
                      <span className="text-gray-600 text-sm"> — Samal Tastambekova</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContact(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
