export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

export const MESES_ABR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez'
];

export const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export function formatCurrency(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatSimpleNumber(value: number): string {
  if (isNaN(value)) return '0,00';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function parseDateBR(dateStr: string): string {
  // from DD/MM/YYYY to YYYY-MM-DD
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
}

export function getFullDateFormatted(date: Date = new Date()): string {
  const diaSemana = DIAS_SEMANA[date.getDay()];
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${diaSemana}, ${dia}/${mes}/${ano}`;
}

export function calculateMonthsDifference(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months);
}

/**
 * Calculates required monthly contribution to reach a financial goal
 * Formula for annuity with monthly compound interest:
 * FV = PV * (1+i)^n + PMT * [ ((1+i)^n - 1) / i ]
 * => PMT = (FV - PV * (1+i)^n) * [ i / ((1+i)^n - 1) ]
 */
export function calculateRequiredMonthlySaving(
  targetAmount: number,
  currentSaved: number,
  months: number,
  monthlyYieldPercent: number
): number {
  if (months <= 0) return Math.max(0, targetAmount - currentSaved);
  const i = monthlyYieldPercent / 100;
  
  if (i === 0) {
    const needed = targetAmount - currentSaved;
    return Math.max(0, needed / months);
  }

  const compoundFactor = Math.pow(1 + i, months);
  const futureValueOfCurrent = currentSaved * compoundFactor;
  const remainingNeeded = targetAmount - futureValueOfCurrent;

  if (remainingNeeded <= 0) return 0;

  const annuityFactor = (compoundFactor - 1) / i;
  return remainingNeeded / annuityFactor;
}
