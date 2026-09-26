import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, Printer, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDateBR, MESES } from '../../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { currentPeriod, filteredTransactions, categories, accounts } = useFinance();
  const [format, setFormat] = useState<'csv' | 'xls' | 'print'>('csv');
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = () => {
    if (format === 'print') {
      window.print();
      onClose();
      return;
    }

    // Build CSV file content with Brazilian semicolon delimiter (Excel friendly)
    const header = 'Data;Descrição;Tipo;Categoria;Conta;Valor (R$);Status\n';
    const rows = filteredTransactions.map((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId)?.name || '';
      const acc = accounts.find((a) => a.id === tx.accountId)?.name || '';
      const typeStr =
        tx.type === 'receita' ? 'Receita' : tx.type === 'despesa' ? 'Despesa' : 'Transferência';
      const statusStr = tx.consolidated ? 'Consolidada' : 'Não Consolidada';
      const valueStr = tx.amount.toFixed(2).replace('.', ',');

      return `"${formatDateBR(tx.date)}";"${tx.description}";"${typeStr}";"${cat}";"${acc}";"${valueStr}";"${statusStr}"`;
    });

    const csvContent = '\uFEFF' + header + rows.join('\n'); // UTF-8 BOM for Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Extrato_MinhasEconomias_${currentPeriod.year}_${currentPeriod.month + 1}.${
        format === 'csv' ? 'csv' : 'xls'
      }`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#0F4C81]" />
            <h3 className="font-bold text-base text-slate-800">Exportar Extrato de Transações</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Você está exportando <strong>{filteredTransactions.length}</strong> transações do período de{' '}
            <strong>
              {MESES[currentPeriod.month]} de {currentPeriod.year}
            </strong>
            .
          </p>

          <div>
            <label className="block text-slate-600 font-semibold mb-2">
              Escolha o formato do arquivo:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="text-[#0F4C81]"
                />
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-800">Arquivo CSV (.csv)</div>
                  <div className="text-[11px] text-slate-500">
                    Compatível com Excel, Google Planilhas e softwares contábeis
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="xls"
                  checked={format === 'xls'}
                  onChange={() => setFormat('xls')}
                  className="text-[#0F4C81]"
                />
                <FileSpreadsheet className="w-4 h-4 text-[#0F4C81]" />
                <div>
                  <div className="font-bold text-slate-800">Planilha Excel (.xls)</div>
                  <div className="text-[11px] text-slate-500">
                    Formatado com valores decimais brasileiros (R$)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="print"
                  checked={format === 'print'}
                  onChange={() => setFormat('print')}
                  className="text-[#0F4C81]"
                />
                <Printer className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="font-bold text-slate-800">Relatório para Impressão / PDF</div>
                  <div className="text-[11px] text-slate-500">
                    Abre a janela de impressão nativa para salvar em PDF
                  </div>
                </div>
              </label>
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
              type="button"
              onClick={handleExport}
              disabled={downloaded}
              className="px-4 py-2 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0c3c66] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Baixado!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Confirmar Exportação
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
