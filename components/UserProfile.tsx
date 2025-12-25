import React, { useEffect, useState } from 'react';
import { User, UserStats, Post } from '../types';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, Award, Edit, ShieldCheck } from 'lucide-react';
import { PostCard } from './PostCard';

interface UserProfileProps {
  userId: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const u = await db.getUserById(userId);
      setProfileUser(u);
      if (u) {
        const s = await db.getUserStats(userId);
        setStats(s);
        const allPosts = await db.getPosts();
        setPosts(allPosts.filter(p => p.user_id === userId));
        
        if (currentUser) {
          setIsFollowing(await db.isFollowing(currentUser.id, userId));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !profileUser) return;
    if (isFollowing) {
      await db.unfollowUser(currentUser.id, profileUser.id);
      setIsFollowing(false);
      setStats(prev => prev ? ({...prev, followersCount: prev.followersCount - 1}) : null);
    } else {
      await db.followUser(currentUser.id, profileUser.id);
      setIsFollowing(true);
      setStats(prev => prev ? ({...prev, followersCount: prev.followersCount + 1}) : null);
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;
  if (!profileUser) return <div className="text-center py-10">User not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className={`h-32 ${profileUser.is_premium ? 'bg-gradient-to-r from-indigo-900 to-indigo-600' : 'bg-hemp-600'}`}></div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-end -mt-12 mb-4">
             <div className="relative">
                <img 
                  src={profileUser.avatar} 
                  alt={profileUser.username} 
                  className={`w-24 h-24 rounded-full border-4 ${profileUser.is_premium ? 'border-yellow-400' : 'border-white'} bg-gray-100`}
                />
                {profileUser.is_premium && (
                    <div className="absolute bottom-0 right-0 bg-yellow-400 text-indigo-900 rounded-full p-1 border-2 border-white" title="Premium Member">
                        <Award size={16} />
                    </div>
                )}
             </div>
             
             {currentUser?.id !== profileUser.id && (
               <button 
                 onClick={handleFollow}
                 className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${isFollowing ? 'bg-gray-100 text-gray-800 border border-gray-300' : 'bg-hemp-600 text-white hover:bg-hemp-700'}`}
               >
                 {isFollowing ? 'Following' : 'Follow'}
               </button>
             )}
             {currentUser?.id === profileUser.id && (
               <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center">
                 <Edit size={14} className="mr-2" /> Edit Profile
               </button>
             )}
          </div>
          
          <div className="flex items-center">
             <h1 className="text-2xl font-bold text-gray-900 mr-2">{profileUser.username}</h1>
             {profileUser.is_premium && <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded border border-indigo-200">PREMIUM</span>}
          </div>
          
          <p className="text-gray-600 mb-4">{profileUser.bio || "No bio yet."}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <MapPin size={16} className="mr-1" /> {profileUser.location}
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" /> Joined {profileUser.joined_at}
            </div>
             <div className="flex items-center text-hemp-700 font-bold">
              <Award size={16} className="mr-1" /> {profileUser.hemp_points} pts
            </div>
          </div>

          <div className="flex border-t border-gray-100 pt-6 justify-around text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">{stats?.postsCount}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Posts</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats?.followersCount}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{stats?.followingCount}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
            </div>
             <div>
              <div className="text-xl font-bold text-gray-900">#{stats?.rank}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Rank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200 text-gray-500">
            No posts yet.
          </div>
        )}
      </div>
    </div>
  );
};
