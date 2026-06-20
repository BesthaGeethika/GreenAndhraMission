import { useEffect } from 'react';
import { Sprout, X } from 'lucide-react';
import { Button } from './ui';

export function WelcomePopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    localStorage.setItem('gam_welcomed', '1');
  }, []);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative animate-[fadeIn_0.3s_ease]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4">
            <Sprout className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Green Andhra Mission</h2>
        </div>

        <div className="space-y-5">
          <div className="bg-primary-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-primary-700 mb-1.5">ENGLISH</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Welcome to Green Andhra Mission. This initiative aims to restore environmental balance, increase groundwater levels,
              improve rainfall patterns, and create a greener Andhra Pradesh. Every citizen can contribute by planting and protecting trees.
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-amber-700 mb-1.5">తెలుగు</div>
            <p className="text-sm text-gray-700 leading-relaxed font-telugu">
              గ్రీన్ ఆంధ్ర మిషన్‌కు స్వాగతం. ఈ కార్యక్రమం పర్యావరణ సమతుల్యతను పునరుద్ధరించడం, భూగర్భ జలాలను పెంచడం, వర్షపాతం పరిస్థితులను మెరుగుపరచడం మరియు ఆంధ్రప్రదేశ్‌ను మరింత హరిత రాష్ట్రంగా మార్చడం లక్ష్యంగా కలిగి ఉంది. ప్రతి పౌరుడు చెట్లు నాటి వాటిని సంరక్షించడం ద్వారా ఈ కార్యక్రమంలో భాగస్వామి కావచ్చు.
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full mt-6 py-3">Continue to Mission</Button>
      </div>
    </div>
  );
}
