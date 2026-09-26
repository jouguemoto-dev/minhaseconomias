import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Account,
  Category,
  Transaction,
  CategoryRule,
  Dream,
  CategoryBudget,
  FinancialPeriod
} from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_RULES,
  INITIAL_DREAMS,
  INITIAL_BUDGET
} from '../data/initialData';
import { calculateMonthsDifference, calculateRequiredMonthlySaving } from '../utils/formatters';
import {
  auth,
  db,
  googleProvider,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';

interface FinanceContextType {
  // Auth & Cloud DB
  currentUser: User | null;
  isCloudSynced: boolean;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;

  // Data
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  rules: CategoryRule[];
  dreams: Dream[];
  budget: CategoryBudget[];

  // Navigation & Filters
  currentPeriod: FinancialPeriod;
  setCurrentPeriod: (period: FinancialPeriod | ((prev: FinancialPeriod) => FinancialPeriod)) => void;
  selectedAccountIds: string[];
  setSelectedAccountIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategoryIds: string[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  consolidationFilter: 'all' | 'consolidated' | 'unconsolidated';
  setConsolidationFilter: (filter: 'all' | 'consolidated' | 'unconsolidated') => void;
  typeFilter: 'all' | 'despesa' | 'receita' | 'transferencia';
  setTypeFilter: (filter: 'all' | 'despesa' | 'receita' | 'transferencia') => void;

  // Transaction CRUD & Bulk Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  bulkConsolidate: (ids: string[], consolidate: boolean) => void;
  bulkDelete: (ids: string[]) => void;
  bulkCategorize: (ids: string[], categoryId: string, subcategoryId?: string) => void;

  // Account CRUD
  addAccount: (acc: Omit<Account, 'id' | 'currentBalance'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  adjustAccountBalance: (id: string, newBalance: number) => void;

  // Category CRUD
  addCategory: (cat: Omit<Category, 'id' | 'subcategories'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (categoryId: string, name: string) => void;

  // Rule CRUD & Auto-suggestion
  addRule: (rule: Omit<CategoryRule, 'id'>) => void;
  deleteRule: (id: string) => void;
  suggestCategoryForDescription: (desc: string) => { categoryId?: string; subcategoryId?: string };

  // Dream CRUD & Operations
  addDream: (dream: Omit<Dream, 'id' | 'monthlySavingNeeded' | 'tasks' | 'notes' | 'completed'>) => void;
  updateDream: (id: string, updates: Partial<Dream>) => void;
  deleteDream: (id: string) => void;
  addDreamTask: (dreamId: string, title: string, dueDate?: string) => void;
  toggleDreamTask: (dreamId: string, taskId: string) => void;
  deleteDreamTask: (dreamId: string, taskId: string) => void;
  addDreamNote: (dreamId: string, noteText: string) => void;
  depositToDream: (dreamId: string, amount: number, sourceAccountId?: string) => void;

  // Budget
  updateBudgetMonth: (categoryId: string, monthIndex: number, amount: number) => void;
  setBudgetForAllMonths: (categoryId: string, amount: number) => void;

  // Import / Export
  importTransactions: (newTxs: Omit<Transaction, 'id'>[]) => { imported: number; duplicates: number };
  resetDemoData: () => void;
  clearAllUserData: (options?: { removeAccounts?: boolean }) => Promise<void>;
  isCleanData: boolean;

  // Filtered lists & Computed KPIs
  filteredTransactions: Transaction[];
  currentMonthTransactions: Transaction[];
  totalGeneralBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthResult: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCOUNTS: 'me_accounts_v1',
  CATEGORIES: 'me_categories_v1',
  TRANSACTIONS: 'me_transactions_v1',
  RULES: 'me_rules_v1',
  DREAMS: 'me_dreams_v1',
  BUDGET: 'me_budget_v1',
  PERIOD: 'me_period_v1'
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // One-time automatic clearing of fake data requested by user
  if (typeof window !== 'undefined' && localStorage.getItem('me_cleared_fake_v2') !== 'true') {
    localStorage.setItem('me_cleared_fake_v2', 'true');
    localStorage.setItem('me_clean_data_v1', 'true');
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify([]));
    const savedAccs = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (savedAccs) {
      try {
        const parsed = JSON.parse(savedAccs);
        localStorage.setItem(
          STORAGE_KEYS.ACCOUNTS,
          JSON.stringify(parsed.map((a: any) => ({ ...a, initialBalance: 0, currentBalance: 0 })))
        );
      } catch {}
    } else {
      localStorage.setItem(
        STORAGE_KEYS.ACCOUNTS,
        JSON.stringify(INITIAL_ACCOUNTS.map((a) => ({ ...a, initialBalance: 0, currentBalance: 0 })))
      );
    }
  }

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isCleanData, setIsCleanData] = useState<boolean>(true);

  // Core Data
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!saved) {
      return INITIAL_ACCOUNTS.map((a) => ({ ...a, initialBalance: 0, currentBalance: 0 }));
    }
    try {
      const parsed: Account[] = JSON.parse(saved);
      // Auto-migrate if no credit card accounts exist in saved state
      if (!parsed.some((a) => a.type === 'cartao')) {
        const creditCards = INITIAL_ACCOUNTS.filter((a) => a.type === 'cartao').map((a) => ({
          ...a,
          initialBalance: 0,
          currentBalance: 0
        }));
        return [...parsed, ...creditCards];
      }
      return parsed;
    } catch {
      return INITIAL_ACCOUNTS.map((a) => ({ ...a, initialBalance: 0, currentBalance: 0 }));
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [rules, setRules] = useState<CategoryRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RULES);
    return saved ? JSON.parse(saved) : [];
  });

  const [dreams, setDreams] = useState<Dream[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DREAMS);
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return saved ? JSON.parse(saved) : INITIAL_BUDGET;
  });

  // Period
  const [currentPeriod, setCurrentPeriod] = useState<FinancialPeriod>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PERIOD);
    return saved ? JSON.parse(saved) : { year: 2026, month: 8 }; // 8 = September
  });

  // Filters
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [consolidationFilter, setConsolidationFilter] = useState<'all' | 'consolidated' | 'unconsolidated'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'despesa' | 'receita' | 'transferencia'>('all');

  // Boot: Test Firestore connection
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        setIsCloudSynced(true);
      } else {
        setIsCloudSynced(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Realtime Cloud Synchronization when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    // Accounts listener
    const accPath = `users/${uid}/accounts`;
    const unsubAccounts = onSnapshot(
      collection(db, 'users', uid, 'accounts'),
      (snap) => {
        if (!snap.empty) {
          const cloudAccounts = snap.docs.map((doc) => doc.data() as Account);
          setAccounts(cloudAccounts);
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, accPath)
    );

    // Transactions listener
    const txPath = `users/${uid}/transactions`;
    const unsubTransactions = onSnapshot(
      collection(db, 'users', uid, 'transactions'),
      (snap) => {
        const cloudTxs = snap.docs.map((doc) => doc.data() as Transaction);
        setTransactions(cloudTxs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, txPath)
    );

    return () => {
      unsubAccounts();
      unsubTransactions();
    };
  }, [currentUser]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(dreams));
  }, [dreams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERIOD, JSON.stringify(currentPeriod));
  }, [currentPeriod]);

  // Auth functions
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Recalculate account balances dynamically
  useEffect(() => {
    setAccounts((prevAccounts) => {
      return prevAccounts.map((acc) => {
        let balance = acc.initialBalance;

        transactions.forEach((tx) => {
          if (tx.accountId === acc.id) {
            if (tx.type === 'receita') {
              balance += tx.amount;
            } else if (tx.type === 'despesa') {
              balance -= tx.amount;
            } else if (tx.type === 'transferencia') {
              balance -= tx.amount;
            }
          }
          if (tx.type === 'transferencia' && tx.targetAccountId === acc.id) {
            balance += tx.amount;
          }
        });

        if (balance !== acc.currentBalance) {
          return { ...acc, currentBalance: balance };
        }
        return acc;
      });
    });
  }, [transactions]);

  // Auto category rule suggestion
  const suggestCategoryForDescription = (desc: string) => {
    if (!desc) return {};
    const lower = desc.toLowerCase().trim();
    for (const rule of rules) {
      if (lower.includes(rule.keyword.toLowerCase().trim())) {
        return { categoryId: rule.categoryId, subcategoryId: rule.subcategoryId };
      }
    }
    return {};
  };

  // Transactions CRUD
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTx: Transaction = { ...txData, id: newId };

    setTransactions((prev) => [newTx, ...prev]);

    // Persist to Cloud Firestore if logged in
    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'transactions', newId), {
        ...newTx,
        userId: currentUser.uid
      }).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/transactions/${newId}`)
      );
    }

    return newId;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id) return tx;
        const updated = { ...tx, ...updates };
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'transactions', id), {
            ...updated,
            userId: currentUser.uid
          }).catch((err) =>
            handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/transactions/${id}`)
          );
        }
        return updated;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    if (currentUser) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'transactions', id)).catch((err) =>
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/transactions/${id}`)
      );
    }
  };

  const bulkConsolidate = (ids: string[], consolidate: boolean) => {
    const idSet = new Set(ids);
    setTransactions((prev) =>
      prev.map((tx) => {
        if (!idSet.has(tx.id)) return tx;
        const updated = { ...tx, consolidated: consolidate };
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'transactions', tx.id), {
            ...updated,
            userId: currentUser.uid
          }).catch((err) =>
            handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/transactions/${tx.id}`)
          );
        }
        return updated;
      })
    );
  };

  const bulkDelete = (ids: string[]) => {
    const idSet = new Set(ids);
    setTransactions((prev) => prev.filter((tx) => !idSet.has(tx.id)));
    if (currentUser) {
      ids.forEach((id) => {
        deleteDoc(doc(db, 'users', currentUser.uid, 'transactions', id)).catch((err) =>
          handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/transactions/${id}`)
        );
      });
    }
  };

  const bulkCategorize = (ids: string[], categoryId: string, subcategoryId?: string) => {
    const idSet = new Set(ids);
    setTransactions((prev) =>
      prev.map((tx) => {
        if (!idSet.has(tx.id)) return tx;
        const updated = { ...tx, categoryId, subcategoryId };
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'transactions', tx.id), {
            ...updated,
            userId: currentUser.uid
          }).catch((err) =>
            handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/transactions/${tx.id}`)
          );
        }
        return updated;
      })
    );
  };

  // Account Actions
  const addAccount = (accData: Omit<Account, 'id' | 'currentBalance'>) => {
    const newId = `acc-${Date.now()}`;
    const newAcc: Account = {
      ...accData,
      id: newId,
      currentBalance: accData.initialBalance
    };
    setAccounts((prev) => [...prev, newAcc]);

    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'accounts', newId), {
        ...newAcc,
        userId: currentUser.uid
      }).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/accounts/${newId}`)
      );
    }
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== id) return acc;
        const updated = { ...acc, ...updates };
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'accounts', id), {
            ...updated,
            userId: currentUser.uid
          }).catch((err) =>
            handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/accounts/${id}`)
          );
        }
        return updated;
      })
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    if (currentUser) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'accounts', id)).catch((err) =>
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/accounts/${id}`)
      );
    }
  };

  const adjustAccountBalance = (id: string, newBalance: number) => {
    const targetAcc = accounts.find((a) => a.id === id);
    if (!targetAcc) return;
    const diff = newBalance - targetAcc.currentBalance;
    if (diff === 0) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: `Ajuste de Saldo - ${targetAcc.name}`,
      amount: Math.abs(diff),
      type: diff > 0 ? 'receita' : 'despesa',
      accountId: id,
      consolidated: true,
      notes: 'Ajuste de conciliação'
    });
  };

  // Category Actions
  const addCategory = (catData: Omit<Category, 'id' | 'subcategories'>) => {
    const newId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...catData,
      id: newId,
      subcategories: []
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const addSubcategory = (categoryId: string, name: string) => {
    const newSubId = `sub-${Date.now()}`;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: [...cat.subcategories, { id: newSubId, name, categoryId }]
            }
          : cat
      )
    );
  };

  // Rule Actions
  const addRule = (ruleData: Omit<CategoryRule, 'id'>) => {
    const newId = `rule-${Date.now()}`;
    setRules((prev) => [...prev, { ...ruleData, id: newId }]);
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  // Dream Actions
  const addDream = (dreamData: Omit<Dream, 'id' | 'monthlySavingNeeded' | 'tasks' | 'notes' | 'completed'>) => {
    const newId = `dream-${Date.now()}`;
    const months = calculateMonthsDifference(dreamData.startDate, dreamData.targetDate);
    const monthlySavingNeeded = calculateRequiredMonthlySaving(
      dreamData.targetAmount,
      dreamData.currentSaved,
      months,
      dreamData.monthlyYieldRate
    );

    const newDream: Dream = {
      ...dreamData,
      id: newId,
      monthlySavingNeeded,
      notes: [],
      tasks: [],
      completed: dreamData.currentSaved >= dreamData.targetAmount
    };

    setDreams((prev) => [...prev, newDream]);
  };

  const updateDream = (id: string, updates: Partial<Dream>) => {
    setDreams((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const merged = { ...d, ...updates };
        const months = calculateMonthsDifference(merged.startDate, merged.targetDate);
        merged.monthlySavingNeeded = calculateRequiredMonthlySaving(
          merged.targetAmount,
          merged.currentSaved,
          months,
          merged.monthlyYieldRate
        );
        merged.completed = merged.currentSaved >= merged.targetAmount;
        return merged;
      })
    );
  };

  const deleteDream = (id: string) => {
    setDreams((prev) => prev.filter((d) => d.id !== id));
  };

  const addDreamTask = (dreamId: string, title: string, dueDate?: string) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      dueDate,
      completed: false
    };
    setDreams((prev) =>
      prev.map((d) => (d.id === dreamId ? { ...d, tasks: [...d.tasks, newTask] } : d))
    );
  };

  const toggleDreamTask = (dreamId: string, taskId: string) => {
    setDreams((prev) =>
      prev.map((d) => {
        if (d.id !== dreamId) return d;
        return {
          ...d,
          tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        };
      })
    );
  };

  const deleteDreamTask = (dreamId: string, taskId: string) => {
    setDreams((prev) =>
      prev.map((d) => {
        if (d.id !== dreamId) return d;
        return {
          ...d,
          tasks: d.tasks.filter((t) => t.id !== taskId)
        };
      })
    );
  };

  const addDreamNote = (dreamId: string, noteText: string) => {
    if (!noteText.trim()) return;
    setDreams((prev) =>
      prev.map((d) => (d.id === dreamId ? { ...d, notes: [noteText.trim(), ...d.notes] } : d))
    );
  };

  const depositToDream = (dreamId: string, amount: number, sourceAccountId?: string) => {
    if (amount <= 0) return;
    const targetDream = dreams.find((d) => d.id === dreamId);
    if (!targetDream) return;

    updateDream(dreamId, {
      currentSaved: targetDream.currentSaved + amount
    });

    if (sourceAccountId) {
      addTransaction({
        date: new Date().toISOString().split('T')[0],
        description: `Depósito Sonho: ${targetDream.title}`,
        amount,
        type: 'despesa',
        accountId: sourceAccountId,
        categoryId: 'cat-lazer',
        consolidated: true,
        notes: `Aporte voluntário para o sonho "${targetDream.title}"`
      });
    }
  };

  // Budget Actions
  const updateBudgetMonth = (categoryId: string, monthIndex: number, amount: number) => {
    setBudget((prev) => {
      const existing = prev.find((b) => b.categoryId === categoryId);
      if (existing) {
        return prev.map((b) => {
          if (b.categoryId !== categoryId) return b;
          const copy = [...b.plannedMonthly];
          copy[monthIndex] = Math.max(0, amount);
          return { ...b, plannedMonthly: copy };
        });
      } else {
        const planned = new Array(12).fill(0);
        planned[monthIndex] = Math.max(0, amount);
        return [...prev, { categoryId, plannedMonthly: planned }];
      }
    });
  };

  const setBudgetForAllMonths = (categoryId: string, amount: number) => {
    setBudget((prev) => {
      const existing = prev.find((b) => b.categoryId === categoryId);
      const planned = new Array(12).fill(Math.max(0, amount));
      if (existing) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, plannedMonthly: planned } : b));
      } else {
        return [...prev, { categoryId, plannedMonthly: planned }];
      }
    });
  };

  // Import / Export
  const importTransactions = (newTxs: Omit<Transaction, 'id'>[]) => {
    let importedCount = 0;
    let dupCount = 0;
    const toAdd: Transaction[] = [];

    newTxs.forEach((raw) => {
      const isDup = transactions.some(
        (t) =>
          t.date === raw.date &&
          Math.abs(t.amount - raw.amount) < 0.01 &&
          t.description.toLowerCase().trim() === raw.description.toLowerCase().trim()
      );

      if (isDup) {
        dupCount++;
      } else {
        importedCount++;
        const newId = `tx-imp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const txObj = { ...raw, id: newId };
        toAdd.push(txObj);

        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'transactions', newId), {
            ...txObj,
            userId: currentUser.uid
          }).catch((err) =>
            handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/transactions/${newId}`)
          );
        }
      }
    });

    if (toAdd.length > 0) {
      setTransactions((prev) => [...toAdd, ...prev]);
    }

    return { imported: importedCount, duplicates: dupCount };
  };

  const resetDemoData = () => {
    localStorage.clear();
    setAccounts(INITIAL_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setRules(INITIAL_RULES);
    setDreams(INITIAL_DREAMS);
    setBudget(INITIAL_BUDGET);
    setCurrentPeriod({ year: 2026, month: 8 });
    setSelectedAccountIds([]);
    setSelectedCategoryIds([]);
    setSearchQuery('');
  };

  const clearAllUserData = async (options?: { removeAccounts?: boolean }) => {
    const removeAccounts = !!options?.removeAccounts;

    // 1. Purge from Firestore if cloud user is active
    if (currentUser) {
      const uid = currentUser.uid;
      try {
        const txSnap = await getDocs(collection(db, 'users', uid, 'transactions'));
        await Promise.all(txSnap.docs.map((d) => deleteDoc(d.ref)));
      } catch (err) {
        console.error('Error deleting transactions from Firestore:', err);
      }

      try {
        const dreamSnap = await getDocs(collection(db, 'users', uid, 'dreams'));
        await Promise.all(dreamSnap.docs.map((d) => deleteDoc(d.ref)));
      } catch (err) {
        console.error('Error deleting dreams from Firestore:', err);
      }

      if (removeAccounts) {
        try {
          const accSnap = await getDocs(collection(db, 'users', uid, 'accounts'));
          await Promise.all(accSnap.docs.map((d) => deleteDoc(d.ref)));
        } catch (err) {
          console.error('Error deleting accounts from Firestore:', err);
        }
      } else {
        try {
          const accSnap = await getDocs(collection(db, 'users', uid, 'accounts'));
          await Promise.all(
            accSnap.docs.map((d) =>
              setDoc(d.ref, { currentBalance: 0, initialBalance: 0 }, { merge: true })
            )
          );
        } catch (err) {
          console.error('Error resetting accounts in Firestore:', err);
        }
      }

      try {
        await setDoc(doc(db, 'users', uid), { cleanRealData: true, initialized: true }, { merge: true });
      } catch (err) {
        console.error('Error updating user document:', err);
      }
    }

    // 2. Clear in local state
    setTransactions([]);
    setDreams([]);
    setRules([]);
    if (removeAccounts) {
      setAccounts([]);
    } else {
      setAccounts((prev) =>
        prev.map((a) => ({
          ...a,
          initialBalance: 0,
          currentBalance: 0
        }))
      );
    }

    // 3. Persist clean state in LocalStorage
    localStorage.setItem('me_clean_data_v1', 'true');
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify([]));
    if (removeAccounts) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    } else {
      localStorage.setItem(
        STORAGE_KEYS.ACCOUNTS,
        JSON.stringify(accounts.map((a) => ({ ...a, initialBalance: 0, currentBalance: 0 })))
      );
    }
  };

  // Computed values
  const totalGeneralBalance = useMemo(() => {
    return accounts.reduce((acc, a) => (a.active ? acc + a.currentBalance : acc), 0);
  }, [accounts]);

  const currentMonthTransactions = useMemo(() => {
    const padMonth = String(currentPeriod.month + 1).padStart(2, '0');
    const prefix = `${currentPeriod.year}-${padMonth}`;
    return transactions.filter((t) => t.date.startsWith(prefix));
  }, [transactions, currentPeriod]);

  const filteredTransactions = useMemo(() => {
    let list = currentMonthTransactions;

    if (selectedAccountIds.length > 0) {
      const accSet = new Set(selectedAccountIds);
      list = list.filter(
        (t) => accSet.has(t.accountId) || (t.targetAccountId && accSet.has(t.targetAccountId))
      );
    }

    if (selectedCategoryIds.length > 0) {
      const catSet = new Set(selectedCategoryIds);
      list = list.filter((t) => t.categoryId && catSet.has(t.categoryId));
    }

    if (consolidationFilter === 'consolidated') {
      list = list.filter((t) => t.consolidated);
    } else if (consolidationFilter === 'unconsolidated') {
      list = list.filter((t) => !t.consolidated);
    }

    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const descMatch = t.description.toLowerCase().includes(q);
        const amountMatch = t.amount.toString().includes(q);
        return descMatch || amountMatch;
      });
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    currentMonthTransactions,
    selectedAccountIds,
    selectedCategoryIds,
    consolidationFilter,
    typeFilter,
    searchQuery
  ]);

  const { currentMonthIncome, currentMonthExpense, currentMonthResult } = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'receita') {
        income += tx.amount;
      } else if (tx.type === 'despesa') {
        expense += tx.amount;
      }
    });

    return {
      currentMonthIncome: income,
      currentMonthExpense: expense,
      currentMonthResult: income - expense
    };
  }, [filteredTransactions]);

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        isCloudSynced,
        isAuthLoading,
        loginWithGoogle,
        logoutUser,
        accounts,
        categories,
        transactions,
        rules,
        dreams,
        budget,
        currentPeriod,
        setCurrentPeriod,
        selectedAccountIds,
        setSelectedAccountIds,
        selectedCategoryIds,
        setSelectedCategoryIds,
        searchQuery,
        setSearchQuery,
        consolidationFilter,
        setConsolidationFilter,
        typeFilter,
        setTypeFilter,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        bulkConsolidate,
        bulkDelete,
        bulkCategorize,
        addAccount,
        updateAccount,
        deleteAccount,
        adjustAccountBalance,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        addRule,
        deleteRule,
        suggestCategoryForDescription,
        addDream,
        updateDream,
        deleteDream,
        addDreamTask,
        toggleDreamTask,
        deleteDreamTask,
        addDreamNote,
        depositToDream,
        updateBudgetMonth,
        setBudgetForAllMonths,
        importTransactions,
        resetDemoData,
        clearAllUserData,
        isCleanData,
        filteredTransactions,
        currentMonthTransactions,
        totalGeneralBalance,
        currentMonthIncome,
        currentMonthExpense,
        currentMonthResult
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
