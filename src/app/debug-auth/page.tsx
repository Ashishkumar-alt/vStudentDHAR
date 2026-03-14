"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function DebugAuthPage() {
  const { user, loading, isAdmin, profile } = useAuth();
  const router = useRouter();

  console.log('DebugAuthPage: Rendering', { user: !!user, loading, isAdmin });

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Auth State:</h2>
            <pre className="text-sm">
              {JSON.stringify({
                loading,
                user: user ? {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                } : null,
                isAdmin,
                profile: profile ? {
                  id: profile.id,
                  email: profile.email,
                  role: profile.role,
                } : null,
              }, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-blue-100 rounded">
            <h2 className="font-semibold mb-2">Browser Info:</h2>
            <pre className="text-sm">
              {JSON.stringify({
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
              }, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-green-100 rounded">
            <h2 className="font-semibold mb-2">Storage Info:</h2>
            <pre className="text-sm">
              {JSON.stringify({
                localStorage: {
                  available: typeof localStorage !== 'undefined',
                  keys: typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [],
                },
                sessionStorage: {
                  available: typeof sessionStorage !== 'undefined',
                  keys: typeof sessionStorage !== 'undefined' ? Object.keys(sessionStorage) : [],
                },
              }, null, 2)}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Admin
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
