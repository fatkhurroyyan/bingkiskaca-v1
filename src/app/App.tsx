import type { ReactElement } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KioskProvider, useKiosk } from './components/kiosk/KioskContext';
import type { KioskStep } from './components/kiosk/types';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { InstructionScreen } from './components/screens/InstructionScreen';
import { StripSelectorScreen } from './components/screens/StripSelectorScreen';
import { PaymentScreen } from './components/screens/PaymentScreen';
import { TimeLimitScreen } from './components/screens/TimeLimitScreen';
import { FrameSelectorScreen } from './components/screens/FrameSelectorScreen';
import { ShootingScreen } from './components/screens/ShootingScreen';
import { ProcessingScreen } from './components/screens/ProcessingScreen';
import { FinalScreen } from './components/screens/FinalScreen';

const STEP_LABELS: Record<KioskStep, string> = {
  1: 'Selamat Datang',
  2: 'Instruksi',
  3: 'Pilih Paket',
  4: 'Pembayaran',
  5: 'Mulai Sesi',
  6: 'Pilih Frame',
  7: 'Foto-Foto',
  8: 'Memproses',
  9: 'Selesai',
};

function StepIndicator({ current }: { current: KioskStep }) {
  if (current === 1) return null;
  const steps: KioskStep[] = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center gap-1.5 px-6 py-2"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(136,74,0,0.08)',
      }}
    >
      {steps.map(s => {
        const done = current > s;
        const active = current === s;
        return (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300"
              style={{
                background: active ? 'rgba(136,74,0,0.1)' : done ? 'rgba(136,74,0,0.05)' : 'rgba(0,0,0,0.03)',
                border: active ? '1px solid rgba(136,74,0,0.6)' : done ? '1px solid rgba(136,74,0,0.3)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {done ? (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#884a00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span style={{ color: active ? '#884a00' : 'rgba(0,0,0,0.3)', fontSize: '0.62rem', fontWeight: 700 }}>{s}</span>
              )}
              <span
                style={{
                  color: active ? '#884a00' : done ? 'rgba(136,74,0,0.7)' : 'rgba(0,0,0,0.25)',
                  fontSize: '0.62rem',
                  fontWeight: active ? 700 : 500,
                }}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {s < 9 && <div style={{ width: 12, height: 1, background: done ? 'rgba(136,74,0,0.3)' : 'rgba(0,0,0,0.08)' }} />}
          </div>
        );
      })}
    </div>
  );
}

function KioskApp() {
  const { state } = useKiosk();
  const step = state.currentStep;
  const showIndicator = step > 1 && step < 9;

  const screenMap: Record<KioskStep, ReactElement> = {
    1: <WelcomeScreen />,
    2: <InstructionScreen />,
    3: <StripSelectorScreen />,
    4: <PaymentScreen />,
    5: <TimeLimitScreen />,
    6: <FrameSelectorScreen />,
    7: <ShootingScreen />,
    8: <ProcessingScreen />,
    9: <FinalScreen />,
  };

  return (
    <div
      className="kiosk-root relative w-full h-full overflow-hidden bg-[#fcfcfc]"
    >
      {showIndicator && <StepIndicator current={step} />}

      <div
        className="absolute inset-0"
        style={{ top: showIndicator ? 36 : 0 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-full"
          >
            {screenMap[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <KioskProvider>
      <KioskApp />
    </KioskProvider>
  );
}
