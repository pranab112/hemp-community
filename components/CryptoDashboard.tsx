import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { WalletAddress } from '../types';
import { Wallet, TrendingUp, Info, Check, Copy, PieChart, FileText, ShieldCheck } from 'lucide-react';

export const CryptoDashboard: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletAddress | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'tokenomics' | 'whitepaper'>('wallet');
  
  // Calculator State
  const [calcPoints, setCalcPoints] = useState(user?.hemp_points || 1000);
  const [conversionRate, setConversionRate] = useState(100); // 100 pts = 1 Token
  const [estimatedValue, setEstimatedValue] = useState(0);

  useEffect(() => {
    if (user) {
      db.getWalletAddress(user.id).then(setWallet);
      setCalcPoints(user.hemp_points);
    }
  }, [user]);

  useEffect(() => {
      setEstimatedValue(Math.floor(calcPoints / conversionRate));
  }, [calcPoints, conversionRate]);

  const handleSaveWallet = async () => {
    if (!user || !addressInput) return;
    setLoading(true);
    await db.saveWalletAddress(user.id, addressInput, 'Polygon');
    const updated = await db.getWalletAddress(user.id);
    setWallet(updated);
    setLoading(false);
  };
  
  const handleSaveEstimate = async () => {
      if (!user) return;
      await db.saveTokenConversion({
          user_id: user.id,
          hemp_points: calcPoints,
          estimated_tokens: estimatedValue,
          conversion_rate: conversionRate
      });
      alert('Estimation saved for future reference!');
  };

  const handleDownloadWhitepaper = () => {
      alert("Downloading Nepal Hemp Community Whitepaper v1.0 (PDF)...");
  };

  if (!user) return <div className="text-center p-10">Please login to view your crypto assets.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2 flex items-center">
           <Wallet className="mr-3" /> Hemp Token (HEMP)
        </h2>
        <p className="text-green-200 mb-6">Future Governance Token of Nepal Hemp Community</p>
        
        <div className="flex gap-4">
             <button onClick={() => setActiveTab('wallet')} className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'wallet' ? 'bg-white text-green-900' : 'bg-green-800 text-green-100 hover:bg-green-700'}`}>Wallet & Assets</button>
             <button onClick={() => setActiveTab('tokenomics')} className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'tokenomics' ? 'bg-white text-green-900' : 'bg-green-800 text-green-100 hover:bg-green-700'}`}>Tokenomics</button>
             <button onClick={() => setActiveTab('whitepaper')} className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'whitepaper' ? 'bg-white text-green-900' : 'bg-green-800 text-green-100 hover:bg-green-700'}`}>Whitepaper</button>
        </div>
      </div>

      {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">Your Points Balance</p>
                    <p className="text-4xl font-bold text-green-600">{user.hemp_points.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">Earn more by engaging!</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">Estimated Airdrop</p>
                        <p className="text-4xl font-bold text-indigo-600">{(Math.floor(user.hemp_points / 100)).toLocaleString()} HEMP</p>
                        <p className="text-xs text-gray-400 mt-2">Based on current ratio (100:1)</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-xl font-bold text-gray-900">Connect Wallet</h3>
                        <p className="text-gray-600 text-sm">Polygon (MATIC) Address</p>
                     </div>
                     {wallet && (
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                             <ShieldCheck size={14} className="mr-1"/> Verified
                         </span>
                     )}
                </div>

                {wallet ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-gray-800 font-mono text-sm break-all">{wallet.address}</p>
                        <button onClick={() => setWallet(null)} className="text-xs text-red-500 hover:underline">Disconnect</button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="0x..." 
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-500 outline-none font-mono text-sm"
                        />
                        <button 
                            onClick={handleSaveWallet}
                            disabled={loading || !addressInput}
                            className="bg-hemp-600 hover:bg-hemp-700 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Connect'}
                        </button>
                    </div>
                )}
            </div>
          </div>
      )}

      {activeTab === 'tokenomics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                   <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                       <TrendingUp className="mr-2 text-indigo-500" /> Economics Calculator
                   </h3>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Hemp Points</label>
                           <input 
                              type="number" 
                              value={calcPoints}
                              onChange={e => setCalcPoints(Number(e.target.value))}
                              className="w-full border p-2 rounded-lg"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Rate (Points per Token)</label>
                           <input 
                              type="range" 
                              min="50" 
                              max="500" 
                              step="10"
                              value={conversionRate}
                              onChange={e => setConversionRate(Number(e.target.value))}
                              className="w-full accent-green-600"
                           />
                           <div className="text-right text-xs text-gray-500">{conversionRate} Points = 1 HEMP</div>
                       </div>
                       <div className="bg-indigo-50 p-4 rounded-lg text-center border border-indigo-100">
                           <p className="text-sm text-indigo-600 font-bold uppercase">Estimated Yield</p>
                           <p className="text-3xl font-bold text-indigo-900">{estimatedValue.toLocaleString()} HEMP</p>
                       </div>
                       <button onClick={handleSaveEstimate} className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-black">Save Estimate</button>
                   </div>
               </div>

               <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                   <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                       <PieChart className="mr-2 text-orange-500" /> Token Distribution
                   </h3>
                   <div className="space-y-4">
                       <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Community Airdrop</div>
                           <span className="font-bold">40%</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Ecosystem Fund</div>
                           <span className="font-bold">30%</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span> Team & Founders</div>
                           <span className="font-bold">15%</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span> Investors</div>
                           <span className="font-bold">15%</span>
                       </div>
                       
                       <div className="h-4 w-full bg-gray-100 rounded-full flex overflow-hidden mt-4">
                           <div className="bg-green-500 h-full w-[40%]" />
                           <div className="bg-blue-500 h-full w-[30%]" />
                           <div className="bg-purple-500 h-full w-[15%]" />
                           <div className="bg-yellow-500 h-full w-[15%]" />
                       </div>
                   </div>
               </div>
          </div>
      )}

      {activeTab === 'whitepaper' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <FileText size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Technical Whitepaper</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">Detailed documentation on the Nepal Hemp Community tokenomics, governance structure, and roadmap for 2025.</p>
              
              <button 
                onClick={handleDownloadWhitepaper}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center mx-auto transition-colors"
              >
                  Download PDF (v1.0)
              </button>
              
              <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div>
                      <p className="text-xs text-gray-400 uppercase">Version</p>
                      <p className="font-bold">1.0.2 Draft</p>
                  </div>
                  <div>
                      <p className="text-xs text-gray-400 uppercase">Release Date</p>
                      <p className="font-bold">Oct 2024</p>
                  </div>
                  <div>
                      <p className="text-xs text-gray-400 uppercase">Blockchain</p>
                      <p className="font-bold">Polygon</p>
                  </div>
                  <div>
                      <p className="text-xs text-gray-400 uppercase">Standard</p>
                      <p className="font-bold">ERC-20</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
