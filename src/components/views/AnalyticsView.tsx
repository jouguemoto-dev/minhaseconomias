import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  ArrowRightLeft,
  Calendar
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDateBR, MESES, MESES_ABR } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const {
    currentPeriod,
    setCurrentPeriod,
    transactions,
    categories,
    accounts,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthResult
  } = useFinance();

  const [activeChartTab, setActiveChartTab] = useState<
    'pizza' | 'receitas_despesas' | 'comparativo' | 'extrato'
  >('pizza');

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group current month expenses by category
  const categoryExpenses = useMemo(() => {
    const padMonth = String(currentPeriod.month + 1).padStart(2, '0');
    const prefix = `${currentPeriod.year}-${padMonth}`;
    const map: Record<string, number> = {};

    transactions
      .filter((t) => t.type === 'despesa' && t.date.startsWith(prefix) && t.categoryId)
      .forEach((t) => {
        map[t.categoryId!] = (map[t.categoryId!] || 0) + t.amount;
      });

    const total = Object.values(map).reduce((a, b) => a + b, 0);

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Outras',
          color: cat?.color || '#94A3B8',
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, currentPeriod]);

  // Group income and expenses per month for current year (Jan-Dez)
  const monthlyFlowData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      index: i,
      label: MESES_ABR[i],
      income: 0,
      expense: 0
    }));

    transactions
      .filter((t) => t.date.startsWith(`${currentPeriod.year}-`))
      .forEach((t) => {
        const monthNum = parseInt(t.date.split('-')[1], 10) - 1;
        if (monthNum >= 0 && monthNum < 12) {
          if (t.type === 'receita') {
            months[monthNum].income += t.amount;
          } else if (t.type === 'despesa') {
            months[monthNum].expense += t.amount;
          }
        }
      });

    return months;
  }, [transactions, currentPeriod.year]);

  // Previous month vs current month comparison
  const comparisonData = useMemo(() => {
    const curMonthPad = String(currentPeriod.month + 1).padStart(2, '0');
    const prevMonthIndex = currentPeriod.month === 0 ? 11 : currentPeriod.month - 1;
    const prevYear = currentPeriod.month === 0 ? currentPeriod.year - 1 : currentPeriod.year;
    const prevMonthPad = String(prevMonthIndex + 1).padStart(2, '0');

    const curPrefix = `${currentPeriod.year}-${curMonthPad}`;
    const prevPrefix = `${prevYear}-${prevMonthPad}`;

    const curMap: Record<string, number> = {};
    const prevMap: Record<string, number> = {};

    transactions
      .filter((t) => t.type === 'despesa' && t.categoryId)
      .forEach((t) => {
        if (t.date.startsWith(curPrefix)) {
          curMap[t.categoryId!] = (curMap[t.categoryId!] || 0) + t.amount;
        } else if (t.date.startsWith(prevPrefix)) {
          prevMap[t.categoryId!] = (prevMap[t.categoryId!] || 0) + t.amount;
        }
      });

    const allCatIds = Array.from(new Set([...Object.keys(curMap), ...Object.keys(prevMap)]));

    return allCatIds
      .map((catId) => {
        const cat = categories.find((c) => c.id === catId);
        const curAmt = curMap[catId] || 0;
        const prevAmt = prevMap[catId] || 0;
        const diff = curAmt - prevAmt;
        return {
          id: catId,
          name: cat?.name || 'Outras',
          color: cat?.color || '#94A3B8',
          currentMonth: curAmt,
          previousMonth: prevAmt,
          difference: diff
        };
      })
      .sort((a, b) => b.currentMonth - a.currentMonth);
  }, [transactions, categories, currentPeriod]);

  // Generate SVG Donut slices
  const donutPaths = useMemo(() => {
    let accumulatedAngle = 0;
    const total = categoryExpenses.reduce((acc, c) => acc + c.amount, 0);
    if (total === 0) return [];

    return categoryExpenses.map((cat) => {
      const sliceAngle = (cat.amount / total) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle = endAngle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const rOuter = 85;
      const rInner = 50;
      const cx = 100;
      const cy = 100;

      const x1 = cx + rOuter * Math.cos(startRad);
      const y1 = cy + rOuter * Math.sin(startRad);
      const x2 = cx + rOuter * Math.cos(endRad);
      const y2 = cy + rOuter * Math.sin(endRad);

      const x3 = cx + rInner * Math.cos(endRad);
      const y3 = cy + rInner * Math.sin(endRad);
      const x4 = cx + rInner * Math.cos(startRad);
      const y4 = cy + rInner * Math.sin(startRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      return {
        ...cat,
        pathData
      };
    });
  }, [categoryExpenses]);

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F4C81] to-[#0284C7] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-sky-200">
            <PieIcon className="w-3.5 h-3.5" />
            Inteligência Financeira
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Análise & Relatórios</h1>
          <p className="text-xs text-slate-200 mt-1">
            Visualizações gráficas detalhadas de despesas por categoria, fluxo de caixa e evolução financeira.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Imprimir Relatório
        </button>
      </div>

      {/* Chart Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveChartTab('pizza')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeChartTab === 'pizza'
                ? 'bg-[#0F4C81] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Despesas por Categoria (Pizza)
          </button>

          <button
            onClick={() => setActiveChartTab('receitas_despesas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeChartTab === 'receitas_despesas'
                ? 'bg-[#0F4C81] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Receitas x Despesas (Evolução)
          </button>

          <button
            onClick={() => setActiveChartTab('comparativo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeChartTab === 'comparativo'
                ? 'bg-[#0F4C81] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Comparativo de Períodos
          </button>

          <button
            onClick={() => setActiveChartTab('extrato')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeChartTab === 'extrato'
                ? 'bg-[#0F4C81] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Extrato Consolidado
          </button>
        </div>

        {/* Month Selector for the chart view */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() =>
              setCurrentPeriod((p) => ({
                ...p,
                month: p.month === 0 ? 11 : p.month - 1,
                year: p.month === 0 ? p.year - 1 : p.year
              }))
            }
            className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-slate-800 px-1 font-mono">
            {MESES[currentPeriod.month]} {currentPeriod.year}
          </span>
          <button
            onClick={() =>
              setCurrentPeriod((p) => ({
                ...p,
                month: p.month === 11 ? 0 : p.month + 1,
                year: p.month === 11 ? p.year + 1 : p.year
              }))
            }
            className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab 1: Despesas por Categoria (Pizza / Donut) */}
      {activeChartTab === 'pizza' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="pb-4 border-b border-slate-100 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Distribuição de Despesas em {MESES[currentPeriod.month]} de {currentPeriod.year}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total de gastos no período: <strong className="text-rose-700">{formatCurrency(currentMonthExpense)}</strong>
              </p>
            </div>
          </div>

          {categoryExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma despesa registrada para {MESES[currentPeriod.month]} de {currentPeriod.year}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Donut Chart SVG */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                <svg viewBox="0 0 200 200" className="w-56 h-56 transform -rotate-90">
                  {donutPaths.map((slice) => {
                    const isHovered = hoveredCategory === slice.id;
                    return (
                      <path
                        key={slice.id}
                        d={slice.pathData}
                        fill={slice.color}
                        className="transition-all duration-200 cursor-pointer hover:opacity-80"
                        style={{
                          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                          transformOrigin: '100px 100px'
                        }}
                        onMouseEnter={() => setHoveredCategory(slice.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Center Circle Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {formatCurrency(currentMonthExpense)}
                  </div>
                  <div className="text-[10px] text-slate-400">100%</div>
                </div>
              </div>

              {/* Category Breakdown Legend */}
              <div className="md:col-span-7 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Detalhamento por Categoria
                </div>
                {categoryExpenses.map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredCategory(item.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between text-xs cursor-pointer ${
                      hoveredCategory === item.id
                        ? 'bg-sky-50 border-sky-300'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-slate-400 text-xs">{item.percentage.toFixed(1)}%</span>
                      <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Receitas x Despesas Anual (Evolução) */}
      {activeChartTab === 'receitas_despesas' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Fluxo de Caixa Mensal ({currentPeriod.year})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativo mensal entre Receitas e Despesas ao longo do ano.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span>Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-rose-500" />
                <span>Despesas</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Display */}
          <div className="space-y-3">
            {monthlyFlowData.map((m) => {
              const maxVal = Math.max(
                ...monthlyFlowData.map((d) => Math.max(d.income, d.expense)),
                1000
              );
              const incomeWidth = (m.income / maxVal) * 100;
              const expenseWidth = (m.expense / maxVal) * 100;
              const net = m.income - m.expense;

              return (
                <div key={m.label} className="text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-slate-800 w-10">{m.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-700">+{formatCurrency(m.income)}</span>
                      <span className="text-rose-700">-{formatCurrency(m.expense)}</span>
                      <span
                        className={`w-24 text-right font-bold ${
                          net >= 0 ? 'text-emerald-800' : 'text-rose-800'
                        }`}
                      >
                        {net >= 0 ? '+' : ''}
                        {formatCurrency(net)}
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-md overflow-hidden flex gap-0.5 p-0.5">
                    <div
                      className="bg-emerald-500 h-full rounded-xs transition-all duration-300"
                      style={{ width: `${incomeWidth / 2}%` }}
                      title={`Receita: ${formatCurrency(m.income)}`}
                    />
                    <div
                      className="bg-rose-500 h-full rounded-xs transition-all duration-300"
                      style={{ width: `${expenseWidth / 2}%` }}
                      title={`Despesa: ${formatCurrency(m.expense)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Comparativo de Períodos */}
      {activeChartTab === 'comparativo' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Comparativo de Gastos por Categoria
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Variação de despesas entre o mês selecionado e o mês anterior.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3 text-right">Mês Anterior</th>
                  <th className="py-2.5 px-3 text-right">Mês Atual</th>
                  <th className="py-2.5 px-3 text-right">Variação (R$)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {comparisonData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800 flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatCurrency(item.previousMonth)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.currentMonth)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        item.difference > 0
                          ? 'text-rose-600'
                          : item.difference < 0
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.difference > 0 ? '+' : ''}
                      {formatCurrency(item.difference)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans text-[11px]">
                      {item.difference > 0 ? (
                        <span className="text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                          ↑ Aumento
                        </span>
                      ) : item.difference < 0 ? (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          ↓ Economia
                        </span>
                      ) : (
                        <span className="text-slate-400">- Estável</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Extrato Consolidado Tabular */}
      {activeChartTab === 'extrato' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Relatório Contábil Consolidado
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Extrato oficial das transações de {MESES[currentPeriod.month]} de {currentPeriod.year}.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 font-sans">Total de Entradas:</span>
              <div className="text-lg font-bold text-emerald-700">
                {formatCurrency(currentMonthIncome)}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-sans">Total de Saídas:</span>
              <div className="text-lg font-bold text-rose-700">
                {formatCurrency(currentMonthExpense)}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-sans">Saldo Líquido Gerado:</span>
              <div
                className={`text-lg font-bold ${
                  currentMonthResult >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {currentMonthResult >= 0 ? '+' : ''}
                {formatCurrency(currentMonthResult)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
