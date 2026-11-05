import { createContext, useContext } from 'react';
import { BackgroundConfig } from '../../types/invitation';

export interface MotifEditorContextValue {
  isEditor: boolean;
  updateSectionBackground?: (sectionId: string, background: BackgroundConfig) => void;
}

export const MotifEditorContext = createContext<MotifEditorContextValue>({ isEditor: false });
export const useMotifEditor = () => useContext(MotifEditorContext);
