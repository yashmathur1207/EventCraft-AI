import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Check, Clock, Trash2, ArrowUpRight, DollarSign, PieChart, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { PlannerEvent, BudgetItem, BudgetCategory } from '../types/event';
import { formatCurrency } from '../utils/formatters';
import { AIBudgetOptimizerModal } from './AIBudgetOptimizerModal';

interface BudgetSectionProps {
  event: PlannerEvent;
  onUpdateEvent: (updated: PlannerEvent) => void;
}

export const BudgetSection: React.FC<BudgetSectionProps> = React.memo(({ event, onUpdateEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(event.budgetCategories[0]?.id || '');
  const [newEstimated, setNewEstimated] = useState<number | ''>('');
  const [newActual, setNewActual] = useState<number | ''>('');
  const [newDueDate, setNewDueDate] = useState('');

  // Calculations memoized for maximum performance on state/input changes
  const { totalAllocated, totalActual, totalEstimated, remainingBudget, paidItems, totalPaid } = useMemo(() => {
    const allocated = event.budgetCategories.reduce((sum, c) => sum + (c.allocated || 0), 0);
    const actual = event.budgetItems.reduce((sum, b) => sum + (b.actualCost || 0), 0);
    const estimated = event.budgetItems.reduce((sum, b) => sum + (b.estimatedCost || 0), 0);
    const rem = event.totalBudget - actual;
    const paid = event.budgetItems.filter(b => b.isPaid);
    const paidSum = paid.reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);
    return {
      totalAllocated: allocated,
      totalActual: actual,
      totalEstimated: estimated,
      remainingBudget: rem,
      paidItems: paid,
      totalPaid: paidSum
    };
  }, [event.budgetCategories, event.budgetItems, event.totalBudget]);

  const filteredItems = useMemo(() => {
    return event.budgetItems.filter(item => {
      if (selectedCategory === 'all') return true;
      return item.categoryId === selectedCategory;
    });
  }, [event.budgetItems, selectedCategory]);

  const handleTogglePaid = (itemId: string) => {
    const updatedItems = event.budgetItems.map(item => {
      if (item.id === itemId) {
        return { ...item, isPaid: !item.isPaid };
      }
      return item;
    });

    onUpdateEvent({
      ...event,
      budgetItems: updatedItems,
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Lead Planner',
          role: 'Lead Planner',
          action: `Toggled payment status for "${event.budgetItems.find(i => i.id === itemId)?.title}"`,
          type: 'budget'
        },
        ...event.activityFeed
      ]
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = event.budgetItems.filter(item => item.id !== itemId);
    onUpdateEvent({
      ...event,
      budgetItems: updatedItems
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newItem: BudgetItem = {
      id: `b-${Date.now()}`,
      categoryId: newCategory || event.budgetCategories[0]?.id || 'cat-1',
      title: newTitle,
      estimatedCost: Number(newEstimated) || 0,
      actualCost: Number(newActual) || 0,
      isPaid: false,
      dueDate: newDueDate || undefined
    };

    onUpdateEvent({
      ...event,
      budgetItems: [...event.budgetItems, newItem],
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Lead Planner',
          role: 'Lead Planner',
          action: `Added budget expense "${newTitle}" ($${newItem.estimatedCost})`,
          type: 'budget'
        },
        ...event.activityFeed
      ]
    });

    setNewTitle('');
    setNewEstimated('');
    setNewActual('');
    setNewDueDate('');
    setIsAddingItem(false);
  };

  const budgetUsagePercent = Math.min(100, Math.round((totalActual / event.totalBudget) * 100));

  return (
    <div className="space-y-8">
      {/* Top Banner & AI Optimizer trigger */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        {/* Subtle decorative rainbow glow in corner */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-[#00F5D4]/20 via-[#00B8FF]/20 to-[#7B2CBF]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Financial Architecture</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Budget & <span className="rainbow-text">Expense Ledger</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Real-time payment tracking against department allocations with Gemini-powered savings audits and contract alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowOptimizer(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-wider rainbow-bar-bg hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>AI Budget Optimizer</span>
            </button>
            <button
              onClick={() => setIsAddingItem(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl backdrop-blur-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-interactive p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Target Budget
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-white">
            {formatCurrency(event.totalBudget, event.currency)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Ceiling for {event.targetGuestCount} guests
          </span>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Actual Spend
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-cyan-300">
            {formatCurrency(totalActual, event.currency)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {budgetUsagePercent}% of target committed
          </span>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Remaining Runway
          </span>
          <div className={`text-2xl md:text-3xl font-extrabold ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(remainingBudget, event.currency)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {remainingBudget >= 0 ? 'Buffer preserved' : 'Over allocation threshold'}
          </span>
        </div>

        <div className="glass-card-interactive p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Settled Deposits
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-purple-300">
            {formatCurrency(totalPaid, event.currency)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {paidItems.length} of {event.budgetItems.length} lines cleared
          </span>
        </div>
      </div>

      {/* Category Allocation Progress Bars */}
      <div className="glass-panel p-6 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Department Allocations vs Actual Spend</span>
              <span className="text-xs font-normal text-slate-400">({event.budgetCategories.length} categories)</span>
            </h3>
            <p className="text-xs text-slate-400">Click any card to filter expenses below</p>
          </div>
          <div className="text-xs text-slate-300 font-medium">
            Total Allocated: <span className="font-bold text-white">{formatCurrency(totalAllocated, event.currency)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {event.budgetCategories.map(category => {
            const itemsInCategory = event.budgetItems.filter(b => b.categoryId === category.id);
            const spentInCategory = itemsInCategory.reduce((sum, b) => sum + (b.actualCost || 0), 0);
            const percentage = category.allocated > 0 ? Math.min(100, Math.round((spentInCategory / category.allocated) * 100)) : 0;
            const isOver = spentInCategory > category.allocated;
            const isSelected = selectedCategory === category.id;

            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : category.id)}
                className={`p-4 rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-white/[0.12] border border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shadow-xs"
                      style={{ backgroundColor: category.color || '#00F5D4' }}
                    />
                    <span className="text-sm font-bold text-white">{category.name}</span>
                  </div>
                  <span className={`text-xs font-bold ${isOver ? 'text-rose-400' : 'text-slate-300'}`}>
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : 'rainbow-bar-bg'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Spent: <strong className="text-white">{formatCurrency(spentInCategory, event.currency)}</strong></span>
                  <span className="text-slate-400">Limit: {formatCurrency(category.allocated, event.currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Chips & Inline Form */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'rainbow-bar-bg text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/15'
              }`}
            >
              All Categories ({event.budgetItems.length})
            </button>
            {event.budgetCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'rainbow-bar-bg text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/15'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Expense Line</span>
          </button>
        </div>

        {/* Inline Add Expense Form */}
        {isAddingItem && (
          <form
            onSubmit={handleAddItem}
            className="glass-panel p-5 rounded-2xl border border-cyan-400/40 space-y-4 shadow-xl animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Add New Expense Line</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Expense title (e.g. Acoustic Guitarist Deposit)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                >
                  {event.budgetCategories.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Estimated ($)"
                  value={newEstimated}
                  onChange={e => setNewEstimated(e.target.value === '' ? '' : Number(e.target.value))}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white rainbow-bar-bg hover:brightness-110 active:scale-95 shadow-md cursor-pointer"
              >
                Save Expense Line
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Expenses Table in Dark Glass */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Expense Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Estimated</th>
                <th className="py-3.5 px-4 text-right">Actual Cost</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No expense records found in this category.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const cat = event.budgetCategories.find(c => c.id === item.categoryId);
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePaid(item.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            item.isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          }`}
                        >
                          {item.isPaid ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{item.isPaid ? 'Settled' : 'Pending'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {item.title}
                        {item.dueDate && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Due: {item.dueDate}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.08] text-slate-300 border border-white/10">
                          {cat?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-300">
                        {formatCurrency(item.estimatedCost, event.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {formatCurrency(item.actualCost || 0, event.currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Budget Optimizer Modal */}
      {showOptimizer && (
        <AIBudgetOptimizerModal
          event={event}
          onClose={() => setShowOptimizer(false)}
          onApplyOptimizations={(updatedCategories, updatedItems) => {
            onUpdateEvent({
              ...event,
              budgetCategories: updatedCategories,
              budgetItems: updatedItems,
              activityFeed: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: 'Just now',
                  author: 'Gemini AI',
                  role: 'AI Assistant',
                  action: 'Applied smart budget optimizations and contingency balancing.',
                  type: 'budget'
                },
                ...event.activityFeed
              ]
            });
            setShowOptimizer(false);
          }}
        />
      )}
    </div>
  );
});

BudgetSection.displayName = 'BudgetSection';
