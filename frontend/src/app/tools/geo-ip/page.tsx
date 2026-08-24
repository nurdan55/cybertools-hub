"use client";

import { useState } from "react";
import { MapPin, Loader2, AlertCircle, Globe, Building, Smartphone, Server } from "lucide-react";

export default function GeoIPPage() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    if (!ip) {
      setError("Please enter an IP address");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/tools/geo-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ip }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "GeoIP lookup failed");
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GeoIP Lookup</h1>
          <p className="text-gray-600">
            Get geographical location and ISP information for IP addresses
          </p>
        </div>

        <div className="card mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="e.g., 8.8.8.8"
                className="input-field"
              />
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
                  <MapPin className="h-5 w-5" />
                  <span>Lookup GeoIP</span>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">GeoIP Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="text-lg font-semibold">{result.ip}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Country</p>
                <p className="text-lg font-semibold">{result.country} ({result.country_code})</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{result.city}, {result.region}, {result.country}</p>
                  {result.zip && <p className="text-sm text-gray-600">ZIP: {result.zip}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                <Building className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">ISP Information</p>
                  <p className="font-semibold">{result.isp}</p>
                  {result.org && <p className="text-sm text-gray-600">Organization: {result.org}</p>}
                  {result.as && <p className="text-sm text-gray-600">AS: {result.as}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-semibold">{result.is_mobile ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Server className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Hosting/Proxy</p>
                    <p className="font-semibold">{result.is_hosting || result.is_proxy ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Coordinates</p>
                <p className="font-semibold">{result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}</p>
                {result.timezone && <p className="text-sm text-gray-600">Timezone: {result.timezone}</p>}
              </div>

              {result.map_url && (
                <a
                  href={result.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block btn-primary text-center"
                >
                  View on Google Maps
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
