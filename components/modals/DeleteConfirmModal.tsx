'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ITransaction } from '@/lib/types';
import { formatINR, formatISTDate } from '@/lib/utils';
import { AlertTriangle, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-panel border border-panelBorder rounded-xl shadow-2xl overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-panelBorder/70">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-base">Confirm Deletion</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-300">
            Are you sure you want to permanently delete this transaction? This action cannot be undone.
          </p>

          <div className="p-3.5 rounded-lg bg-[#0B0F17] border border-panelBorder space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm text-slate-200">{transaction.title}</span>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  transaction.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
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

        <div className="flex items-center justify-end gap-3 p-4 bg-[#0E1522] border-t border-panelBorder">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isDeleting}>
            Delete Record
          </Button>
        </div>
      </div>
    </div>
  );
}
