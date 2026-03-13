"use client";

import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface SocialProofStats {
  activeListings: number;
  studentsHelped: number;
  averageResponseTime: string;
  satisfactionRate: number;
}

export default function SocialProof() {
  const [stats, setStats] = useState<SocialProofStats>({
    activeListings: 0,
    studentsHelped: 0,
    averageResponseTime: "2 hours",
    satisfactionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching stats - in production, fetch from Firestore
    const fetchStats = async () => {
      try {
        // Mock data - replace with actual Firestore queries
        const mockStats: SocialProofStats = {
          activeListings: 524,
          studentsHelped: 1247,
          averageResponseTime: "2 hours",
          satisfactionRate: 98,
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
      } catch (error) {
        console.error("Error fetching social proof stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {stats.activeListings}+
          </span>
        </div>
        <p className="text-sm text-gray-600">Active Listings</p>
      </div>

      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {stats.studentsHelped}+
          </span>
        </div>
        <p className="text-sm text-gray-600">Students Helped</p>
      </div>

      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <Clock className="h-5 w-5 text-purple-600" />
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {stats.averageResponseTime}
          </span>
        </div>
        <p className="text-sm text-gray-600">Avg. Response</p>
      </div>

      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {stats.satisfactionRate}%
          </span>
        </div>
        <p className="text-sm text-gray-600">Satisfaction</p>
      </div>
    </div>
  );
}
