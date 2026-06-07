import type { FrameOption } from './types';

export const FRAME_OPTIONS: FrameOption[] = [
  { id: 'f1', name: 'Classic Minimal', description: 'Clean white', primaryColor: '#ffffff', secondaryColor: '#e5e5e5', pattern: 'minimal' },
  { id: 'f2', name: 'Midnight Dark', description: 'Dark theme', primaryColor: '#1a1a1a', secondaryColor: '#333333', pattern: 'minimal' },
  { id: 'f3', name: 'Vintage Brown', description: 'Signature brown', primaryColor: '#884A00', secondaryColor: '#6a3a00', pattern: 'floral' },
  { id: 'f4', name: 'Soft Cream', description: 'Creamy look', primaryColor: '#fdfbf7', secondaryColor: '#e0d8c8', pattern: 'minimal' },
  { id: 'f5', name: 'Blush Pink', description: 'Pink vibes', primaryColor: '#fdf2f8', secondaryColor: '#f9a8d4', pattern: 'sakura' },
  { id: 'f6', name: 'Sage Green', description: 'Fresh green', primaryColor: '#f0fdf4', secondaryColor: '#86efac', pattern: 'minimal' },
];

export const DEFAULT_FRAME = FRAME_OPTIONS[0];

export function getBrandingColor(frameId: string): string {
  return frameId === 'f2' ? '#ffffff' : '#884A00';
}
