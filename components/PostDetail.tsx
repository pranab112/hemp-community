import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Post, Comment } from '../types';
import { PostCard } from './PostCard';
import { CommentSection } from './CommentSection';
import { db } from '../services/db';

interface PostDetailProps {
  postId: string;
  onBack: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ postId, onBack }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const p = await db.getPostById(postId);
      setPost(p);
      if (p) {
        const c = await db.getComments(postId);
        setComments(c);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [postId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading discussion...</div>;
  if (!post) return <div className="p-8 text-center text-red-500">Post not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-hemp-600 mb-4 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Feed
      </button>

      <PostCard post={post} />
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-10">
        <CommentSection 
          comments={comments} 
          postId={post.id} 
          onRefresh={fetchDetails} 
        />
      </div>
    </div>
  );
};
