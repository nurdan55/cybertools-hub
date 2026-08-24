"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, AlertCircle, Calendar, Building, FileText, CheckCircle, XCircle } from "lucide-react";

export default function SSLCheckPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!domain) {
      setError("Please enter a domain");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/tools/ssl-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "SSL check failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during SSL check");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SSL Certificate Checker</h1>
          <p className="text-gray-600">
            Verify SSL certificates and check validity
          </p>
        </div>

        <div className="card mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., example.com"
                className="input-field"
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Check SSL Certificate</span>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">SSL Certificate Results</h2>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                result.valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {result.valid ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Valid</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">Invalid</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Domain</p>
                <p className="text-lg font-semibold">{result.domain}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Protocol</p>
                <p className="text-lg font-semibold">{result.protocol} {result.protocol_version}</p>
              </div>
            </div>

            <div className="space-y-4">
              {result.validity && (
                <>
                  <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Valid From</p>
                      <p className="font-semibold">
                        {result.validity.not_before ? new Date(result.validity.not_before).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Valid Until</p>
                      <p className="font-semibold">
                        {result.validity.not_after ? new Date(result.validity.not_after).toLocaleString() : "N/A"}
                      </p>
                      {result.validity.days_remaining !== undefined && (
                        <p className={`text-sm mt-1 ${result.validity.days_remaining < 30 ? "text-red-600" : "text-green-600"}`}>
                          {result.validity.days_remaining} days remaining
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {result.warning && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-semibold">Warning</p>
                  </div>
                  <p className="text-yellow-700 mt-1">{result.warning}</p>
                </div>
              )}

              {result.issuer && Object.keys(result.issuer).length > 0 && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Building className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Issuer</p>
                    <div className="space-y-1">
                      {Object.entries(result.issuer).map(([key, value]: [string, any]) => (
                        <p key={key} className="font-semibold">{key}: {value}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {result.subject && Object.keys(result.subject).length > 0 && (
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Subject</p>
                    <div className="space-y-1">
                      {Object.entries(result.subject).map(([key, value]: [string, any]) => (
                        <p key={key} className="font-semibold">{key}: {value}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {result.subject_alternative_names && result.subject_alternative_names.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Subject Alternative Names</p>
                  <div className="space-y-1">
                    {result.subject_alternative_names.map((san: string, index: number) => (
                      <p key={index} className="font-semibold">{san}</p>
                    ))}
                  </div>
                </div>
              )}

              {result.details && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Certificate Details</p>
                  <div className="space-y-1 text-sm">
                    {result.details.version && <p><span className="text-gray-600">Version:</span> {result.details.version}</p>}
                    {result.details.serial_number && <p><span className="text-gray-600">Serial:</span> {result.details.serial_number}</p>}
                    {result.details.signature_algorithm && <p><span className="text-gray-600">Signature:</span> {result.details.signature_algorithm}</p>}
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
