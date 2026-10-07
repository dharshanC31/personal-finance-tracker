import React, { useCallback, useEffect, useState } from 'react';
import {
  fetchCategories,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
} from './services/api';
import type { Category, Transaction } from './types';

const today = () => new Date().toISOString().split('T')[0];
const money = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n).toFixed(2)}`;
const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load both lists in parallel. Failure shows a message instead of crashing the page.
  const loadData = useCallback(async () => {
    try {
      const [cats, txs] = await Promise.all([fetchCategories(), fetchTransactions()]);
      setCategories(cats);
      setTransactions(txs);
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createTransaction({
        amount: parseFloat(amount),
        categoryId: parseInt(categoryId, 10),
        date,
        description,
      });
      // Clear the form only after the server confirmed the save.
      setAmount('');
      setDescription('');
      await loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this transaction?')) return;
    setError('');
    try {
      await deleteTransaction(id);
      await loadData();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  // Sum in cents so floating point drift never shows up in the totals.
  const sumCents = (type: 'income' | 'expense') =>
    transactions
      .filter((t) => t.categoryType === type)
      .reduce((s, t) => s + Math.round(t.amount * 100), 0);
  const income = sumCents('income') / 100;
  const expense = sumCents('expense') / 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-xl border border-slate-200">
          <h1 className="text-xl font-bold">Personal Finance Tracker</h1>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-emerald-50 p-3 rounded-lg">
              <p className="text-xs text-emerald-600 font-semibold">Income</p>
              <p className="text-lg font-bold text-emerald-700">{money(income)}</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-lg">
              <p className="text-xs text-rose-600 font-semibold">Expenses</p>
              <p className="text-lg font-bold text-rose-700">{money(expense)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-semibold">Net Balance</p>
              <p className="text-lg font-bold text-blue-700">{money(income - expense)}</p>
            </div>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm flex justify-between items-start gap-4"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="font-semibold"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl border border-slate-200 grid grid-cols-2 gap-4"
        >
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="p-2 border rounded"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="p-2 border rounded"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 bg-blue-600 text-white font-semibold py-2 rounded disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Add Transaction'}
          </button>
        </form>

        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4">Transactions</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No transactions yet. Add your first one above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4 font-semibold">Date</th>
                    <th className="py-2 pr-4 font-semibold">Category</th>
                    <th className="py-2 pr-4 font-semibold">Description</th>
                    <th className="py-2 pr-4 font-semibold text-right">Amount</th>
                    <th className="py-2 font-semibold">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 whitespace-nowrap">{t.date}</td>
                      <td className="py-2 pr-4">{t.categoryName}</td>
                      <td className="py-2 pr-4 text-slate-600">{t.description || '-'}</td>
                      <td
                        className={`py-2 pr-4 text-right font-semibold whitespace-nowrap ${
                          t.categoryType === 'income' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {t.categoryType === 'income' ? '+' : '-'}
                        {money(t.amount)}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="text-slate-500 hover:text-rose-600 font-semibold"
                          aria-label={`Delete ${t.categoryName} transaction from ${t.date}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
