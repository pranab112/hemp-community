import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, User as UserIcon, LogIn, 
  Home, ShoppingBag, Heart, Info, Award, Leaf, 
  Plus, TrendingUp, DollarSign, BookOpen, Vote, Wallet
} from 'lucide-react';
import { MOCK_PRODUCTS } from './constants';
import { Post, ViewState, PostCategory, User } from './types';
import { PostCard } from './components/PostCard';
import { Marketplace } from './components/Marketplace';
import { AuthModal } from './components/AuthModal';
import { CreatePostModal } from './components/CreatePostModal';
import { SponsoredPostModal } from './components/SponsoredPostModal';
import { PremiumModal } from './components/PremiumModal';
import { BusinessDashboard } from './components/BusinessDashboard';
import { PostDetail } from './components/PostDetail';
import { UserProfile } from './components/UserProfile';
import { NotificationDropdown } from './components/NotificationDropdown';
import { CryptoDashboard } from './components/CryptoDashboard';
import { Governance } from './components/Governance';
import { Education } from './components/Education';
import { AnimalWelfareDashboard } from './components/AnimalWelfareDashboard';
import { useAuth } from './contexts/AuthContext';
import { db } from './services/db';

const App: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.FEED);
  const [viewPostId, setViewPostId] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isSponsoredModalOpen, setIsSponsoredModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Fetch posts and leaderboard
  const fetchData = async () => {
    setIsLoadingPosts(true);
    try {
      const fetchedPosts = await db.getPosts(activeCategory);
      setPosts(fetchedPosts);
      const fetchedLeaderboard = await db.getLeaderboard();
      setLeaderboard(fetchedLeaderboard);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (currentView === ViewState.FEED || currentView === ViewState.ANIMAL_WELFARE) {
        fetchData();
    }
  }, [activeCategory, user, currentView]);

  const handleCreatePostClick = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
    } else {
      setIsCreatePostOpen(true);
    }
  };

  const navigateToPost = (postId: string) => {
    setViewPostId(postId);
    setCurrentView(ViewState.POST_DETAIL);
  };

  const navigateToProfile = (userId: string) => {
    setViewUserId(userId);
    setCurrentView(ViewState.PROFILE);
  };

  const handleCreatePostSuccess = () => {
      fetchData();
      setCurrentView(ViewState.FEED);
  };

  return (
    <div className="min-h-screen bg-soil-100 font-sans text-soil-900">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CreatePostModal 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
        onPostCreated={handleCreatePostSuccess}
      />
      <SponsoredPostModal
        isOpen={isSponsoredModalOpen}
        onClose={() => setIsSponsoredModalOpen(false)}
        onSuccess={handleCreatePostSuccess}
      />
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-500 md:hidden hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
              <div 
                className="flex-shrink-0 flex items-center space-x-2 cursor-pointer ml-2 md:ml-0"
                onClick={() => setCurrentView(ViewState.FEED)}
              >
                <Leaf className="text-hemp-600 h-8 w-8" />
                <span className="font-bold text-xl tracking-tight hidden sm:block text-hemp-900">NepalHemp</span>
              </div>
              
              {/* Desktop Search */}
              <div className="hidden md:ml-6 md:flex items-center">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-64 pl-10 pr-3 py-1.5 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hemp-500 focus:bg-white sm:text-sm transition-all"
                    placeholder="Search posts, users..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <div className="hidden sm:flex flex-col items-end mr-2">
                     <span className="text-xs text-gray-500">Hemp Points</span>
                     <span className="text-sm font-bold text-hemp-600 flex items-center">
                       {user.hemp_points.toLocaleString()} <Award size={14} className="ml-1" />
                     </span>
                  </div>
                  
                  <NotificationDropdown />
                  
                  <div className="relative group">
                    <button className="flex items-center space-x-2 focus:outline-none">
                       <img src={user.avatar} alt="User" className={`h-8 w-8 rounded-full border ${user.is_premium ? 'border-yellow-400' : 'border-gray-200'}`} />
                    </button>
                    {/* Simple Dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100 z-50">
                       <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center">
                             <p className="text-sm font-bold text-gray-900 mr-2">{user.username}</p>
                             {user.is_premium && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1 rounded font-bold">PRO</span>}
                          </div>
                          <p className="text-xs text-gray-500">{user.location}</p>
                       </div>
                       
                       <button onClick={() => navigateToProfile(user.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</button>
                       <button onClick={() => setCurrentView(ViewState.CRYPTO)} className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center"><Wallet size={14} className="mr-2"/> Crypto Wallet</button>
                       
                       {!user.is_premium && (
                          <button onClick={() => setIsPremiumModalOpen(true)} className="block w-full text-left px-4 py-2 text-sm text-indigo-600 font-bold hover:bg-gray-100 flex items-center">
                             <Award size={14} className="mr-2" /> Upgrade to Premium
                          </button>
                       )}

                       {user.role === 'admin' && (
                         <button onClick={() => setCurrentView(ViewState.BUSINESS_DASHBOARD)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                           <TrendingUp size={14} className="mr-2" /> Business Dashboard
                         </button>
                       )}
                       
                       <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                    </div>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-hemp-600 hover:bg-hemp-700 shadow-sm"
                >
                  <LogIn size={16} className="mr-2" />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Sidebar (Desktop) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <button 
                onClick={() => setCurrentView(ViewState.FEED)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === ViewState.FEED ? 'bg-hemp-50 text-hemp-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Home size={18} className="mr-3" />
                Community
              </button>
              <button 
                onClick={() => setCurrentView(ViewState.MARKETPLACE)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === ViewState.MARKETPLACE ? 'bg-hemp-50 text-hemp-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ShoppingBag size={18} className="mr-3" />
                Marketplace
              </button>
              <button 
                onClick={() => setCurrentView(ViewState.ANIMAL_WELFARE)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === ViewState.ANIMAL_WELFARE ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Heart size={18} className="mr-3" />
                Animal Welfare
              </button>
              <button 
                onClick={() => setCurrentView(ViewState.EDUCATION)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === ViewState.EDUCATION ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <BookOpen size={18} className="mr-3" />
                Hemp Academy
              </button>
              <button 
                onClick={() => setCurrentView(ViewState.GOVERNANCE)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === ViewState.GOVERNANCE ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Vote size={18} className="mr-3" />
                Governance
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
                <Info size={18} className="mr-3" />
                About & Safety
              </button>
            </div>

            {currentView === ViewState.FEED && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Topics
                </h3>
                <div className="space-y-1">
                  {Object.values(PostCategory).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(activeCategory === cat ? 'All' : cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md ${activeCategory === cat ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat}
                      {activeCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-hemp-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <main className="md:col-span-9 lg:col-span-7">
            
            {/* Main Content Router */}
            {currentView === ViewState.BUSINESS_DASHBOARD ? (
              <BusinessDashboard />
            ) : currentView === ViewState.CRYPTO ? (
              <CryptoDashboard />
            ) : currentView === ViewState.GOVERNANCE ? (
              <Governance />
            ) : currentView === ViewState.EDUCATION ? (
              <Education />
            ) : currentView === ViewState.ANIMAL_WELFARE ? (
              <AnimalWelfareDashboard />
            ) : currentView === ViewState.POST_DETAIL && viewPostId ? (
              <PostDetail postId={viewPostId} onBack={() => setCurrentView(ViewState.FEED)} />
            ) : currentView === ViewState.PROFILE && viewUserId ? (
              <UserProfile userId={viewUserId} />
            ) : currentView === ViewState.MARKETPLACE ? (
              <Marketplace products={MOCK_PRODUCTS} />
            ) : (
              <div className="space-y-4">
                {/* Mobile Filter Tabs (Visible only on mobile) */}
                <div className="md:hidden flex overflow-x-auto pb-4 space-x-2 mb-4 scrollbar-hide">
                   {/* Simplify mobile tabs for brevity, logic remains similar */}
                </div>

                {/* Create Post Input Trigger */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div 
                    className="flex space-x-3 items-center cursor-pointer hover:bg-gray-50 transition-colors p-2 rounded-lg" 
                    onClick={handleCreatePostClick}
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {user ? <img src={user.avatar} className="h-full w-full object-cover" /> : <UserIcon className="text-gray-400" />}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm text-gray-500 flex justify-between items-center">
                      <span>{user ? "Share your hemp journey..." : "Log in to share your story..."}</span>
                      <Plus size={18} className="text-gray-400" />
                    </div>
                  </div>
                  {/* Quick Action for Sponsored Post (Visible to everyone for demo, real app restricts) */}
                  {user && (
                    <div className="flex justify-end mt-2 px-2">
                       <button onClick={() => setIsSponsoredModalOpen(true)} className="text-xs font-bold text-gray-500 hover:text-hemp-700 flex items-center">
                          <DollarSign size={12} className="mr-1" /> Create Sponsored Ad
                       </button>
                    </div>
                  )}
                </div>

                {/* Feed */}
                {isLoadingPosts ? (
                  <div className="text-center py-10 text-gray-400">Loading community posts...</div>
                ) : posts.length > 0 ? (
                  posts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onClick={() => navigateToPost(post.id)}
                      onAuthorClick={navigateToProfile}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No posts yet in this category.</p>
                    <button onClick={() => setActiveCategory('All')} className="text-hemp-600 text-sm font-bold mt-2 hover:underline">View All</button>
                  </div>
                )}

                {!isLoadingPosts && posts.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">You've reached the end of the list</p>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar (Desktop - Leaderboard & Ads) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Leaderboard Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <Award className="text-yellow-500 mr-2" size={20} />
                  Top Growers
                </h3>
              </div>
              <div className="space-y-4">
                {leaderboard.map((u, idx) => (
                  <div 
                    key={u.id} 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                    onClick={() => navigateToProfile(u.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-full bg-gray-100 object-cover" />
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-transparent text-transparent'}`}>
                          {idx + 1}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate w-24">{u.username}</span>
                    </div>
                    <span className="text-xs font-bold text-hemp-600 bg-hemp-50 px-2 py-1 rounded-full">{u.hemp_points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo / Ad */}
            <div className="bg-gradient-to-br from-soil-800 to-soil-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded text-white/90">PROMOTED</span>
                <h3 className="font-bold text-lg mt-2 mb-1">Himalayan Healing Balm</h3>
                <p className="text-xs text-gray-300 mb-3">Ancient recipe for modern pain relief. 100% Organic.</p>
                <button className="text-xs font-bold bg-white text-soil-900 px-3 py-1.5 rounded hover:bg-gray-100 transition">Shop Now</button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Leaf size={120} />
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 px-2">
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Animal Welfare</a>
              <a href="#" className="hover:underline">Affiliates</a>
              <span>© 2024 NepalHemp</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
