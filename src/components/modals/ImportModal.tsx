import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import { Transaction } from '../../types/finance';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedImportItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'despesa' | 'receita';
  suggestedCategoryId?: string;
  status: 'importar' | 'duplicado';
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const {
    accounts,
    categories,
    transactions,
    suggestCategoryForDescription,
    importTransactions
  } = useFinance();

  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || '');
  const [activeImportFormat, setActiveImportFormat] = useState<'ofx' | 'csv' | 'demo'>('demo');
  const [pasteData, setPasteData] = useState('');
  const [previewItems, setPreviewItems] = useState<ParsedImportItem[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; duplicates: number } | null>(
    null
  );

  // Generate realistic sample bank OFX extract for instant testing
  const handleLoadDemoExtract = () => {
    const demoItems = [
      { date: '2026-09-20', description: 'POSTO SHELL COMBUSTIVEL', amount: 180.00, type: 'despesa' as const },
      { date: '2026-09-21', description: 'DROGARIA SAO PAULO REMEDIOS', amount: 94.60, type: 'despesa' as const },
      { date: '2026-09-22', description: 'SUPERMERCADO DIA COMPRAS', amount: 320.15, type: 'despesa' as const },
      { date: '2026-09-23', description: 'TRANSFERENCIA RECEBIDA PIX - JOAO SILVA', amount: 450.00, type: 'receita' as const },
      { date: '2026-09-24', description: 'UBER TRIP HELP.UBER.COM', amount: 42.80, type: 'despesa' as const },
      // Duplicate to test deduplication:
      { date: '2026-09-10', description: 'Supermercado Pão de Açúcar', amount: 642.80, type: 'despesa' as const }
    ];

    const parsed: ParsedImportItem[] = demoItems.map((item, idx) => {
      const isDuplicate = transactions.some(
        (t) =>
          t.date === item.date &&
          Math.abs(t.amount - item.amount) < 0.01 &&
          t.description.toLowerCase().trim() === item.description.toLowerCase().trim()
      );

      const ruleMatch = suggestCategoryForDescription(item.description);

      return {
        id: `prev-${idx}`,
        ...item,
        suggestedCategoryId: ruleMatch.categoryId,
        status: isDuplicate ? 'duplicado' : 'importar'
      };
    });

    setPreviewItems(parsed);
    setImportResult(null);
  };

  // Simple parser for user CSV or line-by-line paste
  const handleParseCustomText = () => {
    if (!pasteData.trim()) return;

    const lines = pasteData.trim().split('\n');
    const parsed: ParsedImportItem[] = [];

    lines.forEach((line, idx) => {
      // Expecting formats like: "2026-09-20; Uber; 42.50" or "20/09/2026, Posto, -150"
      const parts = line.split(/[;,]/);
      if (parts.length >= 3) {
        let rawDate = parts[0].trim();
        // convert dd/mm/yyyy to yyyy-mm-dd if needed
        if (rawDate.includes('/')) {
          const dParts = rawDate.split('/');
          if (dParts.length === 3) rawDate = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`;
        }

        const rawDesc = parts[1].trim();
        const rawAmt = parseFloat(parts[2].replace(/[^\d.-]/g, '')) || 0;
        const type: 'despesa' | 'receita' = rawAmt < 0 ? 'despesa' : 'receita';
        const absAmt = Math.abs(rawAmt);

        const isDuplicate = transactions.some(
          (t) =>
            t.date === rawDate &&
            Math.abs(t.amount - absAmt) < 0.01 &&
            t.description.toLowerCase().trim() === rawDesc.toLowerCase().trim()
        );

        const ruleMatch = suggestCategoryForDescription(rawDesc);

        parsed.push({
          id: `custom-${idx}`,
          date: rawDate,
          description: rawDesc,
          amount: absAmt,
          type,
          suggestedCategoryId: ruleMatch.categoryId,
          status: isDuplicate ? 'duplicado' : 'importar'
        });
      }
    });

    setPreviewItems(parsed);
  };

  // Confirm import
  const handleConfirmImport = () => {
    const toImport = previewItems
      .filter((item) => item.status === 'importar')
      .map((item) => ({
        date: item.date,
        description: item.description,
        amount: item.amount,
        type: item.type,
        accountId: targetAccountId,
        categoryId: item.suggestedCategoryId,
        consolidated: true,
        notes: 'Importado via Extrato Bancário'
      }));

    const result = importTransactions(toImport);
    setImportResult(result);
    setPreviewItems([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#0F4C81]" />
            <h3 className="font-bold text-base text-slate-800">
              Importar Extrato Bancário (OFX / CSV)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {importResult ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-base text-slate-800">Importação Concluída com Sucesso!</h4>
            <div className="text-xs text-slate-600 space-y-1">
              <p>
                <strong>{importResult.imported}</strong> nova(s) transação(ões) adicionada(s) à conta.
              </p>
              {importResult.duplicates > 0 && (
                <p className="text-amber-700">
                  {importResult.duplicates} transação(ões) duplicada(s) foram ignoradas para evitar lançamentos repetidos.
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0c3c66] text-xs cursor-pointer shadow-xs"
            >
              Fechar e Ver Transações
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Step 1: Select target account */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                1. Escolha a Conta do Minhas Economias para a qual deseja importar: *
              </label>
              <select
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium text-xs focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.institution}) - Saldo: {formatCurrency(acc.currentBalance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Choose Source Option */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                2. Selecione a fonte dos dados:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveImportFormat('demo');
                    handleLoadDemoExtract();
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    activeImportFormat === 'demo'
                      ? 'bg-sky-50 border-sky-300 text-sky-900 ring-1 ring-sky-300'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    Extrato de Teste (OFX Demo)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Carregar lote de compras com deduplicação e auto-categorização
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveImportFormat('csv');
                    setPreviewItems([]);
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    activeImportFormat === 'csv'
                      ? 'bg-sky-50 border-sky-300 text-sky-900 ring-1 ring-sky-300'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Colar Linhas de Extrato (CSV/TXT)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Formato: Data; Descrição; Valor
                  </div>
                </button>
              </div>
            </div>

            {/* Paste Data Textarea */}
            {activeImportFormat === 'csv' && (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder={`2026-09-20; Supermercado Extra; -240.50\n2026-09-22; Transferencia Recebida; 350.00`}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleParseCustomText}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  Processar Linhas
                </button>
              </div>
            )}

            {/* Preview Grid */}
            {previewItems.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Pré-visualização do Extrato ({previewItems.length} transações)</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Novos:{' '}
                    <strong className="text-emerald-700">
                      {previewItems.filter((i) => i.status === 'importar').length}
                    </strong>{' '}
                    | Duplicados:{' '}
                    <strong className="text-rose-700">
                      {previewItems.filter((i) => i.status === 'duplicado').length}
                    </strong>
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2">Status</th>
                        <th className="p-2">Data</th>
                        <th className="p-2">Descrição</th>
                        <th className="p-2">Categoria Sugerida</th>
                        <th className="p-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewItems.map((item) => {
                        const cat = categories.find((c) => c.id === item.suggestedCategoryId);
                        return (
                          <tr
                            key={item.id}
                            className={item.status === 'duplicado' ? 'bg-amber-50/50' : ''}
                          >
                            <td className="p-2">
                              {item.status === 'duplicado' ? (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                                  Duplicado
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                                  Novo
                                </span>
                              )}
                            </td>
                            <td className="p-2 font-mono text-[11px]">{formatDateBR(item.date)}</td>
                            <td className="p-2 font-medium text-slate-800">{item.description}</td>
                            <td className="p-2 text-slate-600">
                              {cat ? (
                                <span className="text-emerald-700 font-medium">✨ {cat.name}</span>
                              ) : (
                                <span className="text-slate-400 italic">Sem sugestão</span>
                              )}
                            </td>
                            <td
                              className={`p-2 text-right font-mono font-bold ${
                                item.type === 'receita' ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {item.type === 'receita' ? '+' : '-'}
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={previewItems.filter((i) => i.status === 'importar').length === 0}
                    className="px-4 py-2 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0c3c66] disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Confirmar Importação de{' '}
                    {previewItems.filter((i) => i.status === 'importar').length} Transações
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
