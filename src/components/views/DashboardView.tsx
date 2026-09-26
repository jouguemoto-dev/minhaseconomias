import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  PieChart as PieIcon,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDateBR, MESES } from '../../utils/formatters';

interface DashboardViewProps {
  onNavigateTab: (tab: 'transactions' | 'dreams' | 'budget' | 'analytics') => void;
  onOpenNewTransaction: () => void;
  onOpenNewDream: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenNewTransaction,
  onOpenNewDream
}) => {
  const {
    currentPeriod,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthResult,
    filteredTransactions,
    dreams,
    categories,
    accounts,
    bulkConsolidate
  } = useFinance();

  // Upcoming / Unconsolidated transactions
  const pendingTransactions = filteredTransactions
    .filter((t) => !t.consolidated)
    .slice(0, 5);

  // Recent transactions
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Active dreams
  const activeDreams = dreams.filter((d) => !d.completed).slice(0, 3);

  // Group expenses by category for current month
  const categoryExpenses = React.useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === 'despesa' && t.categoryId)
      .forEach((t) => {
        map[t.categoryId!] = (map[t.categoryId!] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([catId, total]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Outras',
          color: cat?.color || '#94A3B8',
          amount: total,
          percentage: currentMonthExpense > 0 ? (total / currentMonthExpense) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories, currentMonthExpense]);

  const monthName = MESES[currentPeriod.month];

  return (
    <div className="space-y-6">
      {/* Welcome & Period Banner */}
      <div className="bg-gradient-to-r from-[#0F4C81] to-[#0284C7] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-sky-200">
            Resumo Financeiro Mensal
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">
            {monthName} de {currentPeriod.year}
          </h1>
          <p className="text-xs text-slate-200 mt-1">
            Acompanhe o fluxo de caixa, despesas essenciais e o progresso dos seus sonhos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('transactions')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            Ver Extrato Completo
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            + Nova Transação
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Entradas Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Receitas do Mês</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatCurrency(currentMonthIncome)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Valores recebidos e previstos em</span>
            <span className="font-semibold text-slate-700">{monthName}</span>
          </div>
        </div>

        {/* Saídas Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Despesas do Mês</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700">
            {formatCurrency(currentMonthExpense)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Gastos fixos, variáveis e parcelas</span>
          </div>
        </div>

        {/* Saldo Líquido Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Resultado do Mês</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#0F4C81] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono ${
              currentMonthResult >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {currentMonthResult >= 0 ? '+' : ''}
            {formatCurrency(currentMonthResult)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {currentMonthResult >= 0
              ? 'Economia positiva gerada neste mês'
              : 'Atenção: despesas superiores às receitas'}
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Próximas & Não Consolidadas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Próximas / Não Consolidadas Widget */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  Próximas Transações & Não Consolidadas
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('transactions')}
                className="text-xs text-[#0F4C81] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                Ver todas
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="font-medium text-slate-700">Todas as transações estão consolidadas!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Não há lançamentos pendentes de confirmação neste período.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingTransactions.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => bulkConsolidate([tx.id], true)}
                          className="w-6 h-6 rounded-md border border-amber-300 bg-amber-50 text-amber-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 flex items-center justify-center font-bold text-[10px] transition-colors cursor-pointer shrink-0"
                          title="Clique para Consolidar esta transação"
                        >
                          C
                        </button>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">
                            {tx.description}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{formatDateBR(tx.date)}</span>
                            <span>·</span>
                            <span>{cat?.name || 'Sem categoria'}</span>
                            <span>·</span>
                            <span className="text-slate-400">{acc?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <div
                          className={`font-bold font-mono ${
                            tx.type === 'receita'
                              ? 'text-emerald-700'
                              : tx.type === 'despesa'
                              ? 'text-rose-700'
                              : 'text-sky-700'
                          }`}
                        >
                          {tx.type === 'receita' ? '+' : tx.type === 'despesa' ? '-' : ''}
                          {formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[10px] text-amber-600 font-medium">Pendente</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Últimas Transações Realizadas */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Últimas Movimentações</h2>
              <button
                onClick={() => onNavigateTab('transactions')}
                className="text-xs text-[#0F4C81] hover:underline font-medium cursor-pointer"
              >
                Gerenciar
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat?.color || '#94A3B8' }}
                      />
                      <div className="truncate">
                        <div className="font-medium text-slate-800">{tx.description}</div>
                        <div className="text-[11px] text-slate-400">{formatDateBR(tx.date)}</div>
                      </div>
                    </div>
                    <div
                      className={`font-mono font-medium ${
                        tx.type === 'receita'
                          ? 'text-emerald-700'
                          : tx.type === 'despesa'
                          ? 'text-rose-700'
                          : 'text-sky-700'
                      }`}
                    >
                      {tx.type === 'receita' ? '+' : tx.type === 'despesa' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sonhos & Maiores Gastos (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Gerenciador de Sonhos Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-800">Gerenciador de Sonhos</h2>
              </div>
              <button
                onClick={() => onNavigateTab('dreams')}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Ver todos ({dreams.length})
              </button>
            </div>

            <div className="mt-3 space-y-3.5">
              {activeDreams.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  <p>Nenhum sonho cadastrado no momento.</p>
                  <button
                    onClick={onOpenNewDream}
                    className="mt-2 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    + Criar primeiro sonho
                  </button>
                </div>
              ) : (
                activeDreams.map((dream) => {
                  const progress = Math.min(100, Math.round((dream.currentSaved / dream.targetAmount) * 100));
                  return (
                    <div
                      key={dream.id}
                      onClick={() => onNavigateTab('dreams')}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{dream.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Previsão: {formatDateBR(dream.targetDate)}
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-emerald-700">
                          {progress}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2.5">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                        <span>Juntei: {formatCurrency(dream.currentSaved)}</span>
                        <span>Meta: {formatCurrency(dream.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Maiores Despesas por Categoria Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#0F4C81]" />
                <h2 className="text-sm font-bold text-slate-800">Despesas por Categoria</h2>
              </div>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-xs text-[#0F4C81] hover:underline font-semibold cursor-pointer"
              >
                Gráfico Completo
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {categoryExpenses.slice(0, 5).map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <div className="font-mono font-medium text-slate-800">
                      {formatCurrency(item.amount)}
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, item.percentage)}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
