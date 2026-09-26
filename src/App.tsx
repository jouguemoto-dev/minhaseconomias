import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Header, ActiveTab } from './components/layout/Header';
import { SidebarFilter } from './components/layout/SidebarFilter';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileFilterDrawer } from './components/modals/MobileFilterDrawer';

import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { DreamsView } from './components/views/DreamsView';
import { BudgetView } from './components/views/BudgetView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { InvestmentsView } from './components/views/InvestmentsView';
import { RulesView } from './components/views/RulesView';

import { TransactionModal } from './components/modals/TransactionModal';
import { AccountModal } from './components/modals/AccountModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { DreamModal } from './components/modals/DreamModal';
import { ImportModal } from './components/modals/ImportModal';
import { ExportModal } from './components/modals/ExportModal';
import { ClearDataModal } from './components/modals/ClearDataModal';
import { Transaction, Dream } from './types/finance';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modal triggers
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<'conta' | 'cartao'>('conta');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [dreamToEdit, setDreamToEdit] = useState<Dream | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

  // Mobile Drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleOpenNewAccount = (tab?: 'conta' | 'cartao') => {
    setAccountModalTab(tab || 'conta');
    setIsAccountModalOpen(true);
  };

  const handleOpenNewTransaction = () => {
    setTxToEdit(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenNewDream = () => {
    setDreamToEdit(null);
    setIsDreamModalOpen(true);
  };

  const handleEditDream = (dream: Dream) => {
    setDreamToEdit(dream);
    setIsDreamModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex flex-col font-sans selection:bg-[#E0F2FE]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenNewDream={handleOpenNewDream}
        onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        onOpenClearData={() => setIsClearDataModalOpen(true)}
      />

      {/* Main Workspace (with pb-24 on mobile to prevent bottom nav overlap) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-24 md:pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar Filters (Desktop) */}
          <SidebarFilter
            onOpenNewAccount={handleOpenNewAccount}
            onOpenNewCategory={() => setIsCategoryModalOpen(true)}
          />

          {/* Center Dynamic Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <DashboardView
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenNewTransaction={handleOpenNewTransaction}
                onOpenNewDream={handleOpenNewDream}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView
                onOpenNewTransaction={handleOpenNewTransaction}
                onEditTransaction={handleEditTransaction}
                onOpenImport={() => setIsImportModalOpen(true)}
                onOpenExport={() => setIsExportModalOpen(true)}
              />
            )}

            {activeTab === 'dreams' && (
              <DreamsView
                onOpenNewDream={handleOpenNewDream}
                onEditDream={handleEditDream}
              />
            )}

            {activeTab === 'budget' && <BudgetView />}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'investments' && <InvestmentsView />}

            {activeTab === 'rules' && <RulesView />}
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
      />

      {/* Desktop Footer */}
      <footer className="hidden md:block bg-white border-t border-slate-200 mt-auto py-5 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Minhas Economias</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Economize mais. Viva melhor.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Seguro com Criptografia</span>
            <span>·</span>
            <span>Firebase Firestore Ativo</span>
            <span>·</span>
            <span>© 2014-2026 Auspex - Negócios em Tecnologia</span>
          </div>
        </div>
      </footer>

      {/* Mobile Filters Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        onOpenNewAccount={handleOpenNewAccount}
        onOpenNewCategory={() => setIsCategoryModalOpen(true)}
      />

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        transactionToEdit={txToEdit}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        defaultTab={accountModalTab}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <DreamModal
        isOpen={isDreamModalOpen}
        onClose={() => setIsDreamModalOpen(false)}
        dreamToEdit={dreamToEdit}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ClearDataModal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
