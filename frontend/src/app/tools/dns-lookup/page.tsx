"use client";

import { useState } from "react";
import { Globe, Loader2, AlertCircle, FileText } from "lucide-react";

export default function DNSLookupPage() {
  const [domain, setDomain] = useState("");
  const [recordTypes, setRecordTypes] = useState<string[]>(["A", "MX", "NS", "TXT"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const availableRecordTypes = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"];

  const toggleRecordType = (type: string) => {
    setRecordTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleLookup = async () => {
    if (!domain) {
      setError("Please enter a domain");
      return;
    }

    if (recordTypes.length === 0) {
      setError("Please select at least one record type");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/tools/dns-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, record_types: recordTypes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "DNS lookup failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during lookup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DNS Lookup</h1>
          <p className="text-gray-600">
            Query DNS records including A, MX, NS, TXT records
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Types
              </label>
              <div className="flex flex-wrap gap-2">
                {availableRecordTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleRecordType(type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      recordTypes.includes(type)
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleLookup}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Looking up...</span>
                </>
              ) : (
                <>
                  <Globe className="h-5 w-5" />
                  <span>Lookup DNS Records</span>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">DNS Results</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Domain</p>
              <p className="text-lg font-semibold">{result.domain}</p>
            </div>

            {Object.entries(result.records).map(([recordType, records]: [string, any]) => (
              <div key={recordType} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  {recordType} Records
                </h3>
                {Array.isArray(records) && records.length > 0 ? (
                  <div className="space-y-2">
                    {records.map((record: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Data:</span>
                            <span className="ml-2 font-medium">{record.data}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">TTL:</span>
                            <span className="ml-2 font-medium">{record.ttl}s</span>
                          </div>
                          {record.priority && (
                            <div>
                              <span className="text-gray-600">Priority:</span>
                              <span className="ml-2 font-medium">{record.priority}</span>
                            </div>
                          )}
                          {record.exchange && (
                            <div>
                              <span className="text-gray-600">Exchange:</span>
                              <span className="ml-2 font-medium">{record.exchange}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No {recordType} records found</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
