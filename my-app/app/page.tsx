import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          NU Housing Management System
        </h1>
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block w-64 mx-auto bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="block w-64 mx-auto bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition duration-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
