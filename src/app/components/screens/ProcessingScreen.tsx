import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useKiosk } from '../kiosk/KioskContext';
import { composePhotoStrip } from '../../utils/composePhotoStrip';
import { DEFAULT_FRAME } from '../kiosk/frameData';
import { saveAllPhotos } from '../../utils/savePhotos';
import { generateSessionId } from '../../utils/sessionId';

const PROCESSING_DURATION_MS = 5000;

export function ProcessingScreen() {
  const { goToStep, setFinalFrameUrl, setTransactionCode, setShareUrl, state } = useKiosk();

  useEffect(() => {
    let cancelled = false;

    const process = async () => {
      const frame = state.selectedFrame ?? DEFAULT_FRAME;
      const photos = state.capturedImages;
      const sessionId = state.transactionCode ?? generateSessionId();

      if (!state.transactionCode && !cancelled) {
        setTransactionCode(sessionId);
      }

      let stripUrl: string | null = null;

      if (photos.length > 0) {
        stripUrl = await composePhotoStrip(photos, frame);
        if (!cancelled) setFinalFrameUrl(stripUrl);

        try {
          const res = await saveAllPhotos(photos, stripUrl, sessionId, state.recordedVideoBlob, state.recordedGifBlob);
          if (!cancelled && res.shareUrl) {
            setShareUrl(res.shareUrl);
          }
        } catch (err) {
          console.error('Failed to save photos to disk:', err);
        }
      }

      await new Promise(resolve => setTimeout(resolve, PROCESSING_DURATION_MS));

      if (!cancelled) goToStep(9);
    };

    process();
    return () => { cancelled = true; };
  }, [goToStep, setFinalFrameUrl, setTransactionCode, setShareUrl, state.capturedImages, state.selectedFrame, state.transactionCode, state.recordedVideoBlob, state.recordedGifBlob]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white relative overflow-hidden">

      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="w-[1200px] h-[1200px]"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, #884A00 50%, transparent 100%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-40 h-40 mb-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-[3px] border-dashed border-[#884A00]/30"
          />

          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-4 rounded-full border-4 border-[#884A00]/60"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-8 border-4 border-transparent border-t-[#884A00] border-b-[#884A00] rounded-full"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-8 h-8 bg-[#884A00] rounded-full shadow-[0_0_20px_#884A00]"
            />
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 tracking-tight"
        >
          Memproses Karyamu...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[#884A00] text-lg mt-4 font-medium tracking-wide max-w-md text-center"
        >
          Menempelkan fotomu ke frame Bingkis Kaca...
        </motion.p>
      </div>
    </div>
  );
}
