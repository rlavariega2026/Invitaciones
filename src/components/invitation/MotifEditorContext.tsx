import { createContext, useContext } from 'react';
import { InvitationMotif } from '../../types/invitation';

export interface MotifEditorContextValue {
  isEditor: boolean;
  updateMotif?: (sectionId: string, motifId: string, fields: Partial<InvitationMotif>) => void;
  selectMotif?: (sectionId: string, motifId: string) => void;
}

export const MotifEditorContext = createContext<MotifEditorContextValue>({ isEditor: false });
export const useMotifEditor = () => useContext(MotifEditorContext);
