"use client";

import { useState } from "react";
import { Lock, Loader2, AlertCircle, FileText, Calendar, Building, Mail } from "lucide-react";

export default function WHOISPage() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleQuery = async () => {
    if (!target) {
      setError("Please enter a domain or IP address");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/tools/whois", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "WHOIS query failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WHOIS Query</h1>
          <p className="text-gray-600">
            Get domain and IP registration information
          </p>
        </div>

        <div className="card mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target (Domain or IP)
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., example.com or 8.8.8.8"
                className="input-field"
              />
            </div>
            <button
              onClick={handleQuery}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Querying...</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span>Query WHOIS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="card bg-red-50 border-red-200 mb-8">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && !result.error && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">WHOIS Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-lg font-semibold">{result.target}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-lg font-semibold capitalize">{result.type}</p>
              </div>
            </div>

            <div className="space-y-4">
              {result.registrar && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Building className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Registrar</p>
                    <p className="font-semibold">{result.registrar}</p>
                  </div>
                </div>
              )}

              {result.organization && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Building className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-semibold">{result.organization}</p>
                  </div>
                </div>
              )}

              {result.country && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="font-semibold">{result.country}</p>
                  </div>
                </div>
              )}

              {result.creation_date && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Creation Date</p>
                    <p className="font-semibold">{new Date(result.creation_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {result.expiration_date && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Expiration Date</p>
                    <p className="font-semibold">{new Date(result.expiration_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {result.updated_date && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold">{new Date(result.updated_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {result.name_servers && result.name_servers.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Name Servers</p>
                  <div className="space-y-1">
                    {result.name_servers.map((ns: string, index: number) => (
                      <p key={index} className="font-semibold">{ns}</p>
                    ))}
                  </div>
                </div>
              )}

              {result.emails && result.emails.length > 0 && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Contact Emails</p>
                    <div className="space-y-1">
                      {result.emails.map((email: string, index: number) => (
                        <p key={index} className="font-semibold">{email}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {result.status && result.status.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  <div className="space-y-1">
                    {result.status.map((status: string, index: number) => (
                      <p key={index} className="font-semibold">{status}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
