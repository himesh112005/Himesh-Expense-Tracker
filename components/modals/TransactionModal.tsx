'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { addTransaction, updateTransaction } from '@/lib/db';
import { Category, ITransaction, PaymentMode, TransactionType } from '@/lib/types';
import { CATEGORY_METADATA, PAYMENT_MODE_METADATA } from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Cpu,
  CreditCard,
  GraduationCap,
  Navigation,
  Plus,
  Receipt,
  Save,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  X,
  Zap,
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
  { id: 'Tech', label: 'Tech & Cloud', icon: Cpu },
  { id: 'Bills', label: 'Bills & Recharges', icon: Receipt },
  { id: 'Misc', label: 'Miscellaneous', icon: Sparkles },
];

const PAYMENT_MODES: { id: PaymentMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'UPI', label: 'UPI (GPay)', icon: Smartphone },
  { id: 'Cash', label: 'Cash Wallet', icon: Banknote },
  { id: 'Card', label: 'Card', icon: CreditCard },
  { id: 'NetBanking', label: 'Bank Account', icon: Building2 },
];

const QUICK_INCREMENTS = [50, 100, 200, 500, 1000, 2000];

const SUGGESTIONS = {
  expense: [
    { title: 'Chai & Snacks', category: 'Food' as Category },
    { title: 'Swiggy / Zomato', category: 'Food' as Category },
    { title: 'Metro Smart Card', category: 'Travel' as Category },
    { title: 'Uber / Auto Ride', category: 'Travel' as Category },
    { title: 'College Lab / Exam Fee', category: 'College' as Category },
    { title: 'Cloud Server / API', category: 'Tech' as Category },
    { title: 'Mobile / Broadband Bill', category: 'Bills' as Category },
  ],
  income: [
    { title: 'Freelance Contract', category: 'Tech' as Category },
    { title: 'Monthly Fellowship', category: 'College' as Category },
    { title: 'Pocket Allowance', category: 'Misc' as Category },
    { title: 'Cashback & Rewards', category: 'Bills' as Category },
  ],
};

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
  const [createdAt, setCreatedAt] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setType(editTransaction.type);
        setAmount(editTransaction.amount.toString());
        setTitle(editTransaction.title);
        setPaymentMode(editTransaction.paymentMode);
        setCategory(editTransaction.category);
        setNote(editTransaction.note || '');
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
        setNote('');
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const localDT = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        setCreatedAt(localDT);
      }
      setError(null);

      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editTransaction, defaultType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, amount, title, paymentMode, category, createdAt, note, type]);

  const handleIncrement = (inc: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + inc).toString());
  };

  const handleSuggestionClick = (s: { title: string; category: Category }) => {
    setTitle(s.title);
    setCategory(s.category);
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
      setError('Please enter a recipient or description for this record.');
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
          createdAt: isoDate,
          note: note.trim() || undefined,
        });
      } else {
        await addTransaction({
          title: title.trim(),
          amount: parsedAmount,
          type,
          paymentMode,
          category,
          createdAt: isoDate,
          note: note.trim() || undefined,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setError('Failed to save transaction to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isExpense = type === 'expense';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-lg bg-[#121A28] border border-[#223147] rounded-3xl shadow-2xl overflow-hidden my-6 animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Google 4-Color Top Accent */}
        <div className="h-1 w-full gpay-gradient-bar" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1C2638] bg-[#0E1522]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                isExpense
                  ? 'bg-[#EA4335]/15 border-[#EA4335]/30 text-[#EA4335]'
                  : 'bg-[#34A853]/15 border-[#34A853]/30 text-[#34A853]'
              }`}
            >
              {isExpense ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                {editTransaction ? 'Edit Payment' : isExpense ? 'Record Expense (Pay)' : 'Record Income (Receive)'}
              </h2>
              <p className="text-xs text-slate-400">
                0ms latency offline persistence in IndexedDB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-[#1E2B40]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Type Toggle: Expense (Pay) vs Income (Receive) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#090D14] border border-[#202E44]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-[#EA4335]/20 text-[#F28B82] border border-[#EA4335]/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Pay / Outflow
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-[#34A853]/20 text-[#81C995] border border-[#34A853]/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Receive / Inflow
            </button>
          </div>

          {/* Big Hero Amount Field (Google Pay Style) */}
          <div className="p-5 rounded-2xl bg-[#0A0E17] border border-[#202E44] text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Enter Amount
            </span>
            <div className="flex items-center justify-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-400 mr-2 select-none">
                ₹
              </span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-48 sm:w-60 bg-transparent text-3xl sm:text-4xl font-extrabold text-white tabular-nums text-center focus:outline-none placeholder-slate-600"
                required
              />
            </div>

            {/* Quick Increment Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {QUICK_INCREMENTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleIncrement(val)}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-[#141C2B] hover:bg-[#1E2B40] text-slate-300 border border-[#24334C] hover:border-[#4285F4]/50 active:scale-95 transition-all tabular-nums"
                >
                  +₹{val}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Title & Quick Suggestion Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Paying To / Description <span className="text-[#EA4335]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Metro Card, Semester Exam Fee"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0A0E17] border border-[#202E44] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4285F4] transition-all"
              required
            />

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 self-center mr-1">Quick Picks:</span>
              {SUGGESTIONS[type].slice(0, 5).map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#141C2B] border border-[#223147] text-slate-300 hover:text-[#8AB4F8] hover:border-[#4285F4]/40 transition-colors"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Payment Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_MODES.map((pm) => {
                const IconComponent = pm.icon;
                const isSelected = paymentMode === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMode(pm.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#4285F4]/20 border-[#4285F4] text-[#8AB4F8] shadow-sm'
                        : 'bg-[#0A0E17] border-[#202E44] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector with Circular Badges */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;
                const meta = CATEGORY_METADATA[cat.id];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? `${meta.bg} ${meta.border} ${meta.text} ring-1 ring-offset-0 ring-current`
                        : 'bg-[#0A0E17] border-[#202E44] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${meta.circleBg}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Timestamp (IST)
              </label>
              <input
                type="datetime-local"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full bg-[#0A0E17] border border-[#202E44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4285F4]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Add Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Split with Aryan"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#0A0E17] border border-[#202E44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4285F4]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#1C2638] flex items-center justify-between">
            <span className="text-[11px] text-slate-500 hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#1B2536] border border-[#2A3B54] text-slate-300 font-mono">Ctrl+Enter</kbd> to save
            </span>

            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-semibold bg-[#141C2B] hover:bg-[#1E2B40] text-slate-300 border border-[#24334C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-xs font-bold text-white shadow-lg transition-all ${
                  isExpense
                    ? 'bg-[#EA4335] hover:bg-[#D93025]'
                    : 'bg-[#34A853] hover:bg-[#1E8E3E]'
                }`}
              >
                {isSubmitting
                  ? 'Saving...'
                  : editTransaction
                  ? 'Update Payment'
                  : isExpense
                  ? 'Confirm Payment'
                  : 'Record Inflow'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
