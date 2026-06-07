import { motion } from 'motion/react';
import { QrCode, Camera, Download } from 'lucide-react';
import { useKiosk } from '../kiosk/KioskContext';

const steps = [
  {
    Icon: QrCode,
    num: '01',
    title: '1. Pilih Paket & Bayar',
    sub: 'via QRIS/Voucher',
    desc: 'Pilih paket foto favoritmu dan selesaikan pembayaran dengan mudah menggunakan QRIS atau kode voucher dari booth admin.',
  },
  {
    Icon: Camera,
    num: '02',
    title: '2. Bergaya 4x Berurutan',
    sub: 'depan Kamera',
    desc: 'Bersiaplah untuk tampil keren! Kamu akan difoto 4 kali berturut-turut. Tunjukkan ekspresi terbaikmu di setiap jepretannya!',
  },
  {
    Icon: Download,
    num: '03',
    title: '3. Ambil Hasil Cetak',
    sub: '& Scan Softfile!',
    desc: 'Selesai foto? Ambil hasil cetakmu dan scan QR code di layar untuk langsung mengunduh softfile berkualitas tinggi!',
  },
];

export function InstructionScreen() {
  const { goToStep } = useKiosk();

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden p-8 bg-white"
    >
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[1000px] h-[1000px] bg-[#884A00] opacity-5 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-[#884A00] text-5xl md:text-6xl font-bold tracking-tight">
            Cara Seru Berfoto di Bingkis Kaca
          </h1>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-8 w-full">
          {steps.map(({ Icon, num, title, sub, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center p-10 rounded-[32px] bg-white"
              style={{
                border: '1px solid rgba(136,74,0,0.15)',
                boxShadow: '0 20px 40px -15px rgba(136,74,0,0.1)',
              }}
            >
              {/* Step badge */}
              <div
                className="absolute -top-4 left-8 px-5 py-1.5 rounded-full bg-[#884A00] text-white text-sm font-bold tracking-widest shadow-md"
              >
                LANGKAH {num}
              </div>

              {/* Icon */}
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 mt-4 bg-orange-50 border border-[#884A00]/20 text-[#884A00]"
              >
                <Icon size={44} strokeWidth={1.5} />
              </div>

              <h3 className="text-gray-900 text-2xl font-bold mb-2">{title}</h3>
              <p className="text-[#884A00] text-lg font-semibold mb-6">{sub}</p>
              <p className="text-gray-600 text-base leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          whileHover={{ scale: 1.02, boxShadow: '0 15px 30px -10px rgba(136,74,0,0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => goToStep(3)}
          className="w-full max-w-2xl py-6 rounded-2xl bg-[#884A00] text-white text-2xl font-bold tracking-wide shadow-lg border-none cursor-pointer mt-4"
        >
          Saya Siap, Lanjutkan!
        </motion.button>
      </div>
    </div>
  );
}
