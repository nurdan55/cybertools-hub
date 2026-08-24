"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Users, FileText, Shield, Settings, Advertisement, Code, Database, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/dashboard");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminMenuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Logs", href: "/admin/logs", icon: FileText },
    { name: "Blacklist", href: "/admin/blacklist", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Advertisements", href: "/admin/ads", icon: Advertisement },
    { name: "Developer Profile", href: "/admin/developer", icon: Code },
    { name: "Backup", href: "/admin/backup", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your CyberTools Hub platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-gray-900">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.user_count}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Queries Today</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.query_count_today}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Queries</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_queries}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Queries</h2>
              <div className="space-y-3">
                {stats.recent_queries.map((query: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                        {query.tool}
                      </span>
                      <span className="text-gray-900">{query.target}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{query.username || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">{new Date(query.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tool Usage Statistics</h2>
              <div className="space-y-3">
                {stats.tool_stats.map((stat: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-900 capitalize">{stat.tool.replace("_", " ")}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(stat.count / stats.total_queries) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{stat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">Failed to load dashboard statistics</p>
          </div>
        )}
      </div>
    </div>
  );
}
