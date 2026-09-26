import React from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Plus,
  Target,
  Menu,
  PieChart,
  CalendarDays,
  LineChart,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { ActiveTab } from './Header';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onOpenMobileFilters: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenMobileFilters
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  return (
    <>
      {/* More Options Mobile Bottom Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 md:hidden flex flex-col justify-end animate-in fade-in">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">Mais Recursos</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setActiveTab('budget');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'budget'
                    ? 'bg-sky-50 border-[#0F4C81] text-[#0F4C81] font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <CalendarDays className="w-5 h-5 text-[#0F4C81]" />
                <span>Orçamento</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-sky-50 border-[#0F4C81] text-[#0F4C81] font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <PieChart className="w-5 h-5 text-emerald-600" />
                <span>Relatórios</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('investments');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'investments'
                    ? 'bg-sky-50 border-[#0F4C81] text-[#0F4C81] font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <LineChart className="w-5 h-5 text-amber-600" />
                <span>Investimentos</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('rules');
                  setShowMoreMenu(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'rules'
                    ? 'bg-sky-50 border-[#0F4C81] text-[#0F4C81] font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                <span>Regras</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenMobileFilters();
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                Filtrar Contas e Categorias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 h-16 items-center px-1 pb-safe md:hidden shadow-lg shadow-slate-900/10"
        aria-label="Navegação Mobile"
      >
        {/* Tab 1: Início */}
        <button
          onClick={() => {
            setActiveTab('overview');
            setShowMoreMenu(false);
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'text-[#0F4C81] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Início</span>
        </button>

        {/* Tab 2: Extrato */}
        <button
          onClick={() => {
            setActiveTab('transactions');
            setShowMoreMenu(false);
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            activeTab === 'transactions' ? 'text-[#0F4C81] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Extrato</span>
        </button>

        {/* Tab 3: Raised Center Action Button (+) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={onOpenNewTransaction}
            className="w-12 h-12 rounded-full bg-[#0F4C81] text-white flex items-center justify-center shadow-lg shadow-sky-900/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white"
            title="Adicionar nova transação"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 4: Sonhos */}
        <button
          onClick={() => {
            setActiveTab('dreams');
            setShowMoreMenu(false);
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            activeTab === 'dreams' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Sonhos</span>
        </button>

        {/* Tab 5: Mais */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            ['budget', 'analytics', 'investments', 'rules'].includes(activeTab)
              ? 'text-[#0F4C81] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Mais</span>
        </button>
      </nav>
    </>
  );
};
