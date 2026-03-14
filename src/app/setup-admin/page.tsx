"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { setAdminRole } from "@/lib/firebase/adminUtils";

export default function SetupAdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGrantAdmin = async () => {
    if (!user) {
      setMessage("❌ Please login first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const success = await setAdminRole(user.uid, user.email || "");
      
      if (success) {
        setMessage(`✅ Admin role granted to ${user.email}`);
        // Refresh the page to update auth state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage("❌ Failed to grant admin role");
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Setup</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-semibold mb-2">Current User:</h2>
            <p className="text-sm">
              <strong>Email:</strong> {user?.email || "Not logged in"}
            </p>
            <p className="text-sm">
              <strong>UID:</strong> {user?.uid || "Not logged in"}
            </p>
          </div>

          {user && (
            <div className="p-4 bg-blue-100 rounded">
              <h2 className="font-semibold mb-2">Grant Admin Role:</h2>
              <p className="text-sm mb-4">
                This will set your role to "admin" in the Firestore users collection.
              </p>
              <button
                onClick={handleGrantAdmin}
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? "Granting Admin Role..." : "Grant Admin Role"}
              </button>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded ${
              message.includes("✅") ? "bg-green-100" : "bg-red-100"
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="p-4 bg-yellow-100 rounded">
            <h2 className="font-semibold mb-2">Instructions:</h2>
            <ol className="text-sm list-decimal list-inside space-y-1">
              <li>Login with your admin email</li>
              <li>Click "Grant Admin Role" button</li>
              <li>Wait for success message</li>
              <li>Page will refresh automatically</li>
              <li>Navigate to /admin to test access</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
