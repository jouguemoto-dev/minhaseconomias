import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Edit2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, MESES } from '../../utils/formatters';

export const BudgetView: React.FC = () => {
  const {
    categories,
    transactions,
    budget,
    currentPeriod,
    setCurrentPeriod,
    updateBudgetMonth,
    setBudgetForAllMonths
  } = useFinance();

  const [budgetMode, setBudgetMode] = useState<'monthly' | 'annual'>('monthly');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [applyToAllMonths, setApplyToAllMonths] = useState(true);

  const expenseCategories = useMemo(() => {
    return categories.filter((c) => c.type === 'despesa');
  }, [categories]);

  // Calculate actual spending (Realizado) per category for current selected month
  const currentMonthRealized = useMemo(() => {
    const padMonth = String(currentPeriod.month + 1).padStart(2, '0');
    const prefix = `${currentPeriod.year}-${padMonth}`;
    const map: Record<string, number> = {};

    transactions
      .filter((t) => t.type === 'despesa' && t.date.startsWith(prefix) && t.categoryId)
      .forEach((t) => {
        map[t.categoryId!] = (map[t.categoryId!] || 0) + t.amount;
      });

    return map;
  }, [transactions, currentPeriod]);

  // Calculate actual spending (Realizado) per category for the whole year
  const annualRealized = useMemo(() => {
    const prefix = `${currentPeriod.year}-`;
    const map: Record<string, number> = {};

    transactions
      .filter((t) => t.type === 'despesa' && t.date.startsWith(prefix) && t.categoryId)
      .forEach((t) => {
        map[t.categoryId!] = (map[t.categoryId!] || 0) + t.amount;
      });

    return map;
  }, [transactions, currentPeriod.year]);

  // Total Planned and Realized
  const { totalPlannedMonth, totalRealizedMonth, totalPlannedYear, totalRealizedYear } = useMemo(() => {
    let planMonth = 0;
    let realMonth = 0;
    let planYear = 0;
    let realYear = 0;

    expenseCategories.forEach((cat) => {
      const bItem = budget.find((b) => b.categoryId === cat.id);
      const plannedForThisMonth = bItem?.plannedMonthly?.[currentPeriod.month] || 0;
      const actualForThisMonth = currentMonthRealized[cat.id] || 0;

      const plannedForYear = (bItem?.plannedMonthly || []).reduce((a, b) => a + b, 0);
      const actualForYear = annualRealized[cat.id] || 0;

      planMonth += plannedForThisMonth;
      realMonth += actualForThisMonth;
      planYear += plannedForYear;
      realYear += actualForYear;
    });

    return {
      totalPlannedMonth: planMonth,
      totalRealizedMonth: realMonth,
      totalPlannedYear: planYear,
      totalRealizedYear: realYear
    };
  }, [expenseCategories, budget, currentPeriod.month, currentMonthRealized, annualRealized]);

  const handleOpenEdit = (categoryId: string) => {
    const bItem = budget.find((b) => b.categoryId === categoryId);
    const currentVal = bItem?.plannedMonthly?.[currentPeriod.month] || 0;
    setEditingCategoryId(categoryId);
    setEditValue(currentVal.toString());
    setApplyToAllMonths(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryId) return;
    const amount = parseFloat(editValue.replace(',', '.'));
    if (isNaN(amount) || amount < 0) return;

    if (applyToAllMonths) {
      setBudgetForAllMonths(editingCategoryId, amount);
    } else {
      updateBudgetMonth(editingCategoryId, currentPeriod.month, amount);
    }

    setEditingCategoryId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F4C81] to-[#1E3A8A] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-sky-200">
            <CalendarDays className="w-3.5 h-3.5" />
            Controle Orçamentário
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Orçamento Planejado</h1>
          <p className="text-xs text-slate-200 mt-1">
            Compare o valor previsto com os gastos realizados em cada categoria e evite imprevistos.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl backdrop-blur-xs self-start md:self-auto">
          <button
            onClick={() => setBudgetMode('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              budgetMode === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            Orçamento Mensal
          </button>
          <button
            onClick={() => setBudgetMode('annual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              budgetMode === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            Orçamento Anual
          </button>
        </div>
      </div>

      {/* Month / Year Navigator */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {budgetMode === 'monthly' ? (
            <>
              <button
                onClick={() =>
                  setCurrentPeriod((p) => ({
                    ...p,
                    month: p.month === 0 ? 11 : p.month - 1,
                    year: p.month === 0 ? p.year - 1 : p.year
                  }))
                }
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="font-bold text-sm text-slate-800 px-2 font-mono">
                {MESES[currentPeriod.month]} de {currentPeriod.year}
              </div>

              <button
                onClick={() =>
                  setCurrentPeriod((p) => ({
                    ...p,
                    month: p.month === 11 ? 0 : p.month + 1,
                    year: p.month === 11 ? p.year + 1 : p.year
                  }))
                }
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="font-bold text-sm text-slate-800 px-2 font-mono">
              Ano de {currentPeriod.year}
            </div>
          )}
        </div>

        {/* Global Summary */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-slate-400 mr-1.5 font-sans">Total Previsto:</span>
            <span className="font-bold text-slate-800">
              {formatCurrency(budgetMode === 'monthly' ? totalPlannedMonth : totalPlannedYear)}
            </span>
          </div>
          <span className="text-slate-200">|</span>
          <div>
            <span className="text-slate-400 mr-1.5 font-sans">Total Realizado:</span>
            <span className="font-bold text-rose-700">
              {formatCurrency(budgetMode === 'monthly' ? totalRealizedMonth : totalRealizedYear)}
            </span>
          </div>
          <span className="text-slate-200">|</span>
          <div>
            <span className="text-slate-400 mr-1.5 font-sans">Diferença / Saldo:</span>
            {(() => {
              const diff =
                budgetMode === 'monthly'
                  ? totalPlannedMonth - totalRealizedMonth
                  : totalPlannedYear - totalRealizedYear;
              return (
                <span className={`font-bold ${diff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {diff >= 0 ? '+' : ''}
                  {formatCurrency(diff)}
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Categories Budget Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Categorias de Despesa ({expenseCategories.length})
          </h2>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Clique no ícone de lápis para ajustar o teto da categoria
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {expenseCategories.map((cat) => {
            const bItem = budget.find((b) => b.categoryId === cat.id);
            const planned =
              budgetMode === 'monthly'
                ? bItem?.plannedMonthly?.[currentPeriod.month] || 0
                : (bItem?.plannedMonthly || []).reduce((a, b) => a + b, 0);

            const realized =
              budgetMode === 'monthly'
                ? currentMonthRealized[cat.id] || 0
                : annualRealized[cat.id] || 0;

            const percentage = planned > 0 ? (realized / planned) * 100 : realized > 0 ? 100 : 0;
            const remaining = planned - realized;
            const isExceeded = realized > planned && planned > 0;
            const isWarning = percentage >= 85 && percentage <= 100;

            return (
              <div
                key={cat.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Category Info */}
                <div className="min-w-[200px] flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span>{cat.name}</span>
                      <button
                        onClick={() => handleOpenEdit(cat.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                        title="Editar teto orçamentário"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {cat.subcategories.length} subcategorias associadas
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-mono">
                      Gasto: <strong className="text-slate-800">{formatCurrency(realized)}</strong> de{' '}
                      {formatCurrency(planned)}
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        isExceeded
                          ? 'text-rose-600'
                          : isWarning
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Financial Balances */}
                <div className="text-right shrink-0 min-w-[140px] text-xs font-mono">
                  {isExceeded ? (
                    <div>
                      <div className="font-bold text-rose-600 flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Estourado em {formatCurrency(Math.abs(remaining))}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">Acima do teto previsto</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-emerald-700">
                        Resta {formatCurrency(remaining)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">Disponível para gastar</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {editingCategoryId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">
                Definir Orçamento:{' '}
                {categories.find((c) => c.id === editingCategoryId)?.name}
              </h3>
              <button
                onClick={() => setEditingCategoryId(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Valor Previsto Mensal (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Ex: 1500.00"
                  className="w-full text-base font-bold font-mono border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToAllMonths}
                    onChange={(e) => setApplyToAllMonths(e.target.checked)}
                    className="rounded text-[#0F4C81]"
                  />
                  <span>Aplicar este mesmo valor para todos os 12 meses do ano</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategoryId(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0c3c66] cursor-pointer shadow-xs"
                >
                  Salvar Teto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
