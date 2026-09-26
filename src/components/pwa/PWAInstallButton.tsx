import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, X, Share2, PlusSquare, ArrowUpRight } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'menu';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed PWA on the home screen, hide
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 hover:text-white px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-400/40 transition-all cursor-pointer shadow-2xs"
          title="Instalar Minhas Economias no Android / Celular"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
          <span className="hidden sm:inline">Instalar no Android</span>
          <span className="sm:hidden">Instalar App</span>
        </button>
      )}

      {variant === 'menu' && (
        <button
          onClick={handleClick}
          className="w-full text-left px-3 py-2 text-xs text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-semibold transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Instalar Aplicativo no Celular (PWA)</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-[#0F4C81] to-[#1E3A8A] text-white p-3 rounded-xl flex items-center justify-between shadow-md mb-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <img src="/pwa-192x192.png" alt="Icon" className="w-8 h-8 rounded-lg" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Minhas Economias no Android</h4>
              <p className="text-[11px] text-sky-200">
                Instale no seu celular para acessar suas finanças em tela cheia com alta velocidade!
              </p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Instalar
          </button>
        </div>
      )}

      {/* Guide Modal when direct prompt is not supported or needs manual browser step */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0F4C81]">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">
                  {isIOS ? 'Instalar no iPhone / iPad' : 'Instalar no Android'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <img src="/pwa-192x192.png" alt="Logo" className="w-12 h-12 rounded-xl shadow-xs" />
              <div>
                <strong className="block text-slate-900 text-xs font-bold">Minhas Economias</strong>
                <span className="text-[11px] text-slate-500">
                  Aplicativo PWA Oficial • Sincronizado na Nuvem
                </span>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-slate-600">
                <p className="font-semibold text-slate-800">Passos para instalar no iOS (Safari):</p>
                <ol className="list-decimal list-inside space-y-2 pl-1 text-[11px]">
                  <li className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#0F4C81] shrink-0" />
                    <span>Toque no botão <strong>Compartilhar</strong> na barra do Safari.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <PlusSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Toque em <strong>Adicionar</strong> no topo direito. Pronto!</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2.5 text-slate-600">
                <p className="font-semibold text-slate-800">Como instalar no Android:</p>
                <ol className="space-y-2.5 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Abra o link deste aplicativo no <strong>Google Chrome</strong> ou <strong>Samsung Internet</strong> no seu celular Android.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito do navegador.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </span>
                  </li>
                </ol>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px]">
                  ✨ O ícone do <strong>Minhas Economias</strong> será adicionado à sua tela inicial e funcionará como um aplicativo nativo em tela cheia!
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 bg-[#0F4C81] hover:bg-[#0c3c66] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
