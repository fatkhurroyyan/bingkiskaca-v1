import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { useKiosk } from '../kiosk/KioskContext';

export function PaymentScreen() {
  const { state, goToStep } = useKiosk();
  const [voucher, setVoucher] = useState('');
  const [paid, setPaid] = useState(false);

  const simulatePayment = () => {
    setPaid(true);
    setTimeout(() => {
      goToStep(5);
    }, 1500);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (!paid) simulatePayment();
    }, 6000); // auto proceed after 6s for demo
    return () => clearTimeout(t);
  }, [paid]);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden p-8 bg-[#f8f9fa]"
    >
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-[#884A00] opacity-5 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-2 gap-12 items-stretch">
        {/* Left Column: QRIS */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center p-12 rounded-[32px] bg-white text-center"
          style={{
            border: '2px solid #884A00',
            boxShadow: '0 25px 50px -12px rgba(136,74,0,0.15)',
          }}
        >
          <h2 className="text-[#884A00] text-3xl font-bold mb-8">Pembayaran Instan via QRIS</h2>
          
          <div className="relative w-72 h-72 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-8 overflow-hidden">
            <AnimatePaid paid={paid} />
            <QrCode size={180} className="text-gray-300" strokeWidth={1} />
            
            {/* Animated scanning line */}
            {!paid && (
              <motion.div
                className="absolute left-0 right-0 h-1 bg-[#884A00]"
                style={{ boxShadow: '0 0 15px #884A00' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
          
          <p className="text-gray-600 text-lg">
            Total Tagihan: <span className="font-bold text-gray-900">Rp {(state.selectedPackage?.price || 0).toLocaleString('id-ID')}</span>
          </p>
        </motion.div>

        {/* Right Column: Voucher */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center p-12 rounded-[32px] bg-white text-left"
          style={{
            border: '1px solid rgba(136,74,0,0.1)',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
          }}
        >
          <h2 className="text-gray-900 text-3xl font-bold mb-4">Punya Kode Voucher?</h2>
          <p className="text-gray-500 text-lg mb-8">
            Masukkan kode voucher dari booth admin untuk menukarkan sesi fotomu secara gratis.
          </p>

          <div className="flex gap-4">
            <input
              type="text"
              value={voucher}
              onChange={e => setVoucher(e.target.value)}
              placeholder="Masukkan kode voucher..."
              className="flex-1 px-6 py-5 rounded-xl bg-gray-50 border border-gray-200 text-lg focus:outline-none focus:border-[#884A00] focus:ring-2 focus:ring-[#884A00]/20 transition-all uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal"
            />
            <button
              onClick={simulatePayment}
              className="px-8 py-5 rounded-xl bg-[#884A00] text-white text-lg font-bold shadow-lg hover:bg-[#723e00] transition-colors"
            >
              Verifikasi
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AnimatePaid({ paid }: { paid: boolean }) {
  if (!paid) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <CheckCircle2 size={80} className="text-green-500 mb-4" />
      </motion.div>
      <p className="text-gray-900 font-bold text-2xl">Lunas!</p>
    </motion.div>
  );
}
