"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function AdminTestPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  // Force admin check for vstudent343@gmail.com
  const userEmail = user?.email?.toLowerCase();
  const isEmailAdmin = userEmail === "vstudent343@gmail.com";
  const finalAdminStatus = isAdmin || isEmailAdmin;

  console.log('🧪 AdminTest: Status', {
    user: !!user,
    email: userEmail,
    isAdmin,
    isEmailAdmin,
    finalAdminStatus
  });

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Access Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-100 rounded">
            <h2 className="font-semibold mb-2">Authentication Status:</h2>
            <div className="text-sm space-y-1">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
              <p><strong>Email:</strong> {userEmail || 'N/A'}</p>
              <p><strong>Is Admin (Auth Provider):</strong> {isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Is Email Admin:</strong> {isEmailAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Final Admin Status:</strong> {finalAdminStatus ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="p-4 bg-green-100 rounded">
            <h2 className="font-semibold mb-2">Quick Actions:</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin')}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Admin Page
              </button>
              <button
                onClick={() => router.push('/debug-auth')}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Go to Debug Auth
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Go to Home
              </button>
            </div>
          </div>

          {finalAdminStatus && (
            <div className="p-4 bg-green-100 rounded">
              <h2 className="font-semibold mb-2 text-green-800">✅ Admin Access Granted!</h2>
              <p className="text-sm text-green-700">
                You have admin privileges. You should be able to access the admin page.
              </p>
            </div>
          )}

          {!finalAdminStatus && user && (
            <div className="p-4 bg-red-100 rounded">
              <h2 className="font-semibold mb-2 text-red-800">❌ Admin Access Denied</h2>
              <p className="text-sm text-red-700">
                You are logged in but don't have admin privileges.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
