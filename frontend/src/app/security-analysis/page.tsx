"use client";

import { useState } from "react";
import { Search, Shield, AlertTriangle, CheckCircle, Loader2, Globe, Server, Mail, FileText } from "lucide-react";

export default function SecurityAnalysisPage() {
  const [target, setTarget] = useState("");
  const [targetType, setTargetType] = useState("domain");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const targetTypes = [
    { value: "domain", label: "Domain", icon: Globe },
    { value: "ip", label: "IP Address", icon: Server },
    { value: "url", label: "URL", icon: Globe },
    { value: "email", label: "E-posta", icon: Mail },
    { value: "hash", label: "File Hash", icon: FileText },
  ];

  const handleAnalyze = async () => {
    if (!target) {
      setError("Lütfen bir hedef girin");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("http://localhost:8000/api/security/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target, target_type: targetType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analiz başarısız");
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || "Analiz sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Güvenlik Analizi</h1>
          <p className="text-gray-600">
            Profesyonel siber güvenlik araçları ile kapsamlı tehdit analizi
          </p>
        </div>

        <div className="card mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hedef Türü
              </label>
              <div className="flex flex-wrap gap-2">
                {targetTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setTargetType(type.value)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                        targetType === type.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-300 text-gray-700 hover:border-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {targetType === "domain" && "Domain"}
                {targetType === "ip" && "IP Adresi"}
                {targetType === "url" && "URL"}
                {targetType === "email" && "E-posta Adresi"}
                {targetType === "hash" && "Dosya Hash (MD5/SHA1/SHA256)"}
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={
                  targetType === "domain" ? "example.com"
                  : targetType === "ip" ? "8.8.8.8"
                  : targetType === "url" ? "https://example.com"
                  : targetType === "email" ? "user@example.com"
                  : "d41d8cd98f00b204e9800998ecf8427e"
                }
                className="input-field"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Analiz Et</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="card bg-red-50 border-red-200 mb-8">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {results && !results.error && (
          <div className="space-y-6">
            {/* Hedef Özeti */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-primary" />
                Hedef Özeti
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Hedef</p>
                  <p className="text-lg font-semibold">{results.target_summary?.target || target}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tür</p>
                  <p className="text-lg font-semibold capitalize">{results.target_summary?.type || targetType}</p>
                </div>
              </div>
            </div>

            {/* İlgili Araç Senaryoları */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Search className="h-6 w-6 mr-2 text-primary" />
                İlgili Araç Analizleri
              </h2>
              <div className="space-y-4">
                {results.relevant_tools?.map((tool: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tool.status === "safe" ? "bg-green-100 text-green-800" :
                        tool.status === "warning" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {tool.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Sonuç:</p>
                      <p className="text-gray-600">{tool.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Potansiyel Riskler */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-primary" />
                Potansiyel Riskler & Zafiyetler
              </h2>
              <div className="space-y-3">
                {results.risks?.map((risk: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    risk.severity === "high" ? "bg-red-50 border-red-200" :
                    risk.severity === "medium" ? "bg-yellow-50 border-yellow-200" :
                    "bg-blue-50 border-blue-200"
                  }`}>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        risk.severity === "high" ? "text-red-600" :
                        risk.severity === "medium" ? "text-yellow-600" :
                        "text-blue-600"
                      }`} />
                      <div>
                        <p className="font-semibold text-gray-900">{risk.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Savunma Önerileri */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-primary" />
                Savunma / Aksiyon Önerileri
              </h2>
              <div className="space-y-3">
                {results.recommendations?.map((rec: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 bg-green-50 p-4 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{rec.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
