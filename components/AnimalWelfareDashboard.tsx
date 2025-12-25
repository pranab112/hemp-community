import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { WelfareStats, WelfareActivity } from '../types';
import { Heart, Clock, Gift, Activity, Plus } from 'lucide-react';

export const AnimalWelfareDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<WelfareStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<WelfareActivity[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [donateMode, setDonateMode] = useState(false);
  
  // Form States
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(0);
  const [donationAmount, setDonationAmount] = useState(0);

  const fetchData = async () => {
    const s = await db.getWelfareStats();
    setStats(s);
    const acts = await db.getWelfareActivities();
    setRecentActivities(acts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogActivity = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      await db.logWelfareActivity({
          user_id: user.id,
          type: 'Volunteer',
          description,
          hours
      });
      setIsLogging(false);
      setDescription('');
      setHours(0);
      fetchData();
  };

  const handleDonate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      try {
          await db.donatePoints(user.id, donationAmount);
          setDonateMode(false);
          setDonationAmount(0);
          fetchData();
          alert('Thank you for your donation!');
      } catch (err: any) {
          alert(err.message);
      }
  };

  if (!stats) return <div className="p-10 text-center">Loading impact data...</div>;

  return (
    <div className="space-y-6">
      {/* Hero Impact Section */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
           <h2 className="text-3xl font-bold mb-2 flex items-center">
              <Heart className="mr-3 fill-white" /> Community Impact
           </h2>
           <p className="text-orange-100 max-w-lg mb-6">Together we are making a difference for Nepal's street animals. Every point donated and hour volunteered counts.</p>
           
           <div className="grid grid-cols-3 gap-4 text-center">
               <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                   <p className="text-3xl font-bold">{stats.total_volunteer_hours}</p>
                   <p className="text-xs uppercase font-bold text-orange-100">Volunteer Hours</p>
               </div>
               <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                   <p className="text-3xl font-bold">{stats.total_donations}</p>
                   <p className="text-xs uppercase font-bold text-orange-100">Points Donated</p>
               </div>
               <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                   <p className="text-3xl font-bold">{stats.total_activities}</p>
                   <p className="text-xs uppercase font-bold text-orange-100">Lives Impacted</p>
               </div>
           </div>
        </div>
        <Heart className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                  <Activity className="mr-2 text-orange-500" /> Get Involved
              </h3>
              
              {!user ? (
                  <p className="text-gray-500 text-sm">Please login to log activities or donate.</p>
              ) : isLogging ? (
                  <form onSubmit={handleLogActivity} className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Description of activity (e.g., Feeding stray dogs)" 
                        className="w-full border p-2 rounded"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="Hours spent" 
                        className="w-full border p-2 rounded"
                        value={hours}
                        onChange={e => setHours(Number(e.target.value))}
                        required
                        min="0.5"
                        step="0.5"
                      />
                      <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600">Submit</button>
                          <button type="button" onClick={() => setIsLogging(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                      </div>
                  </form>
              ) : donateMode ? (
                  <form onSubmit={handleDonate} className="space-y-4">
                       <p className="text-sm text-gray-600">Balance: {user.hemp_points} pts</p>
                       <input 
                        type="number" 
                        placeholder="Amount to donate" 
                        className="w-full border p-2 rounded"
                        value={donationAmount}
                        onChange={e => setDonationAmount(Number(e.target.value))}
                        required
                        min="10"
                        max={user.hemp_points}
                      />
                      <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600">Donate Points</button>
                          <button type="button" onClick={() => setDonateMode(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                      </div>
                  </form>
              ) : (
                  <div className="flex flex-col gap-3">
                      <button onClick={() => setIsLogging(true)} className="w-full bg-orange-50 text-orange-700 py-3 rounded-lg font-bold border border-orange-200 hover:bg-orange-100 flex items-center justify-center">
                          <Clock size={18} className="mr-2" /> Log Volunteer Hours
                      </button>
                      <button onClick={() => setDonateMode(true)} className="w-full bg-green-50 text-green-700 py-3 rounded-lg font-bold border border-green-200 hover:bg-green-100 flex items-center justify-center">
                          <Gift size={18} className="mr-2" /> Donate Hemp Points
                      </button>
                  </div>
              )}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 text-lg mb-4">Recent Community Actions</h3>
               <div className="space-y-4 max-h-60 overflow-y-auto">
                   {recentActivities.length === 0 ? (
                       <p className="text-gray-400 text-sm">No recent activities.</p>
                   ) : (
                       recentActivities.map(act => (
                           <div key={act.id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0">
                               <div className={`p-2 rounded-full ${act.type === 'Donation' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                   {act.type === 'Donation' ? <Gift size={14} /> : <Heart size={14} />}
                               </div>
                               <div>
                                   <p className="text-sm text-gray-800 font-medium">{act.description}</p>
                                   <p className="text-xs text-gray-400">
                                       {act.type === 'Donation' ? `${act.donation_amount} pts` : `${act.hours} hrs`} • {new Date(act.created_at).toLocaleDateString()}
                                   </p>
                               </div>
                           </div>
                       ))
                   )}
               </div>
          </div>
      </div>
    </div>
  );
};
