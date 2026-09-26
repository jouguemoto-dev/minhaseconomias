import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Check,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types/finance';
import { formatDateBR, parseDateBR } from '../../utils/formatters';

interface InlineTransactionBarProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const InlineTransactionBar: React.FC<InlineTransactionBarProps> = ({
  isOpen,
  onClose,
  defaultDate = '2026-09-26'
}) => {
  const {
    accounts,
    categories,
    addTransaction,
    suggestCategoryForDescription
  } = useFinance();

  const [type, setType] = useState<TransactionType>('despesa');
  const [createRule, setCreateRule] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Field values
  const [date, setDate] = useState(defaultDate);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [consolidated, setConsolidated] = useState(true);

  // More options state
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasInstallments, setHasInstallments] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState(3);
  const [installmentCurrent, setInstallmentCurrent] = useState(1);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
      setTargetAccountId(accounts[1]?.id || accounts[0].id);
    }
  }, [accounts, accountId]);

  if (!isOpen) return null;

  // Auto-category match on description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescription(val);
    if (type !== 'transferencia') {
      const match = suggestCategoryForDescription(val);
      if (match.categoryId) {
        setCategoryId(match.categoryId);
        if (match.subcategoryId) setSubcategoryId(match.subcategoryId);
      }
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (type === 'transferencia' && accountId === targetAccountId) {
      alert('A Conta Destino deve ser diferente da Conta Origem.');
      return;
    }

    addTransaction({
      date,
      description: description.trim() || 'Transação sem descrição',
      amount: numericAmount,
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
    });

    // Reset inputs
    setDescription('');
    setAmount('');
    setNotes('');
    setHasInstallments(false);
    setShowMoreOptions(false);
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="bg-white border-2 border-[#8FA8C0] rounded-lg shadow-md mb-4 text-xs font-sans transition-all overflow-hidden">
      {/* Top Bar matching screenshot */}
      <div className="bg-[#9AB1C7] text-white px-3 py-1 flex flex-wrap items-center justify-between gap-2 border-b border-[#809BB5]">
        {/* Left side: Type Selector Radios */}
        <div className="flex items-center gap-3 font-semibold text-xs text-white">
          <span className="text-slate-800 font-bold hidden sm:inline text-[11px]">
            Adicionar transação:
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-sky-100 select-none">
            <input
              type="radio"
              name="inlineTxType"
              value="despesa"
              checked={type === 'despesa'}
              onChange={() => setType('despesa')}
              className="accent-[#0070BA] cursor-pointer"
            />
            <span>Despesa</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-sky-100 select-none">
            <input
              type="radio"
              name="inlineTxType"
              value="receita"
              checked={type === 'receita'}
              onChange={() => setType('receita')}
              className="accent-[#0070BA] cursor-pointer"
            />
            <span>Receita</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-sky-100 select-none">
            <input
              type="radio"
              name="inlineTxType"
              value="transferencia"
              checked={type === 'transferencia'}
              onChange={() => setType('transferencia')}
              className="accent-[#0070BA] cursor-pointer"
            />
            <span>Transferência</span>
          </label>
        </div>

        {/* Right side: Criar regra + Help & Close buttons */}
        <div className="flex items-center gap-2 text-white">
          <label className="flex items-center gap-1 text-[11px] cursor-pointer opacity-90 hover:opacity-100">
            <input
              type="checkbox"
              checked={createRule}
              onChange={(e) => setCreateRule(e.target.checked)}
              className="accent-[#0070BA] cursor-pointer rounded"
            />
            <span>Criar regra</span>
          </label>

          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-4 h-4 rounded-sm bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
            title="Ajuda sobre a inserção rápida"
          >
            ?
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-4 h-4 rounded-sm bg-white/20 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Help tooltip popup if toggled */}
      {showHelp && (
        <div className="bg-amber-50 p-2.5 border-b border-amber-200 text-[11px] text-amber-900 flex items-start justify-between">
          <div>
            <strong>Dica de uso rápido:</strong> Informe a data, descrição, categoria, conta e valor. Pressione <strong>Enter</strong> ou clique no botão verde com checkmark (<strong>✓</strong>) para salvar imediatamente!
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="text-amber-700 hover:text-amber-950 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Single-line Input Grid exactly like screenshot */}
      <form
        onSubmit={handleSave}
        className="p-2 bg-[#E6EDF2] flex flex-wrap items-center gap-1.5"
      >
        {/* Date Field with Calendar Icon */}
        <div className="relative w-full sm:w-32 min-w-0 shrink-0">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border border-[#A5B8CC] rounded-sm px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070BA] font-mono shadow-2xs"
          />
        </div>

        {/* Description Field */}
        <div className="flex-1 min-w-[150px]">
          <input
            type="text"
            required
            autoFocus
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Transação sem descrição"
            className="w-full bg-white border border-[#A5B8CC] rounded-sm px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0070BA] shadow-2xs"
          />
        </div>

        {/* Category Dropdown (if not transferencia) */}
        {type !== 'transferencia' ? (
          <div className="w-full sm:w-36 min-w-0 shrink-0">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId('');
              }}
              className="w-full bg-white border border-[#A5B8CC] rounded-sm px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070BA] cursor-pointer shadow-2xs"
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
          </div>
        ) : (
          <div className="w-full sm:w-36 min-w-0 shrink-0">
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-white border border-[#A5B8CC] rounded-sm px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070BA] cursor-pointer shadow-2xs"
            >
              <option value="" disabled>Origem (Sai)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Account Dropdown (or Target Account if Transfer) */}
        <div className="w-full sm:w-36 min-w-0 shrink-0">
          <select
            value={type === 'transferencia' ? targetAccountId : accountId}
            onChange={(e) => {
              if (type === 'transferencia') {
                setTargetAccountId(e.target.value);
              } else {
                setAccountId(e.target.value);
              }
            }}
            className="w-full bg-white border border-[#A5B8CC] rounded-sm px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0070BA] cursor-pointer shadow-2xs"
          >
            <option value="" disabled>Selecione Conta</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {type === 'transferencia' ? `Destino: ${acc.name}` : acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Field */}
        <div className="w-full sm:w-24 min-w-0 shrink-0">
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="w-full bg-white border border-[#A5B8CC] rounded-sm px-2 py-1 text-xs text-right font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0070BA] shadow-2xs"
          />
        </div>

        {/* Save Button (Checkmark icon exactly as screenshot) */}
        <button
          type="submit"
          className="w-8 h-7 bg-white hover:bg-emerald-50 text-emerald-700 border border-[#A5B8CC] hover:border-emerald-600 rounded-sm flex items-center justify-center font-bold text-base transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Salvar transação (Enter)"
        >
          ✓
        </button>
      </form>

      {/* "Mais opções ▾" Tab Button placed centrally underneath */}
      <div className="bg-[#E6EDF2] flex justify-center pb-1">
        <button
          type="button"
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="bg-[#9AB1C7] hover:bg-[#869EBA] text-white text-[10px] font-semibold px-3 py-0.5 rounded-b-md flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Mais opções</span>
          {showMoreOptions ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Collapsible Expanded Panel (Notes, Installments, Consolidation) */}
      {showMoreOptions && (
        <div className="p-3 bg-white border-t border-[#A5B8CC] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in">
          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-slate-600 font-semibold mb-1">
              Notas e Observações:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicionar notas sobre comprovante, fornecedor..."
              className="w-full border border-slate-300 rounded p-1.5 text-xs focus:outline-none"
            />
          </div>

          {/* Installments & Status */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={hasInstallments}
                onChange={(e) => setHasInstallments(e.target.checked)}
                className="rounded accent-[#0F4C81]"
              />
              <span>Parcelamento mensal</span>
            </label>

            {hasInstallments && (
              <div className="flex items-center gap-2 text-xs">
                <span>Parcela</span>
                <input
                  type="number"
                  min="1"
                  max={installmentTotal}
                  value={installmentCurrent}
                  onChange={(e) => setInstallmentCurrent(parseInt(e.target.value) || 1)}
                  className="w-12 border border-slate-300 rounded p-1 text-center font-mono"
                />
                <span>de</span>
                <input
                  type="number"
                  min="2"
                  max="48"
                  value={installmentTotal}
                  onChange={(e) => setInstallmentTotal(parseInt(e.target.value) || 2)}
                  className="w-12 border border-slate-300 rounded p-1 text-center font-mono"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium pt-1">
              <input
                type="checkbox"
                checked={consolidated}
                onChange={(e) => setConsolidated(e.target.checked)}
                className="rounded accent-[#0F4C81]"
              />
              <span>Transação já consolidada (C)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
