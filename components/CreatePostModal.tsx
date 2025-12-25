import React, { useState } from 'react';
import { X, Image as ImageIcon, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { PostCategory } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>(PostCategory.GENERAL);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await db.createPost({
        user_id: user.id,
        author: user,
        title,
        content,
        category,
        image_url: 'https://picsum.photos/seed/' + Math.random() + '/800/400' // Random image for demo
      });
      setTitle('');
      setContent('');
      onPostCreated();
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
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Create Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-hemp-500 outline-none"
            >
              {Object.values(PostCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold placeholder-gray-400 border-none outline-none focus:ring-0 p-0"
              required
            />
          </div>

          <div className="mb-4">
            <textarea 
              placeholder="What's on your mind?" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 resize-none placeholder-gray-400 border-none outline-none focus:ring-0 p-0"
              required
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <button type="button" className="text-gray-500 hover:text-hemp-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
              <ImageIcon size={20} />
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !title.trim() || !content.trim()}
              className="bg-hemp-600 hover:bg-hemp-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader className="animate-spin mr-2" size={16} /> : null}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
