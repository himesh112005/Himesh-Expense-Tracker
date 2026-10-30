'use client';

import React, { useEffect, useState } from 'react';
import { addAccount, updateAccount } from '@/lib/db';
import { AccountType, IAccount } from '@/lib/types';
import { Banknote, Building2, CreditCard, Landmark, Smartphone, X } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: IAccount | null;
  onSuccess?: () => void;
}

const ACCOUNT_TYPES: { id: AccountType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Bank', label: 'Bank Account', icon: Building2 },
  { id: 'UPI', label: 'UPI / Wallet', icon: Smartphone },
  { id: 'Cash', label: 'Physical Cash', icon: Banknote },
  { id: 'CreditCard', label: 'Credit Card', icon: CreditCard },
  { id: 'Savings', label: 'Savings Deposit', icon: Landmark },
];

export function AccountModal({ isOpen, onClose, editAccount, onSuccess }: AccountModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editAccount) {
        setName(editAccount.name);
        setType(editAccount.type);
        setAccountNumber(editAccount.accountNumber || '');
        setBalance(editAccount.balance.toString());
        setIsDefault(!!editAccount.isDefault);
        setNotes(editAccount.notes || '');
      } else {
        setName('');
        setType('Bank');
        setAccountNumber('');
        setBalance('0');
        setIsDefault(false);
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, editAccount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide an account name (e.g. HDFC Bank, GPay UPI).');
      return;
    }

    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance)) {
      setError('Please provide a valid balance number.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editAccount && editAccount.id) {
        await updateAccount(editAccount.id, {
          name: name.trim(),
          type,
          accountNumber: accountNumber.trim() || undefined,
          balance: parsedBalance,
          isDefault,
          notes: notes.trim() || undefined,
        });
      } else {
        await addAccount({
          name: name.trim(),
          type,
          accountNumber: accountNumber.trim() || undefined,
          balance: parsedBalance,
          isDefault,
          notes: notes.trim() || undefined,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save account details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h3 className="font-heading text-lg font-bold text-zinc-100">
              {editAccount ? 'Edit Account' : 'Add Financial Account'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Track your bank balance, UPI wallet, or physical cash
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Account Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map((t) => {
                const Icon = t.icon;
                const selected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Account Name <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Salary Account, GPay UPI, Daily Cash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Balance & Account Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Current Balance (₹)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm font-semibold tabular-nums text-zinc-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Identifier (Optional)
              </label>
              <input
                type="text"
                placeholder="Last 4 digits / UPI ID"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Minimum balance ₹10,000, salary crediting"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Default Switch */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isDefaultAccount"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="isDefaultAccount" className="text-xs text-zinc-300 font-medium cursor-pointer">
              Set as primary account for daily expenses
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              {isSubmitting ? 'Saving...' : editAccount ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
