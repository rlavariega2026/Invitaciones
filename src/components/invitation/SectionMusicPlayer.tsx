import React, { useEffect, useState } from 'react';
import { ambientMusic } from '../../audio/ambientMusic';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';

interface SectionMusicPlayerProps {
  styleName?: string;
  autoplayAfterOpen?: boolean;
  customAudioUrl?: string;
}

export const SectionMusicPlayer: React.FC<SectionMusicPlayerProps> = ({
  styleName = 'romantic_harp',
  autoplayAfterOpen = true,
  customAudioUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    ambientMusic.setCustomAudio(customAudioUrl || null);
  }, [customAudioUrl]);

  useEffect(() => {
    const unsubscribe = ambientMusic.subscribe((state) => {
      setIsPlaying(state);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = () => {
    ambientMusic.toggle(styleName);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientMusic.setVolume(val);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      {showVolumeSlider && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#E8DEC8] animate-in fade-in slide-in-from-right-3 duration-200">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-[#DFC48B] cursor-pointer"
          />
          <span className="text-[10px] font-mono text-stone-600">{Math.round(volume * 100)}%</span>
        </div>
      )}

      <div className="flex items-center rounded-full bg-white/90 backdrop-blur-md shadow-md border border-[#E8DEC8] p-1.5 transition-all hover:bg-white">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF5EB] hover:bg-[#F3EADB] text-stone-800 text-xs font-serif font-medium transition-colors"
          title={isPlaying ? 'Pausar música' : 'Reproducir música'}
        >
          {isPlaying ? (
            <>
              <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                <span className="w-0.5 bg-[#9C7A3C] h-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                <span className="w-0.5 bg-[#9C7A3C] h-2/3 animate-[pulse_0.8s_ease-in-out_infinite]" />
                <span className="w-0.5 bg-[#9C7A3C] h-4/5 animate-[pulse_0.5s_ease-in-out_infinite]" />
              </div>
              <span className="text-[11px] font-sans text-[#9C7A3C] font-semibold">Música Activa</span>
            </>
          ) : (
            <>
              <Music className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-[11px] font-sans text-stone-600">Música</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full transition-colors ml-1"
          title="Ajustar volumen"
        >
          {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
