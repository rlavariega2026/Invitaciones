import React, { useState, useEffect } from 'react';

interface SectionCountdownProps {
  eventDate: string; // YYYY-MM-DD
  eventTime?: string; // HH:mm
  primaryColor?: string;
  isPlainMode?: boolean;
  styleType?: 'clean_numbers' | 'boxed';
  position?: 'top' | 'center' | 'bottom';
}

export const SectionCountdown: React.FC<SectionCountdownProps> = ({
  eventDate,
  eventTime = '17:00',
  primaryColor = '#9C7A3C',
  isPlainMode = false,
  styleType,
  position = 'center',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const targetStr = `${eventDate}T${eventTime}:00`;
      const target = new Date(targetStr).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  const units = [
    { label: 'DÍAS', value: timeLeft.days },
    { label: 'HORAS', value: timeLeft.hours },
    { label: 'MINUTOS', value: timeLeft.minutes },
    { label: 'SEGUNDOS', value: timeLeft.seconds },
  ];

  const useClean = isPlainMode || styleType === 'clean_numbers';

  const positionClasses =
    position === 'top'
      ? 'mb-6 mt-1'
      : position === 'bottom'
      ? 'mt-6 mb-1'
      : 'my-4';

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-4 ${positionClasses}`}>
      {units.map((u, i) => (
        <div key={i} className="flex flex-col items-center">
          {useClean ? (
            /* Modo Solo Texto: SIN RECUADROS, SIN CAJAS, NÚMEROS LIMPIOS */
            <div className="flex items-center">
              <span
                className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tabular-nums tracking-wider"
                style={{ color: primaryColor }}
              >
                {String(u.value).padStart(2, '0')}
              </span>
              {i < units.length - 1 && (
                <span className="text-stone-400 font-serif text-lg mx-1 sm:mx-1.5 opacity-60">
                  :
                </span>
              )}
            </div>
          ) : (
            /* Modo Recuadro: Cajas compactas y estilizadas */
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white/95 backdrop-blur-xs shadow-xs border border-[#E8DEC8] flex items-center justify-center">
              <span
                className="text-lg sm:text-2xl font-serif font-bold tabular-nums"
                style={{ color: primaryColor }}
              >
                {String(u.value).padStart(2, '0')}
              </span>
            </div>
          )}
          <span className="text-[9px] uppercase tracking-widest font-semibold text-stone-500 mt-1">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
};
