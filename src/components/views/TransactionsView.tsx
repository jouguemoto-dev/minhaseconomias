import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CheckSquare,
  Square,
  CheckCircle2,
  Trash2,
  Tag,
  ArrowRightLeft,
  Plus,
  Upload,
  Download,
  Filter,
  Layers,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDateBR, MESES, MESES_ABR } from '../../utils/formatters';
import { Transaction } from '../../types/finance';
import { InlineTransactionBar } from '../transactions/InlineTransactionBar';

interface TransactionsViewProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
  onOpenImport,
  onOpenExport
}) => {
  const {
    currentPeriod,
    setCurrentPeriod,
    filteredTransactions,
    accounts,
    categories,
    searchQuery,
    setSearchQuery,
    consolidationFilter,
    setConsolidationFilter,
    typeFilter,
    setTypeFilter,
    bulkConsolidate,
    bulkDelete,
    bulkCategorize,
    deleteTransaction,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthResult
  } = useFinance();

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [selectedBulkCategory, setSelectedBulkCategory] = useState('');
  const [showInlineBar, setShowInlineBar] = useState(true);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentPeriod((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
    setSelectedIds([]);
  };

  const handleNextMonth = () => {
    setCurrentPeriod((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
    setSelectedIds([]);
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentPeriod((prev) => ({ ...prev, month: monthIndex }));
    setSelectedIds([]);
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkConsolidate = (consolidate: boolean) => {
    if (selectedIds.length === 0) return;
    bulkConsolidate(selectedIds, consolidate);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Deseja realmente excluir ${selectedIds.length} transação(ões) selecionada(s)?`)) {
      bulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleApplyBulkCategory = () => {
    if (!selectedBulkCategory || selectedIds.length === 0) return;
    bulkCategorize(selectedIds, selectedBulkCategory);
    setShowBulkCategoryModal(false);
    setSelectedBulkCategory('');
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Month Selector and Global Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
        {/* Month Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 rounded-lg font-bold text-slate-800 text-sm">
              <span>{MESES[currentPeriod.month]}</span>
              <span className="text-[#0F4C81]">{currentPeriod.year}</span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Próximo mês"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Quick Picker Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            {MESES_ABR.map((abbr, index) => {
              const isSelected = currentPeriod.month === index;
              return (
                <button
                  key={abbr}
                  onClick={() => handleSelectMonth(index)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F4C81] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {abbr}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200"
              title="Exportar dados para Excel/PDF"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>

            <button
              onClick={() => setShowInlineBar(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3c66] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Transação
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por descrição ou valor..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F4C81] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={consolidationFilter}
              onChange={(e: any) => setConsolidationFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
            >
              <option value="all">Todas as transações</option>
              <option value="consolidated">Somente Consolidadas (C)</option>
              <option value="unconsolidated">Somente Não Consolidadas</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e: any) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
            >
              <option value="all">Todos os tipos</option>
              <option value="despesa">Somente Despesas</option>
              <option value="receita">Somente Receitas</option>
              <option value="transferencia">Somente Transferências</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when 1+ selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-800 animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-[#0F4C81]">{selectedIds.length}</span>
            <span>linha(s) selecionada(s)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkConsolidate(true)}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
              title="Marcar selecionadas como consolidadas"
            >
              Consolidar
            </button>

            <button
              onClick={() => handleBulkConsolidate(false)}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
              title="Desconsolidar selecionadas"
            >
              Desconsolidar
            </button>

            <button
              onClick={() => setShowBulkCategoryModal(true)}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
              title="Alterar categoria em massa"
            >
              Categorizar
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
              title="Excluir selecionadas"
            >
              Excluir
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-slate-800 text-[11px] underline ml-2 cursor-pointer"
            >
              Cancelar seleção
            </button>
          </div>
        </div>
      )}

      {/* Inline Minimalist Transaction Bar (Exact match to screenshot) */}
      {showInlineBar ? (
        <InlineTransactionBar
          isOpen={showInlineBar}
          onClose={() => setShowInlineBar(false)}
          defaultDate={`${currentPeriod.year}-${String(currentPeriod.month + 1).padStart(2, '0')}-26`}
        />
      ) : (
        <div className="flex items-center justify-between bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors">
          <button
            onClick={() => setShowInlineBar(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0F4C81] hover:underline cursor-pointer"
          >
            <span className="font-mono text-base font-bold">+</span>
            <span>Adicionar transação (Entrada rápida)</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Abrir formulário avançado
          </button>
        </div>
      )}

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 w-8 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={
                      selectedIds.length === filteredTransactions.length
                        ? 'Desmarcar todos'
                        : 'Marcar todos'
                    }
                  >
                    {filteredTransactions.length > 0 &&
                    selectedIds.length === filteredTransactions.length ? (
                      <CheckSquare className="w-3.5 h-3.5 text-[#0F4C81]" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-2 w-10 text-center" title="Status Consolidada">
                  C
                </th>
                <th className="py-2.5 px-3 w-24">Data</th>
                <th className="py-2.5 px-3 min-w-[200px]">Descrição</th>
                <th className="py-2.5 px-3 w-44">Categoria</th>
                <th className="py-2.5 px-3 w-40">Conta</th>
                <th className="py-2.5 px-4 w-32 text-right">Valor</th>
                <th className="py-2.5 px-3 w-20 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Layers className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">
                        Nenhuma transação encontrada
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Altere os filtros ou clique em "Nova Transação" para adicionar lançamentos neste mês.
                      </p>
                      <button
                        onClick={onOpenNewTransaction}
                        className="mt-3 px-3 py-1.5 text-xs font-semibold bg-[#0F4C81] text-white rounded-lg shadow-2xs hover:bg-[#0c3c66] transition-colors cursor-pointer"
                      >
                        + Adicionar Transação
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const subcat = cat?.subcategories.find((s) => s.id === tx.subcategoryId);
                  const sourceAcc = accounts.find((a) => a.id === tx.accountId);
                  const targetAcc = tx.targetAccountId
                    ? accounts.find((a) => a.id === tx.targetAccountId)
                    : null;

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-sky-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelectOne(tx.id)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#0F4C81]" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Consolidada (C) Toggle Button */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => bulkConsolidate([tx.id], !tx.consolidated)}
                          className={`w-5 h-5 rounded font-bold text-[10px] flex items-center justify-center transition-colors cursor-pointer ${
                            tx.consolidated
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-400 border border-slate-300 hover:border-slate-400'
                          }`}
                          title={
                            tx.consolidated
                              ? 'Transação consolidada (clique para desconsolidar)'
                              : 'Transação pendente (clique para consolidar)'
                          }
                        >
                          C
                        </button>
                      </td>

                      {/* Data */}
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {formatDateBR(tx.date)}
                      </td>

                      {/* Descrição */}
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            onClick={() => onEditTransaction(tx)}
                            className="hover:text-[#0F4C81] hover:underline cursor-pointer"
                          >
                            {tx.description}
                          </span>

                          {tx.installment && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1 rounded border border-slate-200">
                              {tx.installment.current}/{tx.installment.total}
                            </span>
                          )}

                          {tx.notes && (
                            <span
                              className="text-[10px] text-slate-400 hover:text-slate-600 cursor-help"
                              title={`Nota: ${tx.notes}`}
                            >
                              📝
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Categoria / Subcategoria */}
                      <td className="py-2.5 px-3 text-slate-600">
                        {tx.type === 'transferencia' ? (
                          <span className="text-slate-400 italic">Transferência</span>
                        ) : cat ? (
                          <div className="flex items-center gap-1.5 truncate">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="truncate">
                              {cat.name}
                              {subcat && (
                                <span className="text-slate-400 text-[11px]">
                                  {' '}
                                  / {subcat.name}
                                </span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sem categoria</span>
                        )}
                      </td>

                      {/* Conta */}
                      <td className="py-2.5 px-3 text-slate-700 truncate">
                        {tx.type === 'transferencia' && targetAcc ? (
                          <div className="flex items-center gap-1 text-[11px] text-sky-800 font-medium">
                            <span className="truncate">{sourceAcc?.name}</span>
                            <ArrowRightLeft className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{targetAcc.name}</span>
                          </div>
                        ) : (
                          <span className="truncate font-medium">{sourceAcc?.name}</span>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            tx.type === 'receita'
                              ? 'text-emerald-700'
                              : tx.type === 'despesa'
                              ? 'text-rose-700'
                              : 'text-sky-700'
                          }
                        >
                          {tx.type === 'receita' ? '+' : tx.type === 'despesa' ? '-' : ''}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-100 rounded cursor-pointer"
                            title="Editar transação"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir a transação "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded cursor-pointer"
                            title="Excluir transação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary Stats */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="text-slate-500">
            Total de <span className="font-bold text-slate-800">{filteredTransactions.length}</span>{' '}
            registro(s) neste filtro
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 mr-1.5 font-sans">Receitas:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(currentMonthIncome)}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-slate-500 mr-1.5 font-sans">Despesas:</span>
              <span className="font-bold text-rose-700">{formatCurrency(currentMonthExpense)}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-slate-500 mr-1.5 font-sans">Resultado:</span>
              <span
                className={`font-bold ${
                  currentMonthResult >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {currentMonthResult >= 0 ? '+' : ''}
                {formatCurrency(currentMonthResult)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Category Modal */}
      {showBulkCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">
                Categorizar {selectedIds.length} Transações
              </h3>
              <button
                onClick={() => setShowBulkCategoryModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Selecione a categoria que deseja atribuir a todas as transações selecionadas:
            </p>

            <select
              value={selectedBulkCategory}
              onChange={(e) => setSelectedBulkCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
            >
              <option value="">-- Selecione uma categoria --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type === 'despesa' ? 'Despesa' : 'Receita'})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setShowBulkCategoryModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={!selectedBulkCategory}
                onClick={handleApplyBulkCategory}
                className="px-4 py-1.5 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0c3c66] disabled:opacity-50 cursor-pointer"
              >
                Aplicar Categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
