"use client";

import { useState } from "react";
import { Activity, Loader2, AlertCircle, Clock, TrendingUp } from "lucide-react";

export default function PingPage() {
  const [target, setTarget] = useState("");
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handlePing = async () => {
    if (!target) {
      setError("Please enter a target IP or domain");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/tools/ping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target, count }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ping test failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during ping test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ping Test</h1>
          <p className="text-gray-600">
            Test network connectivity and measure response times
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
                placeholder="e.g., 8.8.8.8 or google.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packet Count
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 4)}
                min="1"
                max="10"
                className="input-field"
              />
            </div>
            <button
              onClick={handlePing}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Pinging...</span>
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5" />
                  <span>Start Ping Test</span>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ping Results</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-lg font-semibold">{result.target}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Packets Sent</p>
                <p className="text-lg font-semibold">{result.packet_transmitted}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Packets Received</p>
                <p className="text-lg font-semibold">{result.packet_received}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Packet Loss</p>
                <p className="text-lg font-semibold">{result.packet_loss}%</p>
              </div>
            </div>

            {result.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">Min</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">{result.statistics.min.toFixed(2)} ms</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Avg</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{result.statistics.avg.toFixed(2)} ms</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-gray-600">Max</p>
                  </div>
                  <p className="text-xl font-bold text-red-600">{result.statistics.max.toFixed(2)} ms</p>
                </div>
              </div>
            )}

            {result.results && result.results.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Individual Pings</h3>
                <div className="space-y-2">
                  {result.results.map((ping: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">Sequence {ping.sequence}</p>
                          <p className="text-sm text-gray-600">{ping.status}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {ping.time_ms.toFixed(2)} ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
