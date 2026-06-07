import GIF from 'gif.js';

/**
 * Load an image from a data URL and return an HTMLImageElement.
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from data URL`));
    img.src = dataUrl;
  });
}

export async function createGifFromImages(
  images: string[],
  options: {
    width?: number;
    height?: number;
    delay?: number;
    quality?: number;
  } = {}
): Promise<Blob> {
  const {
    width = 400,
    height = 533,
    delay = 600,
    quality = 8,
  } = options;

  // Load ALL images first before touching GIF (critical: prevents render() with 0 frames)
  const loadedImages = await Promise.all(images.map(loadImage));

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality,
      width,
      height,
      workerScript: '/gif.worker.js',
    });

    // Draw each image onto a canvas scaled to the GIF dimensions
    for (const img of loadedImages) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2D context'));
        return;
      }
      // Cover-fill: scale image to fill the canvas
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const sx = (width - sw) / 2;
      const sy = (height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
      gif.addFrame(canvas, { delay, copy: true });
    }

    gif.on('finished', (blob) => {
      resolve(blob);
    });

    gif.on('error', (error) => {
      reject(error);
    });

    // Now safe to render — all frames already added
    gif.render();
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  const sx = (width - sw) / 2;
  const sy = (height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh);
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  drawCoverImage(ctx, img, width, height);
}

export async function createWebmAnimationFromImages(
  images: string[],
  options: {
    width?: number;
    height?: number;
    delay?: number;
    fadeDuration?: number;
  } = {}
): Promise<Blob> {
  const {
    width = 480,
    height = 640,
    delay = 1000,
    fadeDuration = 200,
  } = options;

  // Load ALL images first
  const loadedImages = await Promise.all(images.map(loadImage));

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get 2D context'));
      return;
    }

    const fps = 15;
    const stream = canvas.captureStream(fps);
    
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    recorder.onerror = (err) => {
      reject(err);
    };

    // Draw first frame immediately
    drawCover(ctx, loadedImages[0], width, height);
    recorder.start();

    let currentImageIndex = 0;
    let elapsedMs = 0;
    const drawIntervalMs = 1000 / fps;

    const timer = setInterval(() => {
      elapsedMs += drawIntervalMs;
      if (elapsedMs >= delay) {
        elapsedMs = 0;
        currentImageIndex++;
        if (currentImageIndex >= loadedImages.length) {
          clearInterval(timer);
          recorder.stop();
          return;
        }
      }
      
      const currentImg = loadedImages[currentImageIndex];
      const prevImg = currentImageIndex > 0 ? loadedImages[currentImageIndex - 1] : null;

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;

      if (prevImg && elapsedMs < fadeDuration) {
        // Draw previous image first
        drawCoverImage(ctx, prevImg, width, height);
        // Draw current image on top with crossfade alpha
        const alpha = elapsedMs / fadeDuration;
        ctx.globalAlpha = alpha;
        drawCoverImage(ctx, currentImg, width, height);
      } else {
        // Just draw current image
        drawCoverImage(ctx, currentImg, width, height);
      }
      
      ctx.globalAlpha = 1.0; // Reset alpha
    }, drawIntervalMs);
  });
}
