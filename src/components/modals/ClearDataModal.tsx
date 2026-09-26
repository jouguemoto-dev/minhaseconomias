import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Database, X, ShieldCheck } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({ isOpen, onClose }) => {
  const { clearAllUserData, currentUser, isCloudSynced } = useFinance();
  const [removeAccounts, setRemoveAccounts] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsClearing(true);
    try {
      await clearAllUserData({ removeAccounts });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao limpar os dados.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900">
              Zerar Informações Fakes
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Database Status Badge */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <span>Banco de Dados Ativo</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              {currentUser
                ? `Conectado como ${currentUser.email} (Sincronizado na Nuvem)`
                : 'Firestore provisionado e pronto para armazenar suas finanças.'}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-slate-600 leading-relaxed text-xs">
          Esta ação irá <strong>apagar todas as transações de exemplo</strong>, zerar sonhos e preparar o sistema para que você insira exclusivamente seus <strong>dados financeiros reais</strong>.
        </div>

        {/* Options */}
        <div className="space-y-2 pt-1">
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="clearOptions"
              checked={!removeAccounts}
              onChange={() => setRemoveAccounts(false)}
              className="mt-0.5 accent-[#0F4C81]"
            />
            <div>
              <span className="font-bold text-slate-800 block">
                Zerar saldos (Manter estrutura das contas)
              </span>
              <span className="text-[11px] text-slate-500">
                Mantém as contas cadastradas com saldo R$ 0,00 para você apenas ajustar para os valores reais.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="clearOptions"
              checked={removeAccounts}
              onChange={() => setRemoveAccounts(true)}
              className="mt-0.5 accent-[#0F4C81]"
            />
            <div>
              <span className="font-bold text-slate-800 block">
                Excluir todas as contas de teste
              </span>
              <span className="text-[11px] text-slate-500">
                Apaga todas as contas para você cadastrar do zero apenas os bancos e cartões que você utiliza.
              </span>
            </div>
          </label>
        </div>

        {/* Success or Action buttons */}
        {success ? (
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-center font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Dados zerados com sucesso! Começando do zero...
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isClearing}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isClearing}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isClearing ? 'Zerando dados...' : 'Confirmar e Zerar Dados Fakes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
