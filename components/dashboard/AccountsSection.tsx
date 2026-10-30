'use client';

import React from 'react';
import { deleteAccount } from '@/lib/db';
import { IAccount } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  Edit2,
  Landmark,
  Plus,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react';

interface AccountsSectionProps {
  accounts: IAccount[];
  onAddAccount: () => void;
  onEditAccount: (account: IAccount) => void;
}

const ACCOUNT_ICONS = {
  Bank: Building2,
  UPI: Smartphone,
  Cash: Banknote,
  CreditCard: CreditCard,
  Savings: Landmark,
};

export function AccountsSection({
  accounts,
  onAddAccount,
  onEditAccount,
}: AccountsSectionProps) {
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Delete this account? Associated transactions will remain.')) {
      await deleteAccount(id);
    }
  };

  return (
    <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-5 sm:p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-zinc-100">
              Accounts & Liquidity
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 tabular-nums">
              {accounts.length}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your bank accounts, UPI handles, and cash wallets in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Total Stored Liquidity
            </span>
            <div className="font-heading text-base font-bold text-emerald-400 tabular-nums">
              {formatINR(totalBalance)}
            </div>
          </div>
          <button
            onClick={onAddAccount}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add account</span>
          </button>
        </div>
      </div>

      {/* Account Cards */}
      {accounts.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Wallet className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-semibold text-zinc-200">
              No accounts registered yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Add your bank account, UPI ID, or physical cash balance to organize daily expenses properly.
            </p>
          </div>
          <button
            onClick={onAddAccount}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Register first account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((acc) => {
            const Icon = ACCOUNT_ICONS[acc.type] || Wallet;
            return (
              <div
                key={acc.id}
                className="border border-zinc-800 hover:border-zinc-700 rounded-xl bg-zinc-900/50 p-4 flex flex-col justify-between space-y-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-semibold text-sm text-zinc-100 truncate max-w-[150px]">
                          {acc.name}
                        </span>
                        {acc.isDefault && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950/60 border border-emerald-700 text-emerald-400">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {acc.type} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditAccount(acc)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      title="Edit account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-baseline justify-between">
                  <span className="text-[11px] text-zinc-500">Available Balance</span>
                  <span className="font-heading font-bold text-base text-zinc-100 tabular-nums">
                    {formatINR(acc.balance)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
