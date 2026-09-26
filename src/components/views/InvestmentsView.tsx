import React, { useState, useMemo } from 'react';
import {
  LineChart,
  DollarSign,
  TrendingUp,
  Percent,
  Info,
  Calendar,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { INVESTMENT_BENCHMARKS } from '../../data/initialData';
import { formatCurrency } from '../../utils/formatters';

export const InvestmentsView: React.FC = () => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
  const [periodMonths, setPeriodMonths] = useState<number>(12);

  // Brazilian Regressive Income Tax Brackets for Fixed Income:
  // até 180 dias (6 meses): 22.5%
  // 181 a 360 dias (12 meses): 20.0%
  // 361 a 720 dias (24 meses): 17.5%
  // acima de 720 dias (36+ meses): 15.0%
  const incomeTaxRate = useMemo(() => {
    if (periodMonths <= 6) return 0.225;
    if (periodMonths <= 12) return 0.20;
    if (periodMonths <= 24) return 0.175;
    return 0.15;
  }, [periodMonths]);

  // Compute returns for each benchmark
  const simulationResults = useMemo(() => {
    return INVESTMENT_BENCHMARKS.map((item) => {
      // Monthly compound interest
      const i = item.monthlyRate / 100;
      const compoundFactor = Math.pow(1 + i, periodMonths);
      const grossFinalAmount = investmentAmount * compoundFactor;
      const grossProfit = grossFinalAmount - investmentAmount;

      // Poupança is tax-exempt; CDB/Tesouro pay IR
      const isTaxExempt = item.type === 'poupanca';
      const taxPaid = isTaxExempt ? 0 : grossProfit * incomeTaxRate;
      const netProfit = grossProfit - taxPaid;
      const netFinalAmount = investmentAmount + netProfit;
      const netTotalReturnPercent = (netProfit / investmentAmount) * 100;

      return {
        ...item,
        grossProfit,
        taxPaid,
        netProfit,
        netFinalAmount,
        netTotalReturnPercent
      };
    }).sort((a, b) => b.netProfit - a.netProfit);
  }, [investmentAmount, periodMonths, incomeTaxRate]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-[#0F4C81] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-sky-300">
            <LineChart className="w-3.5 h-3.5" />
            Simulador de Rentabilidade
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Comparativo de Investimentos</h1>
          <p className="text-xs text-slate-300 mt-1">
            Compare a rentabilidade líquida da Poupança, CDBs com CDI, Tesouro Selic e Ibovespa com desconto de IR.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-xs backdrop-blur-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Garantia FGC até R$ 250 mil por CPF</span>
        </div>
      </div>

      {/* Simulator Inputs Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Parâmetros da Simulação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Amount */}
          <div>
            <label className="block text-slate-600 font-medium mb-1.5">
              Quanto você deseja investir? (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                R$
              </span>
              <input
                type="number"
                step="500"
                min="100"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Math.max(100, parseFloat(e.target.value) || 0))}
                className="w-full pl-10 pr-3 py-2 text-base font-bold font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {[1000, 5000, 10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setInvestmentAmount(amt)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-mono text-slate-700 cursor-pointer"
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-slate-600 font-medium mb-1.5">
              Prazo de Investimento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { months: 6, label: '6 meses' },
                { months: 12, label: '1 ano' },
                { months: 24, label: '2 anos' },
                { months: 36, label: '3 anos' }
              ].map((p) => (
                <button
                  key={p.months}
                  onClick={() => setPeriodMonths(p.months)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                    periodMonths === p.months
                      ? 'bg-[#0F4C81] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Alíquota de I.R. aplicável:</span>
              <strong className="text-slate-700">{(incomeTaxRate * 100).toFixed(1)}% sobre o lucro</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Resultado Comparativo: Aplicação de {formatCurrency(investmentAmount)} por {periodMonths} meses
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                <th className="py-3 px-4">Investimento / Indicador</th>
                <th className="py-3 px-3 text-center">Taxa Bruta Anual</th>
                <th className="py-3 px-3 text-right">Rendimento Bruto</th>
                <th className="py-3 px-3 text-right">Imposto de Renda</th>
                <th className="py-3 px-4 text-right">Rendimento Líquido</th>
                <th className="py-3 px-4 text-right font-mono">Montante Final Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {simulationResults.map((item, idx) => {
                const isBest = idx === 0;
                return (
                  <tr
                    key={item.name}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isBest ? 'bg-emerald-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        {isBest && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                            Melhor Retorno
                          </span>
                        )}
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-700">
                      {item.annualRate.toFixed(2)}% a.a.
                    </td>

                    <td className="py-3 px-3 text-right text-slate-600">
                      +{formatCurrency(item.grossProfit)}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-500 font-sans text-[11px]">
                      {item.taxPaid > 0 ? (
                        <span className="text-rose-600">-{formatCurrency(item.taxPaid)}</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Isento</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      +{formatCurrency(item.netProfit)}
                      <div className="text-[10px] text-emerald-800 font-normal">
                        (+{item.netTotalReturnPercent.toFixed(2)}%)
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                      {formatCurrency(item.netFinalAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Guide Box (Minhas Economias Knowledge Base) */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700" />
          Como entender os indicadores e impostos
        </div>
        <p>
          <strong>CDI:</strong> Certificado de Depósito Interfinanceiro. É a taxa de empréstimo entre os bancos, muito próxima da taxa Selic. A maioria dos CDBs pós-fixados rende um percentual do CDI (ex: 100% ou 110%).
        </p>
        <p>
          <strong>Poupança vs. CDB:</strong> Embora a caderneta de poupança seja isenta de Imposto de Renda, os CDBs que pagam a partir de 100% do CDI historicamente rendem significativamente mais do que a poupança, mesmo após o desconto do I.R.
        </p>
      </div>
    </div>
  );
};
