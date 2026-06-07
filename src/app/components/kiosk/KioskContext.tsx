import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { KioskStep, KioskState, StripPackage, FrameOption } from './types';

const initialState: KioskState = {
  currentStep: 1,
  selectedPackage: null,
  isPaid: false,
  capturedImages: [],
  selectedFrame: null,
  finalFrameUrl: null,
  transactionCode: null,
  retakesLeft: 1,
  shareUrl: undefined,
};

interface KioskContextValue {
  state: KioskState;
  goToStep: (step: KioskStep) => void;
  selectPackage: (pkg: StripPackage) => void;
  setIsPaid: () => void;
  setCapturedImages: (images: string[]) => void;
  selectFrame: (frame: FrameOption) => void;
  setFinalFrameUrl: (url: string) => void;
  setTransactionCode: (code: string) => void;
  setRecordedVideoBlob: (blob: Blob | undefined) => void;
  setRecordedGifBlob: (blob: Blob | undefined) => void;
  setShareUrl: (url: string | undefined) => void;
  useRetake: () => void;
  reset: () => void;
}

const KioskContext = createContext<KioskContextValue | null>(null);

export function KioskProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<KioskState>(initialState);

  const goToStep = useCallback((step: KioskStep) => {
    setState(s => ({ ...s, currentStep: step }));
  }, []);

  const selectPackage = useCallback((pkg: StripPackage) => {
    setState(s => ({ ...s, selectedPackage: pkg }));
  }, []);

  const setIsPaid = useCallback(() => {
    setState(s => ({ ...s, isPaid: true }));
  }, []);

  const setCapturedImages = useCallback((images: string[]) => {
    setState(s => ({ ...s, capturedImages: images }));
  }, []);

  const selectFrame = useCallback((frame: FrameOption) => {
    setState(s => ({ ...s, selectedFrame: frame }));
  }, []);

  const setFinalFrameUrl = useCallback((url: string) => {
    setState(s => ({ ...s, finalFrameUrl: url }));
  }, []);

  const setTransactionCode = useCallback((code: string) => {
    setState(s => ({ ...s, transactionCode: code }));
  }, []);

  const setRecordedVideoBlob = useCallback((blob: Blob | undefined) => {
    setState(s => ({ ...s, recordedVideoBlob: blob }));
  }, []);

  const setRecordedGifBlob = useCallback((blob: Blob | undefined) => {
    setState(s => ({ ...s, recordedGifBlob: blob }));
  }, []);

  const setShareUrl = useCallback((url: string | undefined) => {
    setState(s => ({ ...s, shareUrl: url }));
  }, []);

  const useRetake = useCallback(() => {
    setState(s => ({
      ...s,
      retakesLeft: Math.max(0, s.retakesLeft - 1),
      capturedImages: [],
      recordedVideoBlob: undefined,
      recordedGifBlob: undefined,
      shareUrl: undefined,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <KioskContext.Provider
      value={{ state, goToStep, selectPackage, setIsPaid, setCapturedImages, selectFrame, setFinalFrameUrl, setTransactionCode, setRecordedVideoBlob, setRecordedGifBlob, setShareUrl, useRetake, reset }}
    >
      {children}
    </KioskContext.Provider>
  );
}

export function useKiosk() {
  const ctx = useContext(KioskContext);
  if (!ctx) throw new Error('useKiosk must be used within KioskProvider');
  return ctx;
}
