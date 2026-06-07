import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKiosk } from '../kiosk/KioskContext';
import { Check } from 'lucide-react';
import { FRAME_OPTIONS } from '../kiosk/frameData';
import { PhotoStripPreview } from '../kiosk/PhotoStripPreview';

export function FrameSelectorScreen() {
  const { selectFrame, goToStep, state } = useKiosk();
  const [selected, setSelected] = useState(FRAME_OPTIONS[0].id);

  const activeFrame = FRAME_OPTIONS.find(f => f.id === selected) || FRAME_OPTIONS[0];

  const handleNext = () => {
    selectFrame(activeFrame);
    goToStep(7);
  };

  return (
    <div className="w-full h-full flex overflow-hidden bg-[#f8f9fa]">
      {/* Left Panel: Preview (60%) */}
      <div className="w-[60%] h-full flex flex-col items-center justify-center relative bg-gray-100/50 p-12">
        <h2 className="absolute top-16 left-16 text-3xl font-bold text-gray-800">Preview Frame</h2>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <PhotoStripPreview frame={activeFrame} className="w-[400px] h-[600px]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Panel: Selection (40%) */}
      <div className="w-[40%] h-full bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.03)] z-10 flex flex-col">
        <div className="p-10 border-b border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pilih Frame</h1>
          <p className="text-gray-500 text-lg">Pilih desain frame yang sesuai dengan gayamu.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-2 gap-6 content-start">
          {FRAME_OPTIONS.map((f) => {
            const isActive = selected === f.id;
            return (
              <motion.div
                key={f.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(f.id)}
                className="relative aspect-[3/4] rounded-2xl cursor-pointer bg-white overflow-hidden flex flex-col items-center justify-center p-4 transition-all"
                style={{
                  border: isActive ? '4px solid #884A00' : '2px solid transparent',
                  boxShadow: isActive ? '0 10px 25px -5px rgba(136,74,0,0.3)' : '0 4px 15px rgba(0,0,0,0.06)',
                }}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#884A00] flex items-center justify-center text-white z-10">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
                
                <div 
                  className="w-full h-full rounded-md border border-gray-200 shadow-sm"
                  style={{ backgroundColor: f.primaryColor }}
                />
                
                <p className="mt-4 font-bold text-gray-700 text-center text-sm">{f.name}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="p-10 border-t border-gray-100 bg-white">
          <button
            onClick={handleNext}
            className="w-full py-5 rounded-2xl bg-[#884A00] text-white text-xl font-bold shadow-lg hover:bg-[#723e00] transition-colors"
          >
            Gunakan Frame Ini
          </button>
        </div>
      </div>
    </div>
  );
}
