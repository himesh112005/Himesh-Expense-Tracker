'use client';

import React from 'react';
import { ITransaction } from '@/lib/types';
import { formatINR, formatISTDate } from '@/lib/utils';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: ITransaction | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  transaction,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-[#121A28] border border-[#223147] rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#1C2638] bg-[#0E1522]">
          <div className="flex items-center gap-2.5 text-[#EA4335]">
            <div className="p-2 rounded-2xl bg-[#EA4335]/15 border border-[#EA4335]/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Delete Transaction</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-[#1E2B40]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-300">
            Are you sure you want to remove this record from your local IndexedDB?
          </p>

          <div className="p-4 rounded-2xl bg-[#0A0E17] border border-[#202E44] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-white">{transaction.title}</span>
              <span
                className={`text-sm font-extrabold tabular-nums ${
                  transaction.type === 'expense' ? 'text-[#F28B82]' : 'text-[#81C995]'
                }`}
              >
                {transaction.type === 'expense' ? '-' : '+'}
                {formatINR(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{transaction.category} • {transaction.paymentMode}</span>
              <span>{formatISTDate(transaction.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 p-4 bg-[#0E1522] border-t border-[#1C2638]">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#182336] hover:bg-[#223148] text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-full text-xs font-bold bg-[#EA4335] hover:bg-[#D93025] text-white flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Deleting...' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
