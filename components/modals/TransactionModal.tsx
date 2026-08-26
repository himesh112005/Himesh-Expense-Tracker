'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addTransaction, updateTransaction } from '@/lib/db';
import { Category, ITransaction, PaymentMode, TransactionType } from '@/lib/types';
import { CATEGORY_METADATA, PAYMENT_MODE_METADATA } from '@/lib/utils';
import {
  Banknote,
  BookOpen,
  Building2,
  Calendar,
  Coffee,
  Cpu,
  CreditCard,
  GraduationCap,
  Navigation,
  Plus,
  Receipt,
  RotateCcw,
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
  onSuccess?: () => void;
}

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Food', label: 'Food & Dining', icon: UtensilsCrossed },
  { id: 'Travel', label: 'Travel & Commute', icon: Navigation },
  { id: 'College', label: 'College & Education', icon: GraduationCap },
  { id: 'Tech', label: 'Tech & Cloud', icon: Cpu },
  { id: 'Bills', label: 'Bills & Utilities', icon: Receipt },
  { id: 'Misc', label: 'Miscellaneous', icon: Sparkles },
];

const PAYMENT_MODES: { id: PaymentMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'Card', label: 'Card', icon: CreditCard },
  { id: 'NetBanking', label: 'NetBanking', icon: Building2 },
];

const QUICK_INCREMENTS = [50, 100, 200, 500, 1000, 2000];

const SUGGESTIONS = {
  expense: [
    { title: 'Chai & Snacks', category: 'Food' as Category },
    { title: 'Lunch / Dinner', category: 'Food' as Category },
    { title: 'Metro Recharge', category: 'Travel' as Category },
    { title: 'Uber / Auto Ride', category: 'Travel' as Category },
    { title: 'Stationery & Notes', category: 'College' as Category },
    { title: 'College Lab / Exam Fee', category: 'College' as Category },
    { title: 'API / Cloud Server', category: 'Tech' as Category },
    { title: 'WiFi / Mobile Bill', category: 'Bills' as Category },
  ],
  income: [
    { title: 'Freelance Project', category: 'Tech' as Category },
    { title: 'Monthly Stipend', category: 'College' as Category },
    { title: 'Pocket Allowance', category: 'Misc' as Category },
    { title: 'Cashback / Refund', category: 'Bills' as Category },
  ],
};

export function TransactionModal({
  isOpen,
  onClose,
  editTransaction,
  onSuccess,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [category, setCategory] = useState<Category>('Food');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Sync state with editTransaction or defaults
  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setType(editTransaction.type);
        setAmount(editTransaction.amount.toString());
        setTitle(editTransaction.title);
        setPaymentMode(editTransaction.paymentMode);
        setCategory(editTransaction.category);
        setNote(editTransaction.note || '');
        // Local datetime format (YYYY-MM-DDTHH:mm)
        const d = new Date(editTransaction.createdAt);
        const pad = (n: number) => String(n).padStart(2, '0');
        const localDT = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setCreatedAt(localDT);
      } else {
        // Reset defaults
        setType('expense');
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

      // Autofocus amount input after render
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editTransaction]);

  // Keyboard shortcut: Escape to close, Cmd+Enter to submit
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
      setError('Please enter a title / description for this record.');
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
            <div
              className={`p-2 rounded-lg border ${
                type === 'expense'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              {editTransaction ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-semibold text-slate-100 text-base">
                {editTransaction ? 'Edit Transaction' : 'Record Transaction'}
              </h2>
              <p className="text-xs text-slate-400">
                {editTransaction
                  ? 'Update transaction record in IndexedDB'
                  : 'Instant offline-first entry with 0ms delay'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Type Segmented Switch */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#090D14] border border-panelBorder">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Expense (Outflow)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Income (Inflow)
            </button>
          </div>

          {/* Amount Input with Currency and Fast Increment Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Amount (₹ INR) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 select-none">
                ₹
              </span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#090D14] border border-panelBorder rounded-xl pl-11 pr-4 py-3 text-2xl font-bold text-slate-100 tabular-nums placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            {/* Increment Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-[11px] text-slate-500 self-center mr-1">Quick Add:</span>
              {QUICK_INCREMENTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleIncrement(val)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#161F30] border border-panelBorder text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 active:scale-95 transition-all tabular-nums"
                >
                  +₹{val}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all"
                  title="Clear amount"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Title & Quick Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Title <span className="text-rose-400">*</span>
            </label>
            <Input
              placeholder="e.g. Swiggy Lunch, Metro Card, AWS Server"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 self-center mr-1">Suggestions:</span>
              {SUGGESTIONS[type].slice(0, 5).map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="px-2 py-0.5 text-[11px] rounded bg-[#131B2B] border border-panelBorder/70 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Mode
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
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-[#0E1522] border-panelBorder text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
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
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? `${meta.bg} ${meta.border} ${meta.text} font-semibold ring-1 ring-offset-0 ring-current`
                        : 'bg-[#0E1522] border-panelBorder text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date / Time & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Timestamp (IST)
              </label>
              <Input
                type="datetime-local"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Optional Note / Tags
              </label>
              <Input
                placeholder="e.g. Split with Rohan, Project X"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-panelBorder/70">
            <div className="text-[11px] text-slate-500 hidden sm:block">
              Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl+Enter</kbd> to save
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={type === 'expense' ? 'primary' : 'emerald'}
                size="sm"
                isLoading={isSubmitting}
              >
                {editTransaction ? 'Update Record' : 'Save Transaction'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
