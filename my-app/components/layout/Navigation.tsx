import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              NU Housing
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/student"
              className="text-gray-600 hover:text-gray-900"
            >
              Student Dashboard
            </Link>
            <Link
              href="/dashboard/admin"
              className="text-gray-600 hover:text-gray-900"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
