"use client";

import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminBlacklistPage() {
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIP, setNewIP] = useState("");
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/blacklist");
      const data = await response.json();
      setBlacklist(data);
    } catch (error) {
      console.error("Failed to fetch blacklist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIP = async () => {
    if (!newIP || !newReason) return;

    try {
      await fetch("http://localhost:8000/api/admin/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: newIP, reason: newReason }),
      });
      setNewIP("");
      setNewReason("");
      fetchBlacklist();
    } catch (error) {
      console.error("Failed to add IP:", error);
    }
  };

  const handleRemoveIP = async (ip: string) => {
    try {
      await fetch(`http://localhost:8000/api/admin/blacklist/${ip}`, {
        method: "DELETE",
      });
      fetchBlacklist();
    } catch (error) {
      console.error("Failed to remove IP:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">IP Blacklist</h1>
            <p className="text-gray-600">Manage blocked IP addresses</p>
          </div>
          <Link href="/admin" className="text-gray-600 hover:text-primary">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add IP to Blacklist</h2>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
              <input
                type="text"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="e.g., 192.168.1.1"
                className="input-field"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g., Abuse, Rate limiting"
                className="input-field"
              />
            </div>
            <button
              onClick={handleAddIP}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-gray-600">Loading blacklist...</p>
            </div>
          ) : blacklist.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No IPs are currently blacklisted</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blacklist.map((item) => (
                    <tr key={item.ip} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveIP(item.ip)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
