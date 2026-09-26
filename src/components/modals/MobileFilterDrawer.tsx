import React, { useState } from 'react';
import {
  X,
  Landmark,
  Layers,
  CreditCard,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Plus
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewAccount: (tab?: 'conta' | 'cartao') => void;
  onOpenNewCategory: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  onOpenNewAccount,
  onOpenNewCategory
}) => {
  const {
    accounts,
    categories,
    selectedAccountIds,
    setSelectedAccountIds,
    selectedCategoryIds,
    setSelectedCategoryIds
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'contas' | 'categorias'>('contas');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const bankAccounts = accounts.filter((a) => a.type !== 'cartao');
  const creditCards = accounts.filter((a) => a.type === 'cartao');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex flex-col justify-end md:hidden animate-in fade-in">
      <div className="bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 max-h-[85vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-800">Filtros de Exibição</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Contas and Categorias */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('contas')}
            className={`py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'contas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            Contas & Cartões ({selectedAccountIds.length > 0 ? selectedAccountIds.length : 'Todas'})
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'categorias' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Categorias ({selectedCategoryIds.length > 0 ? selectedCategoryIds.length : 'Todas'})
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-3 py-1 max-h-80">
          {activeTab === 'contas' ? (
            <div className="space-y-3">
              {/* Contas Bancárias */}
              <div>
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    Contas Bancárias
                  </span>
                  {selectedAccountIds.length > 0 && (
                    <button
                      onClick={() => setSelectedAccountIds([])}
                      className="text-[#0F4C81] text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Limpar Filtro
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {bankAccounts.map((acc) => {
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => toggleAccount(acc.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-50 border-sky-300'
                            : 'border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-slate-400">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#0F4C81]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: acc.color }}
                          />
                          <span className="font-semibold text-slate-800">{acc.name}</span>
                        </div>

                        <div className="font-mono font-medium text-slate-700">
                          {formatCurrency(acc.currentBalance)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cartões de Crédito */}
              <div>
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="text-purple-700 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Cartões de Crédito
                  </span>
                </div>

                <div className="space-y-1.5">
                  {creditCards.map((card) => {
                    const isSelected = selectedAccountIds.includes(card.id);
                    return (
                      <div
                        key={card.id}
                        onClick={() => toggleAccount(card.id)}
                        className={`p-3 rounded-xl border flex flex-col gap-1 text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-purple-50/70 border-purple-300'
                            : 'border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-slate-400">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: card.color }}
                            />
                            <span className="font-semibold text-slate-800">{card.name}</span>
                          </div>

                          <div className="font-mono font-bold text-rose-600">
                            {formatCurrency(card.currentBalance)}
                          </div>
                        </div>

                        {card.creditLimit && (
                          <div className="pl-7 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>Limite: {formatCurrency(card.creditLimit)}</span>
                            {card.dueDay && <span>Vence dia {card.dueDay}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenNewAccount('conta');
                  }}
                  className="py-2.5 border border-dashed border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Conta
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenNewAccount('cartao');
                  }}
                  className="py-2.5 border border-dashed border-purple-300 text-purple-700 bg-purple-50/40 rounded-xl text-xs font-semibold hover:bg-purple-100/50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  + Cartão
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="text-slate-500 font-medium">Categorias de Despesas e Receitas</span>
                {selectedCategoryIds.length > 0 && (
                  <button
                    onClick={() => setSelectedCategoryIds([])}
                    className="text-[#0F4C81] text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpar Filtro
                  </button>
                )}
              </div>

              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                const isExpanded = !!expandedCategories[cat.id];
                const hasSubs = cat.subcategories && cat.subcategories.length > 0;

                return (
                  <div key={cat.id} className="border border-slate-100 rounded-xl overflow-hidden">
                    <div
                      className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 flex-1"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <div className="text-slate-400">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#0F4C81]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-slate-800">{cat.name}</span>
                      </div>

                      {hasSubs && (
                        <button
                          onClick={() => toggleExpand(cat.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {isExpanded && hasSubs && (
                      <div className="bg-slate-50/70 p-2 pl-8 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                        {cat.subcategories.map((sub) => (
                          <div key={sub.id} className="py-1">
                            • {sub.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => {
                  onClose();
                  onOpenNewCategory();
                }}
                className="w-full mt-2 py-2.5 border border-dashed border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Adicionar Nova Categoria
              </button>
            </div>
          )}
        </div>

        {/* Bottom Apply Action */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#0F4C81] text-white font-bold rounded-xl text-xs shadow-xs hover:bg-[#0c3c66] transition-colors cursor-pointer"
          >
            Aplicar Filtros e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
