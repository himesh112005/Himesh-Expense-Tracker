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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-heading font-bold text-zinc-100 text-base">Delete Transaction</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-zinc-300">
            Are you sure you want to delete this transaction from your offline database?
          </p>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm text-zinc-100">{transaction.title}</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  transaction.type === 'expense' ? 'text-zinc-100' : 'text-emerald-400'
                }`}
              >
                {transaction.type === 'expense' ? '-' : '+'}
                {formatINR(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{transaction.category} • {transaction.paymentMode}</span>
              <span>{formatISTDate(transaction.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 p-4 bg-zinc-900/40 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
