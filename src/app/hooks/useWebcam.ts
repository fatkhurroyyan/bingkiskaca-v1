import { useCallback, useEffect, useRef, useState } from 'react';

type WebcamStatus = 'idle' | 'requesting' | 'active' | 'error';

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<WebcamStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    stopStream();
    setStatus('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus('active');
    } catch (err) {
      stopStream();
      setStatus('error');
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Akses kamera ditolak. Izinkan kamera di browser untuk melanjutkan.');
        } else if (err.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan di perangkat ini.');
        } else {
          setError('Gagal mengakses kamera. Coba lagi.');
        }
      } else {
        setError('Gagal mengakses kamera. Coba lagi.');
      }
    }
  }, [stopStream]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  const startVideoRecording = useCallback(() => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : 'video/webm';

    const recorder = new MediaRecorder(streamRef.current, { mimeType });

    recorder.ondataavailable = (event) => {
      recordedChunksRef.current.push(event.data);
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  }, []);

  const stopVideoRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!recorderRef.current) {
        resolve(null);
        return;
      }

      const recorder = recorderRef.current;

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        recordedChunksRef.current = [];
        recorderRef.current = null;
        setIsRecording(false);
        resolve(videoBlob);
      };

      recorder.stop();
    });
  }, []);

  useEffect(() => {
    startStream();
    return () => stopStream();
  }, [startStream, stopStream]);

  return { 
    videoRef, 
    status, 
    error, 
    startStream, 
    captureFrame, 
    stopStream,
    startVideoRecording,
    stopVideoRecording,
    isRecording,
  };
}
