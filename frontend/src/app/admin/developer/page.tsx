"use client";

import { useState, useEffect } from "react";
import { Code, Save, Loader2, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminDeveloperPage() {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchDeveloperProfile();
  }, []);

  const fetchDeveloperProfile = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/developer-profile");
      const data = await response.json();
      setHtmlContent(data.html_content || "");
    } catch (error) {
      console.error("Failed to fetch developer profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("http://localhost:8000/api/admin/developer-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html_content: htmlContent }),
      });
      alert("Developer profile saved successfully!");
    } catch (error) {
      console.error("Failed to save developer profile:", error);
      alert("Failed to save developer profile");
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer Profile</h1>
            <p className="text-gray-600">Customize the developer profile page with HTML content</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreview(!preview)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="h-5 w-5" />
              <span>{preview ? "Edit" : "Preview"}</span>
            </button>
            <Link href="/admin" className="text-gray-600 hover:text-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">HTML Content</h2>
              <Code className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={20}
              className="input-field font-mono text-sm"
              placeholder="Paste your HTML profile code here..."
            />
            <div className="mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] bg-gray-50">
              {htmlContent ? (
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No content to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You can embed HTML, CSS, and JavaScript code</li>
            <li>• Use this to create a custom developer portfolio page</li>
            <li>• The profile will be displayed at /developer route</li>
            <li>• Make sure to use responsive design for mobile compatibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
