import React from 'react';
import { ButtonCustomConfig, FontFamilyType } from '../../types/invitation';
import { BUTTON_CATALOG } from '../../data/buttonCatalog';
import {
  Crown,
  Heart,
  Sparkles,
  Flower2,
  Check,
  MapPin,
  Calendar,
  Share2,
  ArrowRight,
  Music,
  Gift,
} from 'lucide-react';

interface CustomButtonRendererProps {
  config?: ButtonCustomConfig;
  defaultText?: string;
  onClick?: () => void;
  className?: string;
}

export const CustomButtonRenderer: React.FC<CustomButtonRendererProps> = ({
  config,
  defaultText = 'Confirmar Asistencia',
  onClick,
  className = '',
}) => {
  const buttonStyleId = config?.buttonStyleId || 'btn-1';
  const buttonDef = BUTTON_CATALOG.find((b) => b.id === buttonStyleId) || BUTTON_CATALOG[0];

  const getFontFamilyClass = (f?: FontFamilyType) => {
    switch (f) {
      case 'cinzel':
        return 'font-cinzel';
      case 'cinzel_dec':
        return 'font-cinzel-dec';
      case 'cormorant':
        return 'font-cormorant';
      case 'playfair':
        return 'font-playfair';
      case 'bodoni':
        return 'font-bodoni';
      case 'prata':
        return 'font-prata';
      case 'marcellus':
        return 'font-marcellus';
      case 'script':
        return 'font-script';
      case 'brush':
        return 'font-brush';
      case 'pinyon':
        return 'font-pinyon';
      case 'parisienne':
        return 'font-parisienne';
      case 'allura':
        return 'font-allura';
      case 'fredoka':
        return 'font-fredoka';
      case 'comfortaa':
        return 'font-comfortaa';
      case 'outfit':
        return 'font-outfit';
      case 'urbanist':
        return 'font-urbanist';
      case 'montserrat':
        return 'font-montserrat';
      case 'sans':
      default:
        return 'font-sans-clean';
    }
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName || buttonDef.iconName) {
      case 'Crown':
        return <Crown className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4 fill-current/20" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Flower2':
        return <Flower2 className="w-4 h-4" />;
      case 'Check':
        return <Check className="w-4 h-4" />;
      case 'MapPin':
        return <MapPin className="w-4 h-4" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4" />;
      case 'Music':
        return <Music className="w-4 h-4" />;
      case 'Gift':
        return <Gift className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const customStyle: React.CSSProperties = {};
  if (config?.customColor) customStyle.color = config.customColor;
  if (config?.customBgColor) customStyle.backgroundColor = config.customBgColor;
  if (config?.customBorderColor) customStyle.borderColor = config.customBorderColor;
  if (config?.borderRadius !== undefined) customStyle.borderRadius = `${config.borderRadius}px`;
  if (config?.borderWidth !== undefined) customStyle.borderWidth = `${config.borderWidth}px`;
  if (config?.fontSize !== undefined) customStyle.fontSize = `${config.fontSize}px`;

  return (
    <button
      type="button"
      onClick={onClick}
      style={customStyle}
      className={`inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
        buttonDef.className
      } ${getFontFamilyClass(config?.fontFamily || buttonDef.fontFamily)} ${className}`}
    >
      {renderIcon(config?.icon)}
      <span>{config?.label || defaultText || buttonDef.defaultText}</span>
    </button>
  );
};
