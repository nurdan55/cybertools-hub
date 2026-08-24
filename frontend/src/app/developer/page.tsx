"use client";

import { useState, useEffect } from "react";
import { Code, Loader2 } from "lucide-react";

export default function DeveloperPage() {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeveloperProfile();
  }, []);

  const fetchDeveloperProfile = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/public/developer-profile");
      const data = await response.json();
      setHtmlContent(data.html_content || "");
    } catch (error) {
      console.error("Failed to fetch developer profile:", error);
      setHtmlContent("");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer Profile</h1>
          <p className="text-gray-600">Meet the team behind CyberTools Hub</p>
        </div>

        {htmlContent ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Profile Content</h2>
            <p className="text-gray-600">
              The developer profile hasn't been set up yet. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
