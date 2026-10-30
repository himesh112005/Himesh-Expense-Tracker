'use client';

import React, { useEffect, useRef, useState } from 'react';
import { addTransaction, getAllAccounts, updateTransaction } from '@/lib/db';
import { Category, IAccount, ITransaction, PaymentMode, TransactionType } from '@/lib/types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Cpu,
  CreditCard,
  FileEdit,
  GraduationCap,
  Layers,
  Navigation,
  Plus,
  Receipt,
  Smartphone,
  UtensilsCrossed,
  Wallet,
  X,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: ITransaction | null;
  defaultType?: TransactionType;
  onSuccess?: () => void;
}

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Food', label: 'Food & Dining', icon: UtensilsCrossed },
  { id: 'Travel', label: 'Travel & Cab', icon: Navigation },
  { id: 'College', label: 'College & Edu', icon: GraduationCap },
  { id: 'Tech', label: 'Tech & Digital', icon: Cpu },
  { id: 'Bills', label: 'Bills & Utilities', icon: Receipt },
  { id: 'Misc', label: 'General / Misc', icon: Layers },
];

const PAYMENT_MODES: { id: PaymentMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'Card', label: 'Card', icon: CreditCard },
  { id: 'NetBanking', label: 'NetBanking', icon: Building2 },
];

const QUICK_INCREMENTS = [50, 100, 200, 500, 1000, 2000];

export function TransactionModal({
  isOpen,
  onClose,
  editTransaction,
  defaultType = 'expense',
  onSuccess,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [category, setCategory] = useState<Category>('Food');
  const [accountId, setAccountId] = useState<number | undefined>(undefined);
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [changeReason, setChangeReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const list = await getAllAccounts();
        setAccounts(list);
      } catch (err) {
        console.error(err);
      }
    }
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setType(editTransaction.type);
        setAmount(editTransaction.amount.toString());
        setTitle(editTransaction.title);
        setPaymentMode(editTransaction.paymentMode);
        setCategory(editTransaction.category);
        setAccountId(editTransaction.accountId);
        setNote(editTransaction.note || '');
        setChangeReason(editTransaction.changeReason || '');
        const d = new Date(editTransaction.createdAt);
        const pad = (n: number) => String(n).padStart(2, '0');
        const localDT = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setCreatedAt(localDT);
      } else {
        setType(defaultType);
        setAmount('');
        setTitle('');
        setPaymentMode('UPI');
        setCategory('Food');
        setAccountId(undefined);
        setNote('');
        setChangeReason('');
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const localDT = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        setCreatedAt(localDT);
      }
      setError(null);

      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 80);
    }
  }, [isOpen, editTransaction, defaultType]);

  const handleIncrement = (inc: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + inc).toString());
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      amountInputRef.current?.focus();
      return;
    }

    if (!title.trim()) {
      setError('Please describe what this transaction was for.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isoDate = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();

      if (editTransaction && editTransaction.id) {
        await updateTransaction(editTransaction.id, {
          title: title.trim(),
          amount: parsedAmount,
          type,
          paymentMode,
          category,
          accountId,
          createdAt: isoDate,
          note: note.trim() || undefined,
          changeReason: changeReason.trim() || undefined,
        });
      } else {
        await addTransaction({
          title: title.trim(),
          amount: parsedAmount,
          type,
          paymentMode,
          category,
          accountId,
          createdAt: isoDate,
          note: note.trim() || undefined,
          changeReason: changeReason.trim() || undefined,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setError('Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isExpense = type === 'expense';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h2 className="font-heading font-bold text-zinc-100 text-lg">
              {editTransaction
                ? 'Edit Transaction Record'
                : isExpense
                ? 'Record Daily Expense'
                : 'Record Income Entry'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Saved instantly to your local offline database.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-2 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Expense (Outflow)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Income (Inflow)</span>
            </button>
          </div>

          {/* Hero Amount Field */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Amount (INR)
            </span>
            <div className="flex items-center justify-center">
              <span className="text-3xl font-extrabold text-zinc-500 mr-2 select-none">₹</span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-48 bg-transparent text-3xl font-extrabold text-zinc-100 tabular-nums text-center focus:outline-none placeholder-zinc-700"
                required
              />
            </div>

            {/* Quick Increments */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {QUICK_INCREMENTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleIncrement(val)}
                  className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  +₹{val}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-0.5 rounded-md text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Expense Title / Description <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy lunch, Bus pass, Book purchase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Account & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Linked Account
              </label>
              <select
                value={accountId ?? ''}
                onChange={(e) =>
                  setAccountId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">No Account Linked</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Payment Channel
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                {PAYMENT_MODES.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Timestamp (IST)
              </label>
              <input
                type="datetime-local"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Add Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Split with friend"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Reason for Change (Document any edits / changes) */}
          {editTransaction && (
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <FileEdit className="w-3.5 h-3.5" />
                <span>Change Remarks / Update Reason</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Corrected amount from bill, refund adjustment"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-zinc-500">
                Any changes made here will be recorded and displayed on the ledger.
              </p>
            </div>
          )}

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
              {isSubmitting
                ? 'Saving...'
                : editTransaction
                ? 'Update Transaction'
                : isExpense
                ? 'Record Expense'
                : 'Record Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
