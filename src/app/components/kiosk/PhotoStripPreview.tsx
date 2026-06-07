import type { FrameOption } from './types';
import { getBrandingColor } from './frameData';

interface PhotoStripPreviewProps {
  frame: FrameOption;
  photos?: string[];
  className?: string;
}

export function PhotoStripPreview({ frame, photos = [], className = '' }: PhotoStripPreviewProps) {
  const brandingColor = getBrandingColor(frame.id);

  return (
    <div
      className={`relative flex flex-col p-5 pb-20 shadow-2xl rounded-sm ${className}`}
      style={{ backgroundColor: frame.primaryColor }}
    >
      {frame.pattern !== 'minimal' && (
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none rounded-sm"
          style={{
            backgroundImage:
              frame.pattern === 'floral'
                ? 'radial-gradient(circle at 20% 30%, #884A00 1px, transparent 1px), radial-gradient(circle at 80% 70%, #884A00 1px, transparent 1px)'
                : frame.pattern === 'sakura'
                  ? 'radial-gradient(circle at 25% 25%, #f9a8d4 2px, transparent 2px), radial-gradient(circle at 75% 60%, #f9a8d4 2px, transparent 2px)'
                  : 'none',
            backgroundSize: '40px 40px',
          }}
        />
      )}

      <div className="relative flex flex-col gap-3 flex-1 min-h-0">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="flex-1 w-full overflow-hidden rounded-sm min-h-[80px]"
            style={{ backgroundColor: photos[i] ? undefined : `${frame.secondaryColor}33` }}
          >
            {photos[i] ? (
              <img
                src={photos[i]}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-400/30">
                <span className="text-gray-400 font-semibold tracking-widest text-xs">PHOTO {i + 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="font-['Gyahegi'] italic text-2xl" style={{ color: brandingColor }}>
          bingkis<span className="font-sans font-black not-italic ml-1">kaca.</span>
        </span>
      </div>
    </div>
  );
}
