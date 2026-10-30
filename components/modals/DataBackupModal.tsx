'use client';

import React, { useRef, useState } from 'react';
import {
  clearAllData,
  clearDemoData,
  exportData,
  getAllTransactions,
  importData,
} from '@/lib/db';
import { IAccount, ITransaction } from '@/lib/types';
import { downloadFile, generateCSV, validateBackupJSON } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
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
    accounts?: IAccount[];
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
        message: `Exported ${backup.totalRecords} records to offline JSON backup.`,
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
      await importData(
        validationResult.transactions,
        importMode === 'overwrite',
        validationResult.accounts
      );
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

  const handlePurgeFakeData = async () => {
    try {
      setIsLoading(true);
      const count = await clearDemoData();
      setNotification({
        type: 'success',
        message: `Removed ${count} sample/demo transactions. Your real records are kept.`,
      });
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to clear sample data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWipeData = async () => {
    if (!confirm('CAUTION: Are you sure you want to permanently clear all accounts and transactions?')) {
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
      setNotification({ type: 'error', message: 'Failed to clear data.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h2 className="font-heading font-bold text-zinc-100 text-lg">
              Data & Backups
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Export offline snapshots or purge demo data.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-2 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 px-5">
          <button
            onClick={() => {
              setActiveTab('export');
              setNotification(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('import');
              setNotification(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('maintenance');
              setNotification(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Data</span>
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`p-3.5 mx-5 mt-4 rounded-lg text-xs flex items-center gap-2.5 ${
              notification.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-800 text-rose-300'
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
              <p className="text-xs text-zinc-300">
                Your daily financial data is kept exclusively in your browser. Download an offline backup file anytime.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm mb-1">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>JSON Backup</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Complete database snapshot with transactions and accounts.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    disabled={isLoading}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm mb-1">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>CSV Spreadsheet</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Standard tabular CSV for Excel, Numbers, or Google Sheets.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    disabled={isLoading}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-300">
                Restore your previous backup file. The schema is verified before importing.
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
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Choose JSON Backup</span>
                </button>
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder='{"version":"2.0.0","transactions":[...]}'
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    validateJSON(e.target.value);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {validationResult && (
                <div
                  className={`p-3.5 rounded-lg border text-xs ${
                    validationResult.valid
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  {validationResult.valid ? (
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Valid: {validationResult.transactions?.length} transactions ready</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="font-bold">Validation Error:</span>
                      <ul className="list-disc list-inside text-rose-300 pl-1">
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
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Confirm and Restore Records
                </button>
              )}
            </div>
          )}

          {/* TAB 3: CLEAN / MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              {/* Purge Demo Fake Data */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Purge Demo / Fake Transactions
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Removes any placeholder transactions and sample contract payouts from previous sessions so only your real daily expenses remain.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handlePurgeFakeData}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Demo Transactions</span>
                  </button>
                </div>
              </div>

              {/* Complete Reset */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Factory Reset Database</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Permanently wipe all accounts and transactions from local storage.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleWipeData}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Entire Database</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
