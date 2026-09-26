import React, { useState } from 'react';
import { X, Landmark, CreditCard, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType } from '../../types/finance';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'conta' | 'cartao';
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'conta'
}) => {
  const { addAccount } = useFinance();

  const [activeTab, setActiveTab] = useState<'conta' | 'cartao'>(defaultTab);

  // Common fields
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<AccountType>('corrente');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('#0F4C81');

  // Credit card specific fields
  const [creditLimit, setCreditLimit] = useState('5000');
  const [closingDay, setClosingDay] = useState('20');
  const [dueDay, setDueDay] = useState('27');

  const colorPresets = [
    '#0F4C81',
    '#8B5CF6', // Nubank Purple
    '#EA580C', // Itaú Orange
    '#FACC15', // BB Yellow
    '#DC2626', // Santander Red
    '#10B981', // Green
    '#0284C7', // Sky Blue
    '#0F172A'  // Black
  ];

  const handleTabChange = (tab: 'conta' | 'cartao') => {
    setActiveTab(tab);
    if (tab === 'cartao') {
      setType('cartao');
      if (!name) setName('Meu Cartão de Crédito');
      setColor('#8B5CF6');
    } else {
      setType('corrente');
      if (name === 'Meu Cartão de Crédito') setName('');
      setColor('#0F4C81');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (activeTab === 'cartao') {
      const parsedLimit = parseFloat(creditLimit.replace(',', '.')) || 0;
      const initialInvoice = parseFloat(initialBalance.replace(',', '.')) || 0;
      // For credit cards, balance is negative when purchases exist
      const cardBalance = initialInvoice > 0 ? -initialInvoice : initialInvoice;

      addAccount({
        name: name.trim(),
        institution: institution.trim() || name.trim(),
        type: 'cartao',
        initialBalance: cardBalance,
        creditLimit: parsedLimit,
        closingDay: parseInt(closingDay, 10) || 20,
        dueDay: parseInt(dueDay, 10) || 27,
        color,
        active: true
      });
    } else {
      const balance = parseFloat(initialBalance.replace(',', '.')) || 0;
      addAccount({
        name: name.trim(),
        institution: institution.trim() || name.trim(),
        type,
        initialBalance: balance,
        color,
        active: true
      });
    }

    setName('');
    setInitialBalance('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {activeTab === 'cartao' ? (
              <CreditCard className="w-5 h-5 text-purple-600" />
            ) : (
              <Landmark className="w-5 h-5 text-[#0F4C81]" />
            )}
            <h3 className="font-bold text-sm text-slate-800">
              {activeTab === 'cartao' ? 'Novo Cartão de Crédito' : 'Nova Conta Bancária'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('conta')}
            className={`py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'conta' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            Conta Bancária
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('cartao')}
            className={`py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'cartao' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            Cartão de Crédito
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {activeTab === 'cartao' ? (
            /* Cartão de Crédito Form */
            <>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Nome do Cartão *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Nubank Mastercard, Itaú Visa, XP..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Bandeira ou Banco
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Ex: Mastercard, Visa, Elo, Nubank..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Limite de Crédito Total (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="5000,00"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Dia Fechamento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-center focus:outline-none"
                    title="Dia em que a fatura fecha"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Dia Vencimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-center focus:outline-none"
                    title="Dia de vencimento do pagamento da fatura"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Fatura Atual em Aberto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0,00"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-rose-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Informe caso já tenha compras acumuladas na fatura deste mês.
                </span>
              </div>
            </>
          ) : (
            /* Conta Bancária Form */
            <>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nome da Conta *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Banco do Brasil, Bradesco, Carteira..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tipo de Conta</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none"
                >
                  <option value="corrente">Conta Corrente / Digital</option>
                  <option value="poupanca">Conta Poupança</option>
                  <option value="investimento">Investimento / CDB / Corretora</option>
                  <option value="carteira">Carteira (Dinheiro Físico)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Saldo Atual (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0,00"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Color picker */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1.5">Cor Identificadora</label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-110 ring-2 ring-offset-1 ring-slate-800' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              className={`px-4 py-1.5 text-white font-semibold rounded-lg cursor-pointer shadow-xs ${
                activeTab === 'cartao'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-[#0F4C81] hover:bg-[#0c3c66]'
              }`}
            >
              {activeTab === 'cartao' ? 'Criar Cartão' : 'Salvar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
