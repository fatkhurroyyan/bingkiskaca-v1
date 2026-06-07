import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import { useKiosk } from '../kiosk/KioskContext';

export function TimeLimitScreen() {
  const { state, goToStep } = useKiosk();
  const mins = state.selectedPackage?.allocatedTime || 5;
  const [timeLeft, setTimeLeft] = useState(3); // Just a 3s interstitial screen

  useEffect(() => {
    if (timeLeft <= 0) {
      goToStep(6);
      return;
    }
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, goToStep]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* High contrast radiating pulse */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(136,74,0,0.15) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          className="text-[#884A00]"
        >
          <ShieldAlert size={140} strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight max-w-4xl"
        >
          Waktu Sesi Anda Dimulai Sekarang!
        </motion.h1>

        {/* Circular counter UI representing total time allocated */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative w-72 h-72 rounded-full border-8 border-orange-100 flex items-center justify-center mt-4 bg-white shadow-2xl"
        >
          {/* Animated stroke */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="144" cy="144" r="136"
              fill="none"
              stroke="#884A00"
              strokeWidth="8"
              strokeDasharray="854"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-7xl font-black text-[#884A00] tracking-tighter">
            {mins.toString().padStart(2, '0')}:00
          </div>
        </motion.div>
      </div>
    </div>
  );
}
