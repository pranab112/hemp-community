import React, { useState } from 'react';
import { X, Check, Award, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await db.upgradeToPremium(user.id, plan);
      window.location.reload(); // Simple reload to refresh user state
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
            <X size={24} />
        </button>

        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 text-center text-white">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-indigo-900">
                <Award size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
            <p className="text-indigo-200">Support the community and unlock exclusive features.</p>
        </div>

        <div className="p-8">
            <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full text-green-600 mr-3"><Check size={14} /></div>
                    <span>Ad-free browsing experience</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full text-green-600 mr-3"><Check size={14} /></div>
                    <span>Exclusive Premium Badge</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full text-green-600 mr-3"><Check size={14} /></div>
                    <span><b>+100 Bonus</b> Hemp Points instantly</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full text-green-600 mr-3"><Check size={14} /></div>
                    <span>Priority Support & Verified Status</span>
                </div>
            </div>

            <div className="flex space-x-4 mb-8">
                <div 
                    onClick={() => setPlan('monthly')}
                    className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${plan === 'monthly' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                >
                    <div className="font-bold text-gray-900">Monthly</div>
                    <div className="text-sm text-gray-500">NPR 500</div>
                </div>
                <div 
                    onClick={() => setPlan('yearly')}
                    className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${plan === 'yearly' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                >
                    <div className="font-bold text-gray-900">Yearly</div>
                    <div className="text-sm text-gray-500">NPR 5,000</div>
                    <div className="text-xs text-green-600 font-bold mt-1">Save 17%</div>
                </div>
            </div>

            <button 
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center"
            >
                {loading ? <Loader className="animate-spin" /> : `Pay with eSewa (NPR ${plan === 'monthly' ? '500' : '5,000'})`}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">Secure payment processing via eSewa</p>
        </div>
      </div>
    </div>
  );
};
