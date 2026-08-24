"use client";

import { useState } from "react";
import { Search, Loader2, Shield, AlertCircle } from "lucide-react";

export default function PortScanPage() {
  const [target, setTarget] = useState("");
  const [ports, setPorts] = useState("1-1024");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!target) {
      setError("Please enter a target IP or domain");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/tools/port-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target, ports }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scan failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Port Scanner</h1>
          <p className="text-gray-600">
            Scan open ports on any target using Nmap-like functionality
          </p>
        </div>

        <div className="card mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target (IP or Domain)
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., 192.168.1.1 or example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ports (e.g., 1-1024, 80,443,8080)
              </label>
              <input
                type="text"
                value={ports}
                onChange={(e) => setPorts(e.target.value)}
                placeholder="1-1024"
                className="input-field"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Start Scan</span>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan Results</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-lg font-semibold">{result.target}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Scanned</p>
                <p className="text-lg font-semibold">{result.total_ports_scanned}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Open Ports</p>
                <p className="text-lg font-semibold text-green-600">{result.open_ports.length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Closed/Filtered</p>
                <p className="text-lg font-semibold text-red-600">
                  {result.closed_ports + result.filtered_ports}
                </p>
              </div>
            </div>

            {result.open_ports.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Open Ports</h3>
                <div className="space-y-2">
                  {result.open_ports.map((port: any) => (
                    <div
                      key={port.port}
                      className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">Port {port.port}</p>
                          <p className="text-sm text-gray-600">{port.service}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Open
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No open ports found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
