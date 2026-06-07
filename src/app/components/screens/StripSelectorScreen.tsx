import { motion } from 'motion/react';
import { Clock, Star } from 'lucide-react';
import { useKiosk } from '../kiosk/KioskContext';
import type { StripPackage } from '../kiosk/types';

const PACKAGES: StripPackage[] = [
  {
    id: 'mini-square',
    name: 'Mini Square Pack',
    subtitle: '2×2 Polaroid',
    price: 30000,
    allocatedTime: 4,
    aspectW: 1, aspectH: 1,
    description: 'Gaya polaroid mini yang super cute! Cocok untuk koleksi atau hiasan.',
    color: '#884A00',
  },
  {
    id: 'classic-double',
    name: 'Classic Double Strip',
    subtitle: '2×6 Inch',
    price: 35000,
    allocatedTime: 5,
    aspectW: 2, aspectH: 5,
    description: 'Dua strip klasik dalam satu lembaran. Perfect untuk dibagi berdua!',
    color: '#884A00',
    popular: true,
  },
  {
    id: 'fullframe-4r',
    name: 'Fullframe 4R Postcard',
    subtitle: '4R Postcard',
    price: 45000,
    allocatedTime: 7,
    aspectW: 4, aspectH: 5,
    description: 'Format postcard penuh dengan 4 foto tersusun estetis. Kualitas cetak premium!',
    color: '#884A00',
  },
  {
    id: 'premium-deluxe',
    name: 'Premium Deluxe Strip',
    subtitle: 'Wide Strip 4×6',
    price: 55000,
    allocatedTime: 10,
    aspectW: 3, aspectH: 5,
    description: 'Pengalaman foto terlengkap! Strip lebar premium dengan waktu sesi terpanjang.',
    color: '#884A00',
  },
];

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function StripSelectorScreen() {
  const { selectPackage, goToStep } = useKiosk();

  const handleSelect = (pkg: StripPackage) => {
    selectPackage(pkg);
    goToStep(4);
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden p-8 bg-[#f8f9fa]"
    >
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center gap-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-[#884A00] text-5xl font-bold tracking-tight">
            Pilih Jenis Strip Foto Kamu
          </h1>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-4 gap-6 w-full">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(pkg)}
              className="relative flex flex-col rounded-[32px] overflow-hidden bg-white"
              style={{
                border: pkg.popular ? `2px solid ${pkg.color}` : '1px solid rgba(136,74,0,0.15)',
                boxShadow: pkg.popular ? `0 20px 40px -15px ${pkg.color}66` : '0 10px 30px -15px rgba(136,74,0,0.15)',
                cursor: 'pointer',
              }}
            >
              {pkg.popular && (
                <div
                  className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full z-20"
                  style={{ background: pkg.color, fontSize: '0.7rem', fontWeight: 700, color: 'white', letterSpacing: '0.08em' }}
                >
                  <Star size={12} fill="white" stroke="none" />
                  POPULER
                </div>
              )}

              {/* Aspect ratio visual */}
              <div className="flex justify-center items-end px-6 pt-10 pb-6 bg-[#fafafa]" style={{ height: 180 }}>
                <div
                  className="relative overflow-hidden rounded-xl shadow-sm"
                  style={{
                    width: Math.round(110 * (pkg.aspectW / Math.max(pkg.aspectW, pkg.aspectH))),
                    height: Math.round(110 * (pkg.aspectH / Math.max(pkg.aspectW, pkg.aspectH))),
                    maxWidth: 110,
                    maxHeight: 130,
                    background: `white`,
                    border: `1px solid rgba(136,74,0,0.2)`,
                  }}
                >
                  <div className="grid grid-cols-2 gap-1 p-2 w-full h-full">
                    {[0, 1, 2, 3].map(j => (
                      <div key={j} className="rounded-sm bg-gray-200" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 flex flex-col gap-4 flex-1">
                <div>
                  <h3 className="text-gray-900 text-xl font-bold">{pkg.name}</h3>
                  <p className="text-[#884A00] text-sm font-semibold mt-1">{pkg.subtitle}</p>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed">
                  {pkg.description}
                </p>

                {/* Price & time block */}
                <div className="mt-auto">
                  <div className="text-[#884A00] text-3xl font-extrabold mb-3">
                    {formatIDR(pkg.price)}
                  </div>
                  
                  {/* Feature Badge */}
                  <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-orange-50 border border-[#884A00]/20 w-fit mb-4">
                    <Clock size={14} className="text-[#884A00]" />
                    <span className="text-[#884A00] text-xs font-bold">
                      Durasi Sesi: {pkg.allocatedTime} Menit
                    </span>
                  </div>
                </div>

                {/* Select CTA */}
                <div
                  className="w-full py-3.5 rounded-xl text-center shadow-md transition-colors"
                  style={{ background: pkg.popular ? pkg.color : 'white', color: pkg.popular ? 'white' : pkg.color, border: pkg.popular ? 'none' : `1px solid ${pkg.color}`, fontSize: '0.95rem', fontWeight: 700 }}
                >
                  {pkg.popular ? 'Pilih Paket Ini' : 'Pilih Paket'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
