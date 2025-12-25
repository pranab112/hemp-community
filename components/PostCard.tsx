import React, { useState, useEffect } from 'react';
import { Post, PostCategory } from '../types';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';

interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
  onClick?: () => void;
  onAuthorClick?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, onAuthorClick }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user && post.liked_by) {
      setIsLiked(post.liked_by.includes(user.id));
    }
  }, [user, post.liked_by]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return; // Parent usually handles login prompt

    const previousLikes = likes;
    const previousIsLiked = isLiked;
    
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    try {
      await db.toggleLike(post.id, user.id);
    } catch (error) {
      setLikes(previousLikes);
      setIsLiked(previousIsLiked);
    }
  };

  const isAnimalWelfare = post.category === PostCategory.ANIMAL_WELFARE;

  return (
    <div 
      className={`bg-white rounded-xl border ${isAnimalWelfare ? 'border-orange-200' : 'border-gray-200'} shadow-sm mb-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img 
              src={post.author.avatar} 
              alt={post.author.username} 
              className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity" 
              onClick={(e) => { e.stopPropagation(); if (onAuthorClick) onAuthorClick(post.user_id); }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 
                  className="font-semibold text-gray-900 text-sm hover:underline"
                  onClick={(e) => { e.stopPropagation(); if (onAuthorClick) onAuthorClick(post.user_id); }}
                >
                  {post.author.username}
                </h3>
                {post.author.role === 'moderator' && (
                  <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">Mod</span>
                )}
                <span className="text-gray-500 text-xs">• {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                 <span className={`text-xs px-2 py-0.5 rounded-full ${isAnimalWelfare ? 'bg-orange-100 text-orange-700' : 'bg-hemp-100 text-hemp-800'}`}>
                  {post.category}
                </span>
                {post.is_sponsored && (
                   <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold border border-gray-200 px-1 rounded">Sponsored</span>
                )}
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{post.content}</p>

        {/* Image */}
        {post.image_url && (
          <div className="mb-4 rounded-lg overflow-hidden relative group">
             <img src={post.image_url} alt={post.title} className="w-full h-auto object-cover max-h-96" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex space-x-1">
             <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${isLiked ? 'text-hemp-600 bg-hemp-50' : 'text-gray-500 hover:bg-gray-50'} ${isAnimating ? 'scale-110' : ''}`}
            >
              <ThumbsUp size={18} className={isLiked ? 'fill-current' : ''} />
              <span className="text-sm font-medium">{likes}</span>
            </button>
             <button className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
              <MessageSquare size={18} />
              <span className="text-sm font-medium">{post.comment_count}</span>
            </button>
             <button className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
              <Share2 size={18} />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
          
          {post.category === PostCategory.ANIMAL_WELFARE ? (
             <div className="flex items-center space-x-1 text-orange-600">
                <Leaf size={16} />
                <span className="text-xs font-bold">+20 pts</span>
             </div>
          ) : (
            <div className="flex items-center space-x-1 text-hemp-600">
               <Leaf size={16} />
               <span className="text-xs font-bold">+10 pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
