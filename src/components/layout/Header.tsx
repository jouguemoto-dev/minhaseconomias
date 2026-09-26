import React from 'react';
import {
  Plus,
  Upload,
  RotateCcw,
  Sparkles,
  PieChart,
  Target,
  ArrowRightLeft,
  LayoutDashboard,
  CalendarDays,
  LineChart,
  SlidersHorizontal,
  ChevronDown,
  Cloud,
  CloudCheck,
  LogIn,
  LogOut,
  User,
  Filter,
  Trash2
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getFullDateFormatted } from '../../utils/formatters';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export type ActiveTab = 'overview' | 'transactions' | 'dreams' | 'budget' | 'analytics' | 'investments' | 'rules';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onOpenImport: () => void;
  onOpenNewDream: () => void;
  onOpenMobileFilters?: () => void;
  onOpenClearData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenImport,
  onOpenNewDream,
  onOpenMobileFilters,
  onOpenClearData
}) => {
  const {
    currentUser,
    isCloudSynced,
    loginWithGoogle,
    logoutUser,
    resetDemoData,
    selectedAccountIds,
    selectedCategoryIds
  } = useFinance();

  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const currentDateDisplay = getFullDateFormatted(new Date(2026, 8, 26));

  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'transactions' as ActiveTab, label: 'Transações', icon: ArrowRightLeft },
    { id: 'dreams' as ActiveTab, label: 'Gerenciador de Sonhos', icon: Target },
    { id: 'budget' as ActiveTab, label: 'Orçamento', icon: CalendarDays },
    { id: 'analytics' as ActiveTab, label: 'Análise & Relatórios', icon: PieChart },
    { id: 'investments' as ActiveTab, label: 'Investimentos', icon: LineChart },
    { id: 'rules' as ActiveTab, label: 'Regras', icon: SlidersHorizontal }
  ];

  const hasActiveFilters = selectedAccountIds.length > 0 || selectedCategoryIds.length > 0;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-[#0F4C81] text-white px-3 sm:px-4 lg:px-8 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sky-200 tracking-wide">Minhas Economias</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-200 hidden sm:inline">Economize mais. Viva melhor.</span>
          {/* Cloud Database Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded border border-emerald-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Banco Ativo (Firestore)
          </span>

          {/* Quick Clear Fake Data Button */}
          {onOpenClearData && (
            <button
              onClick={onOpenClearData}
              className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 hover:text-white text-[10px] px-2 py-0.5 rounded border border-rose-400/30 transition-colors cursor-pointer"
              title="Zerar todas as informações de teste e começar com dados reais"
            >
              <Trash2 className="w-3 h-3 text-rose-300" />
              <span>Zerar Dados Fakes</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-200">
          <span className="hidden md:inline font-mono text-[11px]">{currentDateDisplay}</span>

          {/* Android PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* User Account / Google Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-0.5"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Avatar'}
                    className="w-5 h-5 rounded-full border border-white/40"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <span className="font-medium text-slate-100 max-w-[120px] truncate text-[11px]">
                  {currentUser.displayName || currentUser.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-1.5 w-60 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {currentUser.displayName || 'Usuário Conectado'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Sincronizado na Nuvem (Firestore)
                    </div>
                  </div>

                  <PWAInstallButton variant="menu" />

                  {onOpenClearData && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenClearData();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Zerar Dados Fakes (Limpar Tudo)
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Deseja restaurar os dados de demonstração padrão?')) {
                        resetDemoData();
                        setShowUserMenu(false);
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    Restaurar Dados Demo
                  </button>

                  <button
                    onClick={() => {
                      logoutUser();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    Sair da Conta Google
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
              title="Fazer login para sincronizar dados no Firebase Firestore"
            >
              <LogIn className="w-3 h-3 text-sky-200" />
              <span>Conectar Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Row */}
      <div className="px-3 sm:px-4 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#0284C7] text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">
              Minhas Economias
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
              Gerenciador Financeiro Pessoal
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle Button */}
          {onOpenMobileFilters && (
            <button
              onClick={onOpenMobileFilters}
              className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                hasActiveFilters
                  ? 'bg-sky-50 text-[#0F4C81] border-sky-300 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#0F4C81]" />
              )}
            </button>
          )}

          <button
            onClick={onOpenImport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80 cursor-pointer"
            title="Importar extrato bancário (OFX, CSV)"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Importar</span>
          </button>

          {activeTab === 'dreams' ? (
            <button
              onClick={onOpenNewDream}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span> Sonho
            </button>
          ) : (
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3c66] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova</span> Transação
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar (Desktop Navigation) */}
      <div className="hidden md:block px-4 lg:px-8 bg-slate-50 border-t border-slate-200/70 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 py-1" aria-label="Navegação Principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0F4C81] font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0F4C81]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
