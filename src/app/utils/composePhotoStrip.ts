import type { FrameOption } from '../components/kiosk/types';
import { getBrandingColor } from '../components/kiosk/frameData';

const STRIP_WIDTH = 680;
const STRIP_HEIGHT = 1400;
const PADDING = 40;
const GAP = 24;
const FOOTER_HEIGHT = 160;
const PHOTO_COUNT = 4;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;

  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = img.width / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export async function composePhotoStrip(
  photos: string[],
  frame: FrameOption,
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = STRIP_WIDTH;
  canvas.height = STRIP_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = frame.primaryColor;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

  const contentWidth = STRIP_WIDTH - PADDING * 2;
  const contentHeight = STRIP_HEIGHT - PADDING * 2 - FOOTER_HEIGHT;
  const photoHeight = (contentHeight - GAP * (PHOTO_COUNT - 1)) / PHOTO_COUNT;

  const images = await Promise.all(
    photos.slice(0, PHOTO_COUNT).map(photo => loadImage(photo)),
  );

  images.forEach((img, i) => {
    const x = PADDING;
    const y = PADDING + i * (photoHeight + GAP);
    drawCover(ctx, img, x, y, contentWidth, photoHeight);
  });

  const brandingColor = getBrandingColor(frame.id);
  ctx.fillStyle = brandingColor;
  ctx.font = 'italic 48px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('bingkis', STRIP_WIDTH / 2 - 30, STRIP_HEIGHT - 70);
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillText('kaca.', STRIP_WIDTH / 2 + 80, STRIP_HEIGHT - 70);

  return canvas.toDataURL('image/jpeg', 0.92);
}
