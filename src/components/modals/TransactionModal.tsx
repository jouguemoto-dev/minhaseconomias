import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit
}) => {
  const {
    accounts,
    categories,
    addTransaction,
    updateTransaction,
    suggestCategoryForDescription
  } = useFinance();

  const [type, setType] = useState<TransactionType>('despesa');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-09-26');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState(accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [consolidated, setConsolidated] = useState(true);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasInstallments, setHasInstallments] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState(3);
  const [installmentCurrent, setInstallmentCurrent] = useState(1);
  const [suggestedCatName, setSuggestedCatName] = useState<string | null>(null);

  // Initialize form when opened or edited
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString());
      setDate(transactionToEdit.date);
      setAccountId(transactionToEdit.accountId);
      setTargetAccountId(transactionToEdit.targetAccountId || accounts[1]?.id || '');
      setCategoryId(transactionToEdit.categoryId || '');
      setSubcategoryId(transactionToEdit.subcategoryId || '');
      setConsolidated(transactionToEdit.consolidated);
      setNotes(transactionToEdit.notes || '');
      if (transactionToEdit.installment) {
        setHasInstallments(true);
        setInstallmentCurrent(transactionToEdit.installment.current);
        setInstallmentTotal(transactionToEdit.installment.total);
        setShowMoreOptions(true);
      } else {
        setHasInstallments(false);
      }
    } else {
      setType('despesa');
      setDescription('');
      setAmount('');
      setDate('2026-09-26');
      setAccountId(accounts[0]?.id || '');
      setTargetAccountId(accounts[1]?.id || '');
      setCategoryId('');
      setSubcategoryId('');
      setConsolidated(true);
      setNotes('');
      setHasInstallments(false);
      setShowMoreOptions(false);
      setSuggestedCatName(null);
    }
  }, [transactionToEdit, isOpen, accounts]);

  // Handle Description change & Rule Auto-Suggestion
  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (!transactionToEdit && type !== 'transferencia') {
      const suggestion = suggestCategoryForDescription(text);
      if (suggestion.categoryId) {
        setCategoryId(suggestion.categoryId);
        if (suggestion.subcategoryId) {
          setSubcategoryId(suggestion.subcategoryId);
        }
        const matched = categories.find((c) => c.id === suggestion.categoryId);
        setSuggestedCatName(matched?.name || null);
      } else {
        setSuggestedCatName(null);
      }
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    if (type === 'transferencia' && accountId === targetAccountId) {
      alert('A Conta de destino deve ser diferente da Conta de origem.');
      return;
    }

    const payload: Omit<Transaction, 'id'> = {
      description: description.trim() || 'Transação sem descrição',
      amount: val,
      date,
      type,
      accountId,
      targetAccountId: type === 'transferencia' ? targetAccountId : undefined,
      categoryId: type !== 'transferencia' ? categoryId || undefined : undefined,
      subcategoryId: type !== 'transferencia' ? subcategoryId || undefined : undefined,
      consolidated,
      notes: notes.trim() || undefined,
      installment:
        hasInstallments && installmentTotal > 1
          ? { current: installmentCurrent, total: installmentTotal }
          : undefined
    };

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3 z-50 animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-3xl w-full overflow-hidden text-xs">
        {/* Top Header Row with Title + Type Radio Switcher + Close */}
        <div className="bg-[#9AB1C7] text-white px-3 py-1.5 flex items-center justify-between gap-2 border-b border-[#809BB5]">
          <div className="font-bold text-xs shrink-0">
            {transactionToEdit ? 'Editar Transação' : 'Nova Transação'}
          </div>

          {/* Minimalist Horizontal Type Selector */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-semibold">
            <label className="flex items-center gap-1 cursor-pointer hover:text-sky-100 select-none">
              <input
                type="radio"
                name="modalTxType"
                value="despesa"
                checked={type === 'despesa'}
                onChange={() => setType('despesa')}
                className="accent-[#0F4C81] cursor-pointer"
              />
              <span>Despesa</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer hover:text-sky-100 select-none">
              <input
                type="radio"
                name="modalTxType"
                value="receita"
                checked={type === 'receita'}
                onChange={() => setType('receita')}
                className="accent-[#0F4C81] cursor-pointer"
              />
              <span>Receita</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer hover:text-sky-100 select-none">
              <input
                type="radio"
                name="modalTxType"
                value="transferencia"
                checked={type === 'transferencia'}
                onChange={() => setType('transferencia')}
                className="accent-[#0F4C81] cursor-pointer"
              />
              <span>Transferência</span>
            </label>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-4 h-4 rounded hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shrink-0"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Minimalist Grid Container (Ultra-compact) */}
        <form onSubmit={handleSubmit} className="p-2 sm:p-2.5 bg-[#EAF0F5] space-y-1.5">
          {/* Row 1: Data, Descrição, Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-2 items-end">
            {/* Date Field */}
            <div className="sm:col-span-3 min-w-0">
              <label className="block text-[10px] font-semibold text-slate-700 mb-0.5 tracking-tight">
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-7 bg-white border border-[#A5B8CC] rounded-sm px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-[#0F4C81] font-mono shadow-2xs"
              />
            </div>

            {/* Description Field */}
            <div className="sm:col-span-6 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-semibold text-slate-700 tracking-tight">Descrição *</label>
                {suggestedCatName && (
                  <span className="text-[9px] text-emerald-800 font-semibold flex items-center gap-0.5 truncate ml-1">
                    <Sparkles className="w-2.5 h-2.5 shrink-0" />
                    Regra: {suggestedCatName}
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                autoFocus
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Ex: Supermercado, Aluguel, Salário, Uber..."
                className="w-full h-7 bg-white border border-[#A5B8CC] rounded-sm px-2 py-0.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F4C81] shadow-2xs"
              />
            </div>

            {/* Amount Field */}
            <div className="sm:col-span-3 min-w-0">
              <label className="block text-[10px] font-semibold text-slate-700 mb-0.5 tracking-tight">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full h-7 bg-white border border-[#A5B8CC] rounded-sm px-2 py-0.5 text-xs text-right font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F4C81] shadow-2xs"
              />
            </div>
          </div>

          {/* Row 2: Categoria, Conta/Cartão, Status Consolidada */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-2 items-end">
            {/* Category Field (or Origin if Transfer) */}
            <div className="sm:col-span-5 min-w-0">
              <label className="block text-[10px] font-semibold text-slate-700 mb-0.5 truncate tracking-tight">
                {type === 'transferencia' ? 'Conta Origem (Sai)' : 'Categoria'}
              </label>
              {type !== 'transferencia' ? (
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                  className="w-full h-7 bg-white border border-[#A5B8CC] rounded-sm px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-[#0F4C81] shadow-2xs"
                >
                  <option value="">Sem Categoria</option>
                  {categories
                    .filter((c) => c.type === type)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              ) : (
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full h-7 bg-white border border-[#A5B8CC] rounded-sm px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-[#0F4C81] shadow-2xs"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Account Field (or Target if Transfer) */}
            <div className="sm:col-span-4 min-w-0">
              <label className="block text-[10px] font-semibold text-slate-700 mb-0.5 truncate tracking-tight">
                {type === 'transferencia' ? 'Conta Destino (Entra)' : 'Conta / Cartão *'}
              </label>
              <select
                value={type === 'transferencia' ? targetAccountId : accountId}
                onChange={(e) => {
                  if (type === 'transferencia') {
                    setTargetAccountId(e.target.value);
                  } else {
                    setAccountId(e.target.value);
                  }
                }}
                className="w-full h-7 bg-white border border-[#A5B8CC] rounded-sm px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-[#0F4C81] shadow-2xs"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.type === 'cartao' ? `💳 ${acc.name}` : acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Consolidated (C) Quick Toggle Button */}
            <div className="sm:col-span-3 min-w-0">
              <label className="block text-[10px] font-semibold text-slate-700 mb-0.5 tracking-tight">
                Status
              </label>
              <button
                type="button"
                onClick={() => setConsolidated(!consolidated)}
                className={`w-full h-7 px-2 rounded-sm font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer border shadow-2xs ${
                  consolidated
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                    : 'bg-white text-slate-500 border-[#A5B8CC] hover:bg-slate-100'
                }`}
                title={consolidated ? 'Transação já consolidada no extrato' : 'Transação pendente'}
              >
                <Check className={`w-3 h-3 ${consolidated ? 'text-emerald-700' : 'text-slate-300'}`} />
                <span className="truncate">
                  {consolidated ? 'Consolidada (C)' : 'Pendente'}
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Subcategory / Installments / Notes panel */}
          {showMoreOptions && (
            <div className="p-2 bg-white rounded border border-[#BACAD9] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs animate-in fade-in">
              {/* Subcategory */}
              {type !== 'transferencia' && selectedCategoryObj && selectedCategoryObj.subcategories.length > 0 && (
                <div className="min-w-0">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Subcategoria:
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full h-7 border border-slate-300 rounded px-2 py-0.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="">Nenhuma subcategoria</option>
                    {selectedCategoryObj.subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Installments */}
              <div className="min-w-0 space-y-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 text-[11px]">
                  <input
                    type="checkbox"
                    checked={hasInstallments}
                    onChange={(e) => setHasInstallments(e.target.checked)}
                    className="rounded accent-[#0F4C81]"
                  />
                  <span>Parcelamento</span>
                </label>

                {hasInstallments && (
                  <div className="flex items-center gap-1 text-[10px] pt-0.5">
                    <span>Parcela</span>
                    <input
                      type="number"
                      min="1"
                      max={installmentTotal}
                      value={installmentCurrent}
                      onChange={(e) => setInstallmentCurrent(parseInt(e.target.value) || 1)}
                      className="w-10 h-6 border border-slate-300 rounded p-0.5 text-center font-mono"
                    />
                    <span>de</span>
                    <input
                      type="number"
                      min="2"
                      max="48"
                      value={installmentTotal}
                      onChange={(e) => setInstallmentTotal(parseInt(e.target.value) || 2)}
                      className="w-10 h-6 border border-slate-300 rounded p-0.5 text-center font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="min-w-0 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  Notas / Observações:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observação opcional..."
                  className="w-full h-7 border border-slate-300 rounded px-2 py-0.5 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Bottom Bar: "Mais opções" on left + Actions on right */}
          <div className="flex items-center justify-between pt-1 border-t border-[#D5E1EB]">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-[10px] font-semibold text-[#0F4C81] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {showMoreOptions ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Menos opções
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Mais opções (Parcelas, Notas, Subcategoria)
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 h-7 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded text-[11px] font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-3 py-1 h-7 bg-[#0F4C81] hover:bg-[#0c3c66] text-white rounded text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
              >
                {transactionToEdit ? 'Salvar Alterações' : 'Adicionar Transação'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
