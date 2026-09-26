export type TransactionType = 'despesa' | 'receita' | 'transferencia';

export type AccountType = 'corrente' | 'poupanca' | 'cartao' | 'investimento' | 'carteira';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  active: boolean;
  creditLimit?: number;
  closingDay?: number;
  dueDay?: number;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'despesa' | 'receita';
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive value
  type: TransactionType;
  accountId: string;
  targetAccountId?: string; // only for 'transferencia'
  categoryId?: string;
  subcategoryId?: string;
  consolidated: boolean; // C indicator in classic ME
  notes?: string;
  installment?: {
    current: number;
    total: number;
  };
  hasReminder?: boolean;
}

export interface CategoryRule {
  id: string;
  keyword: string;
  categoryId: string;
  subcategoryId?: string;
}

export interface DreamTask {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
}

export interface Dream {
  id: string;
  title: string;
  targetAmount: number;
  currentSaved: number;
  startDate: string;
  targetDate: string;
  monthlyYieldRate: number; // e.g. 0.8% a.m.
  monthlySavingNeeded: number;
  category: string;
  notes: string[];
  tasks: DreamTask[];
  completed: boolean;
}

export interface CategoryBudget {
  categoryId: string;
  plannedMonthly: number[]; // 12 months (0 to 11)
}

export interface FinancialPeriod {
  year: number;
  month: number; // 0-11 (0 = Janeiro)
}
