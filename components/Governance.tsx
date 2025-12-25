import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { CommunityVote } from '../types';
import { Vote, Users, Clock, CheckCircle } from 'lucide-react';

export const Governance: React.FC = () => {
  const { user } = useAuth();
  const [votes, setVotes] = useState<CommunityVote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVotes = async () => {
    const data = await db.getVotes();
    setVotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  const handleVote = async (voteId: string, optionId: string) => {
    if (!user) return;
    try {
        await db.castVote(voteId, optionId, user.id);
        fetchVotes(); // Refresh
        // Optionally trigger a toast or notification
    } catch (e) {
        console.error(e);
        alert('Voting failed or already voted.');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading proposals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-gray-900">Community Governance</h2>
            <p className="text-gray-500">Decide the future of the Nepal Hemp Community.</p>
         </div>
         <div className="bg-hemp-100 text-hemp-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center">
            <Vote className="mr-2" size={18} />
            DAO Active
         </div>
      </div>

      <div className="grid gap-6">
        {votes.map(vote => {
            const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
            const hasVoted = user ? vote.voted_users.includes(user.id) : false;
            
            return (
                <div key={vote.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block ${vote.category === 'Feature' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                {vote.category}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900">{vote.title}</h3>
                        </div>
                        {hasVoted && (
                            <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
                                <CheckCircle size={14} className="mr-1" /> Voted
                            </span>
                        )}
                    </div>
                    
                    <p className="text-gray-600 mb-6">{vote.description}</p>
                    
                    <div className="space-y-3">
                        {vote.options.map(option => {
                            const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                            return (
                                <div key={option.id} className="relative">
                                    <button 
                                        onClick={() => handleVote(vote.id, option.id)}
                                        disabled={!user || hasVoted}
                                        className={`w-full text-left p-3 rounded-lg border-2 relative z-10 transition-all flex justify-between items-center ${hasVoted ? 'border-gray-100 cursor-default' : 'border-gray-200 hover:border-hemp-500 hover:bg-gray-50'}`}
                                    >
                                        <span className="font-medium text-gray-800">{option.label}</span>
                                        <span className="text-sm font-bold text-gray-500">{percent}%</span>
                                    </button>
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gray-100 rounded-lg transition-all duration-500" 
                                        style={{ width: `${percent}%`, opacity: 0.5 }} 
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                        <span className="flex items-center"><Users size={14} className="mr-1"/> {totalVotes} votes</span>
                        <span className="flex items-center"><Clock size={14} className="mr-1"/> Ends {vote.endDate}</span>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
