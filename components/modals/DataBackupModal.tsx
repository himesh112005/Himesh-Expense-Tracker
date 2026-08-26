'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { clearAllData, db, exportData, getAllTransactions, importData, seedSampleData } from '@/lib/db';
import { ITransaction } from '@/lib/types';
import { downloadFile, formatISTDateTime, generateCSV, validateBackupJSON } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DataBackupModal({ isOpen, onClose, onSuccess }: DataBackupModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'maintenance'>('export');
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    transactions?: ITransaction[];
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = async () => {
    try {
      setIsLoading(true);
      const backup = await exportData();
      const jsonString = JSON.stringify(backup, null, 2);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadFile(jsonString, `himesh_expense_backup_${dateStr}.json`, 'application/json');
      setNotification({
        type: 'success',
        message: `Successfully exported ${backup.totalRecords} transactions to JSON.`,
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to export JSON backup.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsLoading(true);
      const transactions = await getAllTransactions();
      const csvString = generateCSV(transactions);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadFile(csvString, `himesh_expenses_${dateStr}.csv`, 'text/csv;charset=utf-8;');
      setNotification({
        type: 'success',
        message: `Successfully exported ${transactions.length} rows to RFC-compliant CSV.`,
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to export CSV.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
      validateJSON(content);
    };
    reader.readAsText(file);
  };

  const validateJSON = (rawText: string) => {
    if (!rawText.trim()) {
      setValidationResult(null);
      return;
    }

    try {
      setIsValidating(true);
      const parsed = JSON.parse(rawText);
      const res = validateBackupJSON(parsed);
      setValidationResult(res);
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [`Invalid JSON Syntax: ${(err as Error).message}`],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationResult?.valid || !validationResult.transactions) return;

    try {
      setIsLoading(true);
      await importData(validationResult.transactions, importMode === 'overwrite');
      setNotification({
        type: 'success',
        message: `Imported ${validationResult.transactions.length} transactions successfully (${importMode}).`,
      });
      setImportText('');
      setValidationResult(null);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Import execution failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setIsLoading(true);
      await seedSampleData(true);
      setNotification({
        type: 'success',
        message: 'Loaded realistic sample data records into IndexedDB.',
      });
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to seed sample data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWipeData = async () => {
    if (!confirm('CAUTION: Are you sure you want to permanently clear all transactions from local IndexedDB?')) {
      return;
    }

    try {
      setIsLoading(true);
      await clearAllData();
      setNotification({
        type: 'success',
        message: 'All local database records have been wiped clean.',
      });
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to clear database.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-xl bg-panel border border-panelBorder rounded-2xl shadow-2xl overflow-hidden my-6 animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-panelBorder/70 bg-[#0E1522]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100 text-base">Enterprise Data Center</h2>
              <p className="text-xs text-slate-400">
                Data persistence, offline exports, backups & validation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-panelBorder bg-[#090D14] px-5">
          <button
            onClick={() => {
              setActiveTab('export');
              setNotification(null);
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
          <button
            onClick={() => {
              setActiveTab('import');
              setNotification(null);
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Restore Backup
          </button>
          <button
            onClick={() => {
              setActiveTab('maintenance');
              setNotification(null);
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Database Tools
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-3.5 mx-5 mt-4 rounded-lg text-xs flex items-center gap-2.5 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Your data is stored locally in your browser’s IndexedDB. Export an offline backup to
                safeguard your finances or migrate to another device.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-[#090D14] border border-panelBorder flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
                      <FileText className="w-4 h-4" />
                      <span>JSON Backup</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Full structured data snapshot. Ideal for restoring or cross-device migrations.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExportJSON}
                    isLoading={isLoading}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download JSON
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-[#090D14] border border-panelBorder flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>CSV Spreadsheet</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      RFC 4180 compliant format. Ideal for Excel, Google Sheets, and audit reports.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportCSV}
                    isLoading={isLoading}
                    className="w-full border-panelBorder hover:border-emerald-500/40"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download CSV
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Upload or paste a valid JSON backup file. The schema validator checks every record before applying changes.
              </p>

              {/* Upload trigger */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Select .JSON File
                </Button>
                <span className="text-xs text-slate-500">or paste JSON payload below</span>
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  rows={4}
                  placeholder='{"version":"1.0.0","transactions":[...]}'
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    validateJSON(e.target.value);
                  }}
                  className="w-full bg-[#090D14] border border-panelBorder rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Validation feedback */}
              {validationResult && (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    validationResult.valid
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {validationResult.valid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Valid Backup Schema: {validationResult.transactions?.length} records found</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Validation Errors:</span>
                      </>
                    )}
                  </div>
                  {!validationResult.valid && (
                    <ul className="list-disc list-inside space-y-0.5 text-rose-300/90 pl-1">
                      {validationResult.errors.slice(0, 4).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Import Options & Action */}
              {validationResult?.valid && (
                <div className="p-3.5 rounded-lg bg-[#090D14] border border-panelBorder space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Conflict Resolution:</span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="accent-indigo-600"
                        />
                        Merge
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="overwrite"
                          checked={importMode === 'overwrite'}
                          onChange={() => setImportMode('overwrite')}
                          className="accent-indigo-600"
                        />
                        Overwrite DB
                      </label>
                    </div>
                  </div>

                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={handleExecuteImport}
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Restore {validationResult.transactions?.length} Records ({importMode})
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#090D14] border border-panelBorder space-y-2">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Seed Realistic Sample Dataset
                </h4>
                <p className="text-xs text-slate-400">
                  Instantly populate the tracker with real-world Indian fintech expense transactions (Swiggy, Metro, College exam fee, Freelance income, etc.) to explore full analytics capabilities.
                </p>
                <div className="pt-2">
                  <Button variant="secondary" size="sm" onClick={handleSeedData} isLoading={isLoading}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Load Sample Data
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Factory Reset (Wipe All Data)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Permanently deletes all transaction records from your browser’s IndexedDB. Export a backup beforehand if needed.
                </p>
                <div className="pt-2">
                  <Button variant="danger" size="sm" onClick={handleWipeData} isLoading={isLoading}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Wipe Database
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 bg-[#0E1522] border-t border-panelBorder">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
