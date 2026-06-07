import { useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useKiosk } from '../kiosk/KioskContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import imgLogoBingkiskaca1 from 'figma:asset/bff80b03a625c33bc8d9866a2352cd47600eec16.png';

export function WelcomeScreen() {
  const { goToStep } = useKiosk();

  const handleStart = useCallback(() => {
    goToStep(2);
  }, [goToStep]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleStart]);

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center bg-white"
      onClick={handleStart}
      style={{ cursor: 'pointer' }}
    >
      {/* Ambient background geometry */}
      <motion.div
        className="absolute rounded-full pointer-events-none opacity-20"
        style={{
          width: 800, height: 800,
          background: 'radial-gradient(circle, #884A00 0%, transparent 60%)',
          top: '-20%', left: '-15%',
        }}
        animate={{ x: [0, 50, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none opacity-10"
        style={{
          width: 700, height: 700,
          background: 'radial-gradient(circle, #884A00 0%, transparent 60%)',
          bottom: '-15%', right: '-10%',
        }}
        animate={{ x: [0, -40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-10 text-center px-8 w-full max-w-4xl">
        {/* Brand logo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl px-12"
        >
          <ImageWithFallback 
            src={imgLogoBingkiskaca1} 
            alt="Bingkis Kaca" 
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* Event badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="px-8 py-3 rounded-full shadow-lg"
          style={{
            background: '#884A00',
          }}
        >
          <p className="text-white text-xl font-semibold tracking-wider">
            Event: SakuBumi Graduation Party 2026
          </p>
        </motion.div>

        {/* Blinking CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ marginTop: '10vh' }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-[#884A00] text-4xl font-bold tracking-wide drop-shadow-sm">
              Sentuh Layar atau Tekan SPASI untuk Mulai
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
