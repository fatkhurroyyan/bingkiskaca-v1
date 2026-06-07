export type KioskStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface StripPackage {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  allocatedTime: number;
  aspectW: number;
  aspectH: number;
  description: string;
  popular?: boolean;
  color: string;
}

export interface FrameOption {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: 'floral' | 'stars' | 'film' | 'minimal' | 'sakura' | 'neon';
}

export interface KioskState {
  currentStep: KioskStep;
  selectedPackage: StripPackage | null;
  isPaid: boolean;
  capturedImages: string[];
  selectedFrame: FrameOption | null;
  finalFrameUrl: string | null;
  transactionCode: string | null;
  retakesLeft: number;
  recordedVideoBlob?: Blob;
  recordedGifBlob?: Blob;
  shareUrl?: string;
}
