'use client';

import React, { useRef, useState } from 'react';
import { clearAllData, exportData, getAllTransactions, importData, seedSampleData } from '@/lib/db';
import { ITransaction } from '@/lib/types';
import { downloadFile, generateCSV, validateBackupJSON } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ShieldCheck,
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
      downloadFile(jsonString, `himesh_pay_backup_${dateStr}.json`, 'application/json');
      setNotification({
        type: 'success',
        message: `Exported ${backup.totalRecords} records to JSON backup.`,
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
      downloadFile(csvString, `himesh_pay_expenses_${dateStr}.csv`, 'text/csv;charset=utf-8;');
      setNotification({
        type: 'success',
        message: `Exported ${transactions.length} rows to CSV format.`,
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
      const parsed = JSON.parse(rawText);
      const res = validateBackupJSON(parsed);
      setValidationResult(res);
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [`Invalid JSON Syntax: ${(err as Error).message}`],
      });
    }
  };

  const handleExecuteImport = async () => {
    if (!validationResult?.valid || !validationResult.transactions) return;

    try {
      setIsLoading(true);
      await importData(validationResult.transactions, importMode === 'overwrite');
      setNotification({
        type: 'success',
        message: `Imported ${validationResult.transactions.length} records successfully.`,
      });
      setImportText('');
      setValidationResult(null);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Import failed.' });
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
        message: 'Loaded sample data records into IndexedDB.',
      });
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to seed data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWipeData = async () => {
    if (!confirm('CAUTION: Are you sure you want to permanently clear all local transactions?')) {
      return;
    }

    try {
      setIsLoading(true);
      await clearAllData();
      setNotification({
        type: 'success',
        message: 'All local IndexedDB data has been wiped.',
      });
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to clear data.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-lg bg-[#121A28] border border-[#223147] rounded-3xl shadow-2xl overflow-hidden my-6 animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-1 w-full gpay-gradient-bar" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1C2638] bg-[#0E1522]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Account & Data Safety</h2>
              <p className="text-xs text-slate-400">Offline exports, backups & validation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-[#1E2B40]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#1C2638] bg-[#0A0E17] px-5">
          <button
            onClick={() => {
              setActiveTab('export');
              setNotification(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-[#4285F4] text-[#8AB4F8]'
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
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-[#4285F4] text-[#8AB4F8]'
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
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'border-[#4285F4] text-[#8AB4F8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tools
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`p-3.5 mx-5 mt-4 rounded-2xl text-xs flex items-center gap-2.5 ${
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
        <div className="p-5 sm:p-6">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Your records remain strictly on this device. Download an offline backup file anytime.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-2xl bg-[#0A0E17] border border-[#223147] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[#4285F4] font-bold text-sm mb-1">
                      <FileText className="w-4 h-4" />
                      <span>JSON Backup</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Full structured snapshot for seamless migration.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    disabled={isLoading}
                    className="w-full py-2 px-3 rounded-full text-xs font-bold bg-[#4285F4] hover:bg-[#3367D6] text-white flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSON
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0E17] border border-[#223147] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[#34A853] font-bold text-sm mb-1">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>CSV Spreadsheet</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Compatible with Microsoft Excel & Google Sheets.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    disabled={isLoading}
                    className="w-full py-2 px-3 rounded-full text-xs font-bold bg-[#1A263A] hover:bg-[#25364E] text-[#81C995] border border-[#34A853]/40 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Restore data from a JSON backup file. The schema validator verifies integrity before applying.
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#182336] hover:bg-[#223148] text-[#8AB4F8] border border-[#2B3E5C] flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload .JSON File
                </button>
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder='{"version":"1.0.0","transactions":[...]}'
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    validateJSON(e.target.value);
                  }}
                  className="w-full bg-[#0A0E17] border border-[#223147] rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              {validationResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    validationResult.valid
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  {validationResult.valid ? (
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Valid Backup: {validationResult.transactions?.length} records found</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="font-bold">Validation Failed:</span>
                      <ul className="list-disc list-inside text-rose-300/90 pl-1">
                        {validationResult.errors.slice(0, 3).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {validationResult?.valid && (
                <button
                  onClick={handleExecuteImport}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-full text-xs font-bold bg-[#34A853] hover:bg-[#1E8E3E] text-white shadow-md"
                >
                  Restore {validationResult.transactions?.length} Transactions
                </button>
              )}
            </div>
          )}

          {/* TAB 3: TOOLS */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#0A0E17] border border-[#223147] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Seed Sample Dataset
                </h4>
                <p className="text-xs text-slate-400">
                  Load realistic Indian UPI expenses (Swiggy, Metro, Exam Fees, Freelance Payouts).
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleSeedData}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#141C2B] hover:bg-[#1E2B40] text-slate-200 border border-[#223147] flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Load Sample Data
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Factory Reset</span>
                </div>
                <p className="text-xs text-slate-400">
                  Permanently wipe all transaction records from local IndexedDB.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleWipeData}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Wipe Database
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0E1522] border-t border-[#1C2638] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-[#182336] text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
