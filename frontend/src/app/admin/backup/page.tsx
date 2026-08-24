"use client";

import { useState, useEffect } from "react";
import { Database, Download, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/backups");
      const data = await response.json();
      setBackups(data);
    } catch (error) {
      console.error("Failed to fetch backups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await fetch("http://localhost:8000/api/admin/backup", {
        method: "POST",
      });
      alert("Backup created successfully!");
      fetchBackups();
    } catch (error) {
      console.error("Failed to create backup:", error);
      alert("Failed to create backup");
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (backupKey: string) => {
    if (!confirm("Are you sure you want to restore this backup? This will replace current data.")) {
      return;
    }

    setRestoring(true);
    try {
      await fetch(`http://localhost:8000/api/admin/restore/${backupKey}`, {
        method: "POST",
      });
      alert("Backup restored successfully!");
    } catch (error) {
      console.error("Failed to restore backup:", error);
      alert("Failed to restore backup");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Backup</h1>
            <p className="text-gray-600">Create and restore database backups</p>
          </div>
          <Link href="/admin" className="text-gray-600 hover:text-primary">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create New Backup</h2>
              <p className="text-sm text-gray-500">Create a full backup of the database</p>
            </div>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="btn-primary flex items-center space-x-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  <span>Create Backup</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Backups</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-gray-600">Loading backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No backups available</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {backups.map((backup) => (
                <div key={backup.key} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Database className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(backup.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{backup.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRestoreBackup(backup.key)}
                      disabled={restoring}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      {restoring ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Restoring...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-5 w-5" />
                          <span>Restore</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Important Notes</h3>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                <li>• Backups are stored in Redis and expire after 7 days</li>
                <li>• Restoring a backup will replace all current data</li>
                <li>• For production, consider using automated backup solutions</li>
                <li>• Always test backups in a staging environment first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
