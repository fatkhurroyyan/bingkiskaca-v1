import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera as CameraIcon, RefreshCw, Printer, Check, AlertCircle } from 'lucide-react';
import { useKiosk } from '../kiosk/KioskContext';
import { useWebcam } from '../../hooks/useWebcam';
import { PhotoStripPreview } from '../kiosk/PhotoStripPreview';
import { DEFAULT_FRAME } from '../kiosk/frameData';
import { createWebmAnimationFromImages, blobToDataUrl } from '../../utils/createGif';

const TOTAL_SHOTS = 4;

export function ShootingScreen() {
  const { goToStep, setCapturedImages, state, useRetake, setRecordedVideoBlob, setRecordedGifBlob } = useKiosk();
  const { videoRef, status, error, startStream, captureFrame, startVideoRecording, stopVideoRecording, isRecording } = useWebcam();

  const [shots, setShots] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlash, setIsFlash] = useState(false);
  const [pendingShot, setPendingShot] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [isCreatingGif, setIsCreatingGif] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  const videoRecordingStartedRef = useRef(false);

  const currentShotNumber = shots.length + 1;
  const isReviewing = pendingShot !== null;
  const isFinished = shots.length === TOTAL_SHOTS && !isReviewing && countdown === null;
  const cameraReady = status === 'active';

  const beginCountdown = useCallback(() => {
    setPendingShot(null);
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (!cameraReady || isReviewing || isFinished) return;
    if (countdown === null && shots.length < TOTAL_SHOTS && pendingShot === null) {
      beginCountdown();
    }
  }, [cameraReady, isReviewing, isFinished, countdown, shots.length, pendingShot, beginCountdown]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => (c ? c - 1 : 0)), 1000);
      return () => clearTimeout(t);
    }

    // Start video recording before the first shot
    if (!isRecording && shots.length === 0) {
      startVideoRecording();
      videoRecordingStartedRef.current = true;
    }

    setIsFlash(true);
    const flashTimer = setTimeout(() => {
      setIsFlash(false);
      const frame = captureFrame();
      if (frame) {
        setPendingShot(frame);
      }
      setCountdown(null);
    }, 150);

    return () => clearTimeout(flashTimer);
  }, [countdown, captureFrame, shots.length, isRecording, startVideoRecording]);

  const handleRetakeCurrent = () => {
    setPendingShot(null);
    beginCountdown();
  };

  const handleContinue = async () => {
    if (!pendingShot) return;

    const newShots = [...shots, pendingShot];
    setShots(newShots);
    setPendingShot(null);

    if (newShots.length >= TOTAL_SHOTS) {
      // Stop video recording and create GIF
      setIsCreatingGif(true);
      try {
        setSavingStatus('Menghentikan rekaman video...');
        const video = await stopVideoRecording();
        if (video) {
          setVideoBlob(video);
          setRecordedVideoBlob(video);
        }

        // Create WebM animation from 4 captured photos
        setSavingStatus('Membuat animasi WebM dari 4 foto...');
        const gif = await createWebmAnimationFromImages(newShots, {
          width: 480,
          height: 640,
          delay: 1000,
        });
        setGifBlob(gif);
        setRecordedGifBlob(gif);
        setSavingStatus('Menyimpan ke disk...');
      } catch (err) {
        console.error('Error creating video/GIF:', err);
        setSavingStatus(null);
      } finally {
        setIsCreatingGif(false);
        setSavingStatus(null);
      }

      setCapturedImages(newShots);
    }
  };

  const handleRetakeAll = () => {
    if (state.retakesLeft <= 0) return;
    useRetake();
    setShots([]);
    setPendingShot(null);
    setCountdown(null);
    setVideoBlob(null);
    setGifBlob(null);
    setSavingStatus(null);
    videoRecordingStartedRef.current = false;
    beginCountdown();
  };

  const handleProceed = () => {
    setCapturedImages(shots);
    goToStep(8);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">

      {/* Live webcam feed */}
      <div className="absolute inset-0 bg-[#111] flex items-center justify-center overflow-hidden">
        <div className="w-full h-full max-w-[85vw] max-h-[85vh] aspect-video bg-gray-800 rounded-3xl relative overflow-hidden border-4 border-gray-700 shadow-2xl">
          {status === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
              <CameraIcon size={80} className="text-gray-500 opacity-50 mb-4 animate-pulse" />
              <p className="text-gray-400 font-bold tracking-widest">Mengakses kamera...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 p-8 text-center">
              <AlertCircle size={64} className="text-red-400 mb-4" />
              <p className="text-white font-bold text-lg mb-2">Kamera Tidak Tersedia</p>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">{error}</p>
              <button
                onClick={startStream}
                className="px-6 py-3 rounded-xl bg-[#884A00] text-white font-bold hover:bg-[#723e00] transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          {!cameraReady && status !== 'requesting' && status !== 'error' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CameraIcon size={120} className="text-gray-600 opacity-50" />
            </div>
          )}

          {/* Countdown overlay */}
          <AnimatePresence>
            {countdown !== null && countdown > 0 && !isReviewing && (
              <motion.div
                key={countdown}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20"
              >
                <span className="text-[300px] font-black text-white drop-shadow-[0_0_40px_rgba(0,0,0,0.5)] leading-none">
                  {countdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shot indicator */}
          {!isFinished && cameraReady && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-5 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
              <span className="text-white font-bold tracking-widest text-sm">
                FOTO {isReviewing ? currentShotNumber : currentShotNumber} / {TOTAL_SHOTS}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Flash overlay */}
      <AnimatePresence>
        {isFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Capture status grid */}
      {!isFinished && !isReviewing && (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-6 z-20">
          {[...Array(TOTAL_SHOTS)].map((_, i) => (
            <div
              key={i}
              className="w-24 h-32 rounded-xl border-2 overflow-hidden transition-all bg-black/50 backdrop-blur-md"
              style={{
                borderColor: i < shots.length ? '#884A00' : 'rgba(255,255,255,0.3)',
              }}
            >
              {i < shots.length && (
                <img
                  src={shots[i]}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Per-shot review overlay */}
      <AnimatePresence>
        {isReviewing && pendingShot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-12"
          >
            <h2 className="text-white text-3xl font-bold mb-2">Foto {currentShotNumber} Selesai!</h2>
            <p className="text-white/60 text-lg mb-8">Bagus? Lanjut ke foto berikutnya, atau ambil ulang.</p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white mb-12"
            >
              <img src={pendingShot} alt={`Preview foto ${currentShotNumber}`} className="w-full h-full object-cover" />
            </motion.div>

            <div className="flex gap-6 w-full max-w-2xl">
              <button
                onClick={handleRetakeCurrent}
                className="flex-1 py-5 rounded-2xl border-2 border-white text-white text-xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={24} />
                Ambil Ulang
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-5 rounded-2xl bg-[#884A00] text-white text-xl font-bold shadow-[0_0_40px_rgba(136,74,0,0.5)] flex items-center justify-center gap-3 hover:bg-[#723e00] transition-colors border-2 border-[#884A00]"
              >
                <Check size={24} />
                {currentShotNumber < TOTAL_SHOTS ? 'Lanjutkan' : 'Selesai'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final review overlay */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-12"
          >
            <h2 className="text-white text-4xl font-bold mb-4">Hasil Foto Kamu</h2>
            <p className="text-white/60 text-lg mb-10">Fotomu sudah dimasukkan ke frame yang dipilih.</p>

            {/* Saving status badge */}
            <AnimatePresence>
              {(isCreatingGif || savingStatus) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 flex items-center gap-3 px-5 py-3 rounded-full bg-[#884A00]/30 border border-[#884A00]/50 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-transparent border-t-[#f5a623] border-r-[#f5a623]"
                  />
                  <span className="text-[#f5a623] font-semibold text-sm tracking-wide">
                    {savingStatus ?? 'Memproses...'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Video & GIF saved badges */}
            <AnimatePresence>
              {!isCreatingGif && (videoBlob || gifBlob) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex gap-3"
                >
                  {videoBlob && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-400/40 text-green-300 text-xs font-bold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Video tersimpan ✓
                    </span>
                  )}
                  {gifBlob && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      WebM Animasi tersimpan ✓
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 transform -rotate-1"
            >
              <PhotoStripPreview
                frame={state.selectedFrame ?? DEFAULT_FRAME}
                photos={shots}
                className="w-[280px] h-[480px] border border-white/20"
              />
            </motion.div>

            <div className="flex gap-6 w-full max-w-2xl">
              <button
                onClick={handleRetakeAll}
                disabled={state.retakesLeft <= 0 || isCreatingGif}
                className="flex-1 py-5 rounded-2xl border-2 border-white text-white text-xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw size={24} />
                Ulangi Semua ({state.retakesLeft}x)
              </button>
              <button
                onClick={handleProceed}
                disabled={isCreatingGif}
                className="flex-1 py-5 rounded-2xl bg-[#884A00] text-white text-xl font-bold shadow-[0_0_40px_rgba(136,74,0,0.5)] flex items-center justify-center gap-3 hover:bg-[#723e00] transition-colors border-2 border-[#884A00] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer size={24} />
                Simpan & Cetak
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
