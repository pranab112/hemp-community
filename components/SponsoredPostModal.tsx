import React, { useState } from 'react';
import { X, Loader, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { PostCategory } from '../types';

interface SponsoredPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SponsoredPostModal: React.FC<SponsoredPostModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>(PostCategory.PRODUCTS);
  const [budget, setBudget] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await db.createSponsoredPost({
        user_id: user.id,
        author: user,
        title,
        content,
        category,
        image_url: 'https://picsum.photos/seed/sponsor/800/400'
      }, budget);
      
      setTitle('');
      setContent('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-soil-800 to-soil-900 text-white rounded-t-xl">
          <h3 className="font-bold flex items-center"><DollarSign size={18} className="mr-2"/> Create Sponsored Campaign</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Budget (NPR)</label>
            <input 
              type="number" 
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-hemp-500 outline-none font-mono font-bold"
              min="100"
            />
            <p className="text-xs text-gray-500 mt-1">Higher budget increases visibility duration.</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              placeholder="Ad Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-hemp-500 outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea 
              placeholder="Promotional content..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-24 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-hemp-500 outline-none resize-none"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-soil-900 hover:bg-black text-white px-4 py-3 rounded-lg font-bold text-sm flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <Loader className="animate-spin mr-2" size={16} /> : null}
            Pay & Launch Campaign
          </button>
        </form>
      </div>
    </div>
  );
};
