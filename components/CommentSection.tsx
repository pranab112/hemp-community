import React, { useState } from 'react';
import { Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, ThumbsUp, CornerDownRight } from 'lucide-react';
import { db } from '../services/db';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  onRefresh: () => void;
}

const CommentItem: React.FC<{ comment: Comment; depth?: number; onReply: (id: string, name: string) => void }> = ({ comment, depth = 0, onReply }) => {
  const isNested = depth > 0;
  
  return (
    <div className={`mb-3 ${isNested ? 'ml-8 relative' : ''}`}>
      {isNested && <div className="absolute -left-6 top-4 w-4 h-4 border-l border-b border-gray-300 rounded-bl-lg" />}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-1">
          <img src={comment.author.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
          <span className="font-bold text-xs text-gray-800">{comment.author.username}</span>
          <span className="text-xs text-gray-400">• {new Date(comment.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-hemp-600">
            <ThumbsUp size={12} />
            <span>{comment.likes || 0}</span>
          </button>
          {depth < 2 && (
             <button 
               onClick={() => onReply(comment.id, comment.author.username)}
               className="flex items-center space-x-1 text-xs text-gray-500 hover:text-hemp-600 font-medium"
             >
               Reply
             </button>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 border-l-2 border-gray-100 pl-0">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId, onRefresh }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await db.addComment({
        post_id: postId,
        user_id: user.id,
        content: newComment,
        parent_id: replyTo?.id
      });
      setNewComment('');
      setReplyTo(null);
      onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
        <MessageSquare size={18} className="mr-2" />
        Comments ({comments.length})
      </h3>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        {replyTo && (
           <div className="flex items-center justify-between bg-blue-50 text-blue-800 px-3 py-1.5 rounded-t-lg text-xs">
              <span>Replying to <b>{replyTo.name}</b></span>
              <button type="button" onClick={() => setReplyTo(null)} className="hover:text-blue-900 font-bold">×</button>
           </div>
        )}
        <div className="flex space-x-3">
          <img src={user?.avatar || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Join the discussion..." : "Log in to comment"}
              className={`w-full border p-2 text-sm focus:ring-1 focus:ring-hemp-500 outline-none resize-none ${replyTo ? 'rounded-b-lg border-t-0' : 'rounded-lg border-gray-300'}`}
              rows={2}
              disabled={!user}
            />
            {user && (
              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-hemp-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-hemp-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onReply={(id, name) => setReplyTo({ id, name })} 
          />
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
};
