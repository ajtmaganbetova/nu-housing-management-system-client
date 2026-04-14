"use client";

import ApplicationForm from "@/components/application/ApplicationForm";
import ApplicationsTable from "@/components/dashboard/ApplicationsTable";
import { useState, useCallback } from "react";
import Navbar from "@/components/ui/Navbar";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<"apply" | "applications">("apply");
  const [showContact, setShowContact] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="mt-1 text-gray-500 text-sm">Manage your housing application and check your status</p>
          </div>

          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("apply")}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "apply"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Submit Application
                </button>
                <button
                  onClick={() => setActiveTab("applications")}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "applications"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  My Applications
                </button>
              </nav>
            </div>
          </div>

{activeTab === "apply" && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    {/* LEFT SIDEBAR: Grouping Tips and Contact together */}
    <div className="lg:col-span-1 space-y-6">

      {/* Tips Card */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Tips</h3>
        <ul className="text-xs text-blue-700 space-y-1.5">
          <li>• All documents must be in PDF format</li>
          <li>• Ensure your Student ID is correct</li>
          <li>• Check My Applications tab to see your status</li>
        </ul>
      </div>

      {/* Contact Card - Now styled to match the sidebar width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg text-gray-700 font-bold mb-4">Contact Housing Office</h2>
        <button
          onClick={() => setShowContact(true)}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium transition-colors"
        >
          📞 HOUSING OFFICE
        </button>
      </div>
    </div>

    {/* RIGHT SIDE: The Form */}
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <ApplicationForm />
      </div>
    </div>
  </div>
)}

          {activeTab === "applications" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">Click on any application to expand its details.</p>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                   Refresh
                </button>
              </div>
              <ApplicationsTable key={refreshKey} />
            </div>
          )}
        </div>
      </div>

      {showContact && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowContact(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Contact Housing Office</h2>
              <button
                onClick={() => setShowContact(false)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <a href="mailto:student_housing@nu.edu.kz" className="text-blue-600 hover:underline text-sm font-medium">
                    student_housing@nu.edu.kz
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Office</p>
                  <p className="text-sm font-medium text-gray-800">Block 24, Office 050</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">🕐</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Working Hours</p>
                  <p className="text-sm font-medium text-gray-800">10:00 – 18:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Numbers</p>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                      <a href="tel:+77172706471" className="text-blue-600 hover:underline text-sm font-medium">
                        8(7172) 70-6471
                      </a>
                      <span className="text-gray-400 text-xs">— Yerzhan Kani</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href="tel:+77172708983" className="text-blue-600 hover:underline text-sm font-medium">
                        8(7172) 70-8983
                      </a>
                      <span className="text-gray-400 text-xs">— Samal Tastambekova</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContact(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}