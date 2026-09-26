import React, { useState, useEffect } from 'react';
import { X, Target, Sparkles, Calendar, DollarSign, Percent } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Dream } from '../../types/finance';
import {
  formatCurrency,
  calculateMonthsDifference,
  calculateRequiredMonthlySaving
} from '../../utils/formatters';

interface DreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  dreamToEdit?: Dream | null;
}

export const DreamModal: React.FC<DreamModalProps> = ({ isOpen, onClose, dreamToEdit }) => {
  const { addDream, updateDream } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [monthlyYieldRate, setMonthlyYieldRate] = useState('0.85');
  const [category, setCategory] = useState('Viagens & Turismo');

  const categoriesPreset = [
    'Viagens & Turismo',
    'Bens & Imóveis',
    'Veículos',
    'Segurança Financeira',
    'Educação & Carreira',
    'Casamento / Família',
    'Aposentadoria / Liberdade',
    'Outros'
  ];

  useEffect(() => {
    if (dreamToEdit) {
      setTitle(dreamToEdit.title);
      setTargetAmount(dreamToEdit.targetAmount.toString());
      setCurrentSaved(dreamToEdit.currentSaved.toString());
      setStartDate(dreamToEdit.startDate);
      setTargetDate(dreamToEdit.targetDate);
      setMonthlyYieldRate(dreamToEdit.monthlyYieldRate.toString());
      setCategory(dreamToEdit.category);
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentSaved('0');
      setStartDate('2026-09-26');
      setTargetDate('2027-12-31');
      setMonthlyYieldRate('0.85');
      setCategory('Viagens & Turismo');
    }
  }, [dreamToEdit, isOpen]);

  // Live calculation of needed monthly contribution
  const parsedTarget = parseFloat(targetAmount.replace(',', '.')) || 0;
  const parsedSaved = parseFloat(currentSaved.replace(',', '.')) || 0;
  const parsedYield = parseFloat(monthlyYieldRate.replace(',', '.')) || 0;
  const monthsDiff = calculateMonthsDifference(startDate, targetDate);
  const calculatedMonthlySaving = calculateRequiredMonthlySaving(
    parsedTarget,
    parsedSaved,
    monthsDiff,
    parsedYield
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || parsedTarget <= 0) return;

    if (dreamToEdit) {
      updateDream(dreamToEdit.id, {
        title: title.trim(),
        targetAmount: parsedTarget,
        currentSaved: parsedSaved,
        startDate,
        targetDate,
        monthlyYieldRate: parsedYield,
        category
      });
    } else {
      addDream({
        title: title.trim(),
        targetAmount: parsedTarget,
        currentSaved: parsedSaved,
        startDate,
        targetDate,
        monthlyYieldRate: parsedYield,
        category
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-800">
              {dreamToEdit ? 'Editar Sonho' : 'Cadastrar Novo Sonho'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Meu sonho é: *</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Viagem para Europa, Comprar Carro, Entrada Casa..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Categoria do Sonho</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none"
            >
              {categoriesPreset.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                O sonho custa (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="25000,00"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Já consegui guardar (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={currentSaved}
                onChange={(e) => setCurrentSaved(e.target.value)}
                placeholder="0,00"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Começar a poupar em</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none text-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pretendo realizá-lo em</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Meu investimento rende (% ao mês)
            </label>
            <input
              type="number"
              step="0.01"
              value={monthlyYieldRate}
              onChange={(e) => setMonthlyYieldRate(e.target.value)}
              placeholder="0.85"
              className="w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Dica: 100% do CDI rende aprox. 0,85% ao mês líquido no cenário atual.
            </span>
          </div>

          {/* Real-time Calculation Result Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Resultado do Planejamento ({monthsDiff} meses restantes)
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600">Preciso economizar por mês:</span>
              <span className="font-bold font-mono text-emerald-800 text-sm">
                {formatCurrency(calculatedMonthlySaving)}/mês
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-xs"
            >
              {dreamToEdit ? 'Salvar Alterações' : 'Criar Sonho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
