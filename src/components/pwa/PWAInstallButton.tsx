import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'minimal' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, do not show install prompt
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors shadow-xs border border-rose-200"
          title="Instalar LAV Invitations en tu dispositivo"
        >
          <Download className="w-3.5 h-3.5 text-rose-700" />
          <span className="whitespace-nowrap">Instalar App</span>
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-200"
          title="Instalar en iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-700" />
          <span className="whitespace-nowrap">Instalar en iOS</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#FDFBF7] p-6 shadow-xl border border-[#E8DEC8] relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-800 font-serif font-bold text-lg">
                LAV
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 font-serif">Instalar en tu iPhone o iPad</h3>
                <p className="text-xs text-slate-500">Accede como una App nativa independiente</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-[#EBE4DA]">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 text-rose-700 font-semibold flex items-center justify-center text-[11px]">
                  1
                </span>
                <span>
                  Toca el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-sky-600" /> en la barra inferior de Safari.
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-[#EBE4DA]">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 text-rose-700 font-semibold flex items-center justify-center text-[11px]">
                  2
                </span>
                <span>
                  Desliza hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-[#EBE4DA]">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 text-rose-700 font-semibold flex items-center justify-center text-[11px]">
                  3
                </span>
                <span>
                  Toca <strong>"Agregar"</strong> en la esquina superior derecha. ¡Listo!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#E8DEC8] hover:bg-[#DFCDB4] text-slate-800 text-xs font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
