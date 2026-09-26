import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  CreditCard,
  Plus,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckSquare,
  Square,
  RotateCcw
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

interface SidebarFilterProps {
  onOpenNewAccount: (tab?: 'conta' | 'cartao') => void;
  onOpenNewCategory: () => void;
}

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  onOpenNewAccount,
  onOpenNewCategory
}) => {
  const {
    accounts,
    categories,
    selectedAccountIds,
    setSelectedAccountIds,
    selectedCategoryIds,
    setSelectedCategoryIds,
    totalGeneralBalance,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthResult
  } = useFinance();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAddMenu, setShowAddMenu] = useState(false);

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const clearAccountFilters = () => setSelectedAccountIds([]);
  const clearCategoryFilters = () => setSelectedCategoryIds([]);

  const bankAccounts = accounts.filter((a) => a.type !== 'cartao');
  const creditCards = accounts.filter((a) => a.type === 'cartao');

  return (
    <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col gap-4">
      {/* Resumo Financeiro Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Patrimônio & Saldos
          </span>
          <span className="text-[11px] font-medium text-slate-400">Total Consolidado</span>
        </div>
        <div className="mt-3">
          <div className="text-xs text-slate-500">Saldo Geral de Todas as Contas</div>
          <div className="text-xl font-bold font-mono text-slate-900 tracking-tight">
            {formatCurrency(totalGeneralBalance)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100/60">
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <TrendingUp className="w-3 h-3" />
              Entradas Mês
            </div>
            <div className="font-semibold font-mono text-emerald-800 mt-0.5 text-xs">
              {formatCurrency(currentMonthIncome)}
            </div>
          </div>
          <div className="bg-rose-50/60 p-2 rounded-lg border border-rose-100/60">
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-700">
              <TrendingDown className="w-3 h-3" />
              Saídas Mês
            </div>
            <div className="font-semibold font-mono text-rose-800 mt-0.5 text-xs">
              {formatCurrency(currentMonthExpense)}
            </div>
          </div>
        </div>

        <div className="mt-2 text-[11px] flex justify-between items-center px-1 text-slate-600">
          <span>Resultado do período:</span>
          <span
            className={`font-semibold font-mono ${
              currentMonthResult >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {currentMonthResult >= 0 ? '+' : ''}
            {formatCurrency(currentMonthResult)}
          </span>
        </div>
      </div>

      {/* Contas e Cartões Panel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Contas</span>
            {selectedAccountIds.length > 0 && (
              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-medium">
                {selectedAccountIds.length} ativa(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {selectedAccountIds.length > 0 && (
              <button
                onClick={clearAccountFilters}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline cursor-pointer"
                title="Limpar filtros de contas"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Limpar
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Adicionar conta ou cartão"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {showAddMenu && (
                <div
                  className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in text-xs"
                  onMouseLeave={() => setShowAddMenu(false)}
                >
                  <button
                    onClick={() => {
                      setShowAddMenu(false);
                      onOpenNewAccount('conta');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Landmark className="w-3.5 h-3.5 text-[#0F4C81]" />
                    Nova Conta Bancária
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMenu(false);
                      onOpenNewAccount('cartao');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium border-t border-slate-100"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                    Novo Cartão de Crédito
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-2 space-y-3 max-h-96 overflow-y-auto">
          {/* Section 1: Contas Bancárias & Carteira */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 mb-1">
              Contas Bancárias
            </div>
            <div className="space-y-1">
              {bankAccounts.map((acc) => {
                const isSelected = selectedAccountIds.includes(acc.id);
                return (
                  <div
                    key={acc.id}
                    onClick={() => toggleAccountSelection(acc.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-50 border border-sky-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button className="text-slate-400 hover:text-slate-700 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#0F4C81]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: acc.color }}
                      />
                      <div className="truncate font-medium text-slate-800" title={acc.name}>
                        {acc.name}
                      </div>
                    </div>
                    <div
                      className={`font-mono text-right shrink-0 ml-2 font-medium ${
                        acc.currentBalance < 0 ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {formatCurrency(acc.currentBalance)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Cartões de Crédito */}
          <div>
            <div className="flex items-center justify-between px-2 py-0.5 mb-1 text-[10px] font-bold text-purple-800 uppercase tracking-wider bg-purple-50 rounded">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-purple-600" />
                Cartões de Crédito
              </span>
              <button
                onClick={() => onOpenNewAccount('cartao')}
                className="text-purple-600 hover:text-purple-900 font-bold hover:underline cursor-pointer"
                title="Cadastrar novo cartão"
              >
                + Cartão
              </button>
            </div>

            <div className="space-y-1">
              {creditCards.length === 0 ? (
                <div className="text-center py-2 text-[11px] text-slate-400">
                  Nenhum cartão cadastrado.{' '}
                  <button
                    onClick={() => onOpenNewAccount('cartao')}
                    className="text-purple-600 font-bold hover:underline cursor-pointer"
                  >
                    Criar Cartão
                  </button>
                </div>
              ) : (
                creditCards.map((card) => {
                  const isSelected = selectedAccountIds.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleAccountSelection(card.id)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition-colors border ${
                        isSelected
                          ? 'bg-purple-50/70 border-purple-200'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <button className="text-slate-400 hover:text-slate-700 shrink-0">
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-300" />
                            )}
                          </button>
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: card.color }}
                          />
                          <div className="truncate font-medium text-slate-800" title={card.name}>
                            {card.name}
                          </div>
                        </div>

                        {/* Current Invoice Amount */}
                        <div className="font-mono text-right shrink-0 ml-2 font-bold text-rose-600">
                          {formatCurrency(card.currentBalance)}
                        </div>
                      </div>

                      {/* Card meta (Limit & Due Day) */}
                      {card.creditLimit && (
                        <div className="mt-1 pl-6 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Limite: {formatCurrency(card.creditLimit)}</span>
                          {card.dueDay && <span>Vence dia {card.dueDay}</span>}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categorias Panel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Categorias
            </span>
            {selectedCategoryIds.length > 0 && (
              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-medium">
                {selectedCategoryIds.length} ativa(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {selectedCategoryIds.length > 0 && (
              <button
                onClick={clearCategoryFilters}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline cursor-pointer"
                title="Limpar filtros de categorias"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Limpar
              </button>
            )}
            <button
              onClick={onOpenNewCategory}
              className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Cadastrar nova categoria"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            const isExpanded = !!expandedCategories[cat.id];
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;

            return (
              <div key={cat.id} className="text-xs">
                <div
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSelected ? 'bg-sky-50 border border-sky-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="flex items-center gap-1.5 min-w-0 flex-1"
                    onClick={() => toggleCategorySelection(cat.id)}
                  >
                    <button className="text-slate-400 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#0F4C81]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </button>
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate font-medium text-slate-800">{cat.name}</span>
                  </div>

                  {hasSubs && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandCategory(cat.id);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                      title={isExpanded ? 'Recolher subcategorias' : 'Expandir subcategorias'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {isExpanded && hasSubs && (
                  <div className="ml-6 pl-2 border-l border-slate-200 mt-1 space-y-0.5">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="py-1 px-1.5 text-[11px] text-slate-600 rounded hover:bg-slate-100 flex items-center justify-between"
                      >
                        <span className="truncate">{sub.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
