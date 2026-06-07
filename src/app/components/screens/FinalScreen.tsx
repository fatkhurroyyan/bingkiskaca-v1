import { motion } from 'motion/react';
import { useKiosk } from '../kiosk/KioskContext';
import { QrCode, Link, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { PhotoStripPreview } from '../kiosk/PhotoStripPreview';
import { DEFAULT_FRAME } from '../kiosk/frameData';

export function FinalScreen() {
  const { goToStep, reset, state } = useKiosk();
  const frame = state.selectedFrame ?? DEFAULT_FRAME;

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleFinish = () => {
    reset();
    goToStep(1);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-[#f4f2f0]">
      <div className="w-full max-w-7xl h-[85vh] flex gap-16">

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-1/2 h-full flex items-center justify-center relative"
        >
          <div className="absolute w-[400px] h-[600px] bg-[#884A00] rounded-full blur-[100px] opacity-10" />

          <div className="relative transform -rotate-2 hover:rotate-0 transition-all duration-500">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 backdrop-blur-md shadow-sm transform -rotate-2 mix-blend-overlay z-10" />

            {state.finalFrameUrl ? (
              <img
                src={state.finalFrameUrl}
                alt="Hasil foto strip Bingkis Kaca"
                className="w-[340px] h-[700px] object-contain shadow-2xl rounded-sm border border-gray-100 bg-white"
              />
            ) : (
              <PhotoStripPreview
                frame={frame}
                photos={state.capturedImages}
                className="w-[340px] h-[700px] border border-gray-100"
              />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="w-1/2 h-full flex flex-col justify-center gap-8"
        >
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Yeay! Selesai 🎉</h1>
            <p className="text-xl text-gray-500">Scan QR Code di bawah untuk menyimpan softfile fotomu.</p>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex gap-8 items-center">
            <div className="p-2 border-2 border-dashed border-[#884A00] rounded-2xl bg-orange-50 w-[176px] h-[176px] flex-shrink-0 aspect-square flex items-center justify-center overflow-hidden">
              {state.shareUrl ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=884a00&data=${encodeURIComponent(state.shareUrl)}`}
                  alt="QR Code"
                  className="w-[160px] h-[160px] aspect-square object-contain"
                />
              ) : (
                <QrCode size={160} strokeWidth={1.2} className="text-[#884A00] animate-pulse aspect-square" />
              )}
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <h3 className="font-bold text-gray-800 text-xl">Scan untuk Download</h3>
              <p className="text-gray-500 text-sm">File akan tersedia selama 24 jam di server kami.</p>

              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                <Link size={18} className="text-gray-400" />
                <span className="font-mono text-gray-600 font-medium text-sm flex-1 truncate">
                  {state.shareUrl ?? 'Menghubungkan...'}
                </span>
                {state.shareUrl && (
                  <a
                    href={state.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#884A00] hover:text-[#723e00]"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#884A00] p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white text-center">
            <p className="text-white/80 font-medium text-sm uppercase tracking-widest mb-1">Kode Transaksi</p>
            <p className="font-mono font-bold text-3xl tracking-widest">{state.transactionCode ?? 'BK-2026-XXXX'}</p>
          </div>

          <div className="mt-auto flex justify-end">
            <button
              onClick={handleFinish}
              className="px-12 py-5 rounded-2xl bg-[#884A00] text-white text-xl font-bold shadow-xl hover:bg-[#723e00] transition-colors flex items-center gap-3"
            >
              Selesai & Keluar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
