"use client";

import { useState, useEffect } from "react";
import { Advertisement, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/ads");
      const data = await response.json();
      setAds(data);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("http://localhost:8000/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ads),
      });
      alert("Ad codes saved successfully!");
    } catch (error) {
      console.error("Failed to save ad codes:", error);
      alert("Failed to save ad codes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advertisement Management</h1>
            <p className="text-gray-600">Configure Google Ads codes for your platform</p>
          </div>
          <Link href="/admin" className="text-gray-600 hover:text-primary">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {/* Hero Ad */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Hero Section (728x90)</h2>
              <Advertisement className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Ads Code</label>
              <textarea
                value={ads?.hero_728x90 || ""}
                onChange={(e) => setAds(prev => ({ ...prev, hero_728x90: e.target.value }))}
                rows={4}
                className="input-field font-mono text-sm"
                placeholder="Paste your Google Ads code here..."
              />
              <p className="mt-2 text-sm text-gray-500">
                This ad will appear below the hero section on the homepage.
              </p>
            </div>
          </div>

          {/* Sidebar Ad */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sidebar (300x250)</h2>
              <Advertisement className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Ads Code</label>
              <textarea
                value={ads?.sidebar_300x250 || ""}
                onChange={(e) => setAds(prev => ({ ...prev, sidebar_300x250: e.target.value }))}
                rows={4}
                className="input-field font-mono text-sm"
                placeholder="Paste your Google Ads code here..."
              />
              <p className="mt-2 text-sm text-gray-500">
                This ad will appear in the sidebar on tool pages.
              </p>
            </div>
          </div>

          {/* Footer Ad */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Footer</h2>
              <Advertisement className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Ads Code</label>
              <textarea
                value={ads?.footer || ""}
                onChange={(e) => setAds(prev => ({ ...prev, footer: e.target.value }))}
                rows={4}
                className="input-field font-mono text-sm"
                placeholder="Paste your Google Ads code here..."
              />
              <p className="mt-2 text-sm text-gray-500">
                This ad will appear in the footer section.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Ad Codes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
