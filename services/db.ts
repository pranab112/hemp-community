import { User, Post, Comment, Product, PointHistory, PointReason, Notification, Follow, UserStats, AffiliateClick, RevenueRecord, BusinessMetrics, WalletAddress, CommunityVote, Course, LearningProgress, WelfareActivity, TokenConversion, WelfareStats } from '../types';
import { MOCK_USER, MOCK_POSTS, MOCK_PRODUCTS, LEADERBOARD, MOCK_COURSES, MOCK_VOTES } from '../constants';

const DELAY = 300;
const STORAGE_KEYS = {
  USERS: 'nhc_users',
  POSTS: 'nhc_posts',
  PRODUCTS: 'nhc_products',
  COMMENTS: 'nhc_comments',
  POINTS: 'nhc_points_history',
  NOTIFICATIONS: 'nhc_notifications',
  FOLLOWS: 'nhc_follows',
  AFFILIATE_CLICKS: 'nhc_affiliate_clicks',
  REVENUE: 'nhc_revenue',
  WALLETS: 'nhc_wallets',
  VOTES: 'nhc_votes',
  COURSES: 'nhc_courses',
  PROGRESS: 'nhc_learning_progress',
  WELFARE: 'nhc_welfare_activity',
  TOKEN_CONVERSIONS: 'nhc_token_conversions'
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export class BrowserDatabase {
  private initialized: boolean = false;

  private get<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Database Error:', e);
      return [];
    }
  }

  private set<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Database Save Error:', e);
    }
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, DELAY));
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const users = this.get<User>(STORAGE_KEYS.USERS);
    if (users.length === 0) {
      console.log('Seeding Database...');
      const seededUsers = [
        { ...MOCK_USER, password_hash: 'password123', email: 'user@example.com', bio: 'Passionate about hemp farming and sustainable living in Nepal.', role: 'admin' },
        ...MOCK_POSTS.map(p => ({ 
          ...p.author, 
          id: p.user_id,
          password_hash: 'password123',
          email: `${p.author.username.toLowerCase()}@example.com`,
          bio: 'Community member.'
        }))
      ].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

      this.set(STORAGE_KEYS.USERS, seededUsers);

      const seededPosts = MOCK_POSTS.map(p => ({
        ...p,
        liked_by: []
      }));
      this.set(STORAGE_KEYS.POSTS, seededPosts);
      this.set(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
      
      const history: PointHistory[] = LEADERBOARD.map(l => ({
        id: generateId(),
        user_id: l.id,
        points: l.points,
        reason: PointReason.PROFILE_COMPLETE,
        created_at: new Date().toISOString()
      }));
      this.set(STORAGE_KEYS.POINTS, history);
      this.set(STORAGE_KEYS.COMMENTS, []);
      this.set(STORAGE_KEYS.NOTIFICATIONS, []);
      this.set(STORAGE_KEYS.FOLLOWS, []);
      this.set(STORAGE_KEYS.AFFILIATE_CLICKS, []);
      this.set(STORAGE_KEYS.REVENUE, []);
      
      // New Seeds
      this.set(STORAGE_KEYS.VOTES, MOCK_VOTES);
      this.set(STORAGE_KEYS.COURSES, MOCK_COURSES);
      this.set(STORAGE_KEYS.PROGRESS, []);
      this.set(STORAGE_KEYS.WALLETS, []);
      this.set(STORAGE_KEYS.WELFARE, []);
      this.set(STORAGE_KEYS.TOKEN_CONVERSIONS, []);
    }
    this.initialized = true;
  }

  // --- User Operations ---

  async getUserByEmail(email: string): Promise<User | null> {
    await this.simulateDelay();
    const users = this.get<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    await this.simulateDelay();
    const users = this.get<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.id === id) || null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    await this.simulateDelay();
    const users = this.get<User>(STORAGE_KEYS.USERS);
    if (users.find(u => u.email === userData.email)) throw new Error('Email already exists');

    const newUser: User = {
      id: generateId(),
      username: userData.username || 'User',
      email: userData.email!,
      password_hash: userData.password_hash,
      hemp_points: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
      location: userData.location || 'Nepal',
      bio: '',
      is_verified_age: userData.is_verified_age || false,
      role: 'user',
      is_premium: false,
      joined_at: new Date().toLocaleDateString(),
      ...userData
    } as User;

    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    await this.awardPoints(newUser.id, 25, PointReason.REGISTER);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await this.simulateDelay();
    const users = this.get<User>(STORAGE_KEYS.USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    users[index] = { ...users[index], ...updates };
    this.set(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const posts = this.get<Post>(STORAGE_KEYS.POSTS).filter(p => p.user_id === userId);
    const comments = this.get<Comment>(STORAGE_KEYS.COMMENTS).filter(c => c.user_id === userId);
    const followers = this.get<Follow>(STORAGE_KEYS.FOLLOWS).filter(f => f.following_id === userId);
    const following = this.get<Follow>(STORAGE_KEYS.FOLLOWS).filter(f => f.follower_id === userId);
    
    const users = this.get<User>(STORAGE_KEYS.USERS).sort((a,b) => b.hemp_points - a.hemp_points);
    const rank = users.findIndex(u => u.id === userId) + 1;

    return {
      postsCount: posts.length,
      commentsCount: comments.length,
      followersCount: followers.length,
      followingCount: following.length,
      rank
    };
  }

  async upgradeToPremium(userId: string, plan: 'monthly' | 'yearly'): Promise<void> {
    await this.simulateDelay();
    await this.updateUser(userId, { is_premium: true });
    
    const amount = plan === 'monthly' ? 500 : 5000; // NPR
    await this.recordRevenue({
      source: 'premium_subscription',
      amount,
      currency: 'NPR',
      description: `Premium Subscription (${plan}) - ${userId}`
    });
    
    await this.awardPoints(userId, 100, PointReason.PREMIUM_BONUS);
  }

  // --- Post Operations ---

  async getPosts(category?: string): Promise<Post[]> {
    await this.simulateDelay();
    const posts = this.get<Post>(STORAGE_KEYS.POSTS);
    const users = this.get<User>(STORAGE_KEYS.USERS);
    const joinedPosts = posts.map(post => ({ ...post, author: users.find(u => u.id === post.user_id) || MOCK_USER }));

    let result = joinedPosts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (category && category !== 'All') {
      result = result.filter(p => p.category === category);
    }
    return result;
  }

  async getPostById(postId: string): Promise<Post | null> {
    await this.simulateDelay();
    const posts = this.get<Post>(STORAGE_KEYS.POSTS);
    const post = posts.find(p => p.id === postId);
    if (!post) return null;
    const users = this.get<User>(STORAGE_KEYS.USERS);
    return { ...post, author: users.find(u => u.id === post.user_id) || MOCK_USER };
  }

  async createPost(postData: Partial<Post>): Promise<Post> {
    await this.simulateDelay();
    const posts = this.get<Post>(STORAGE_KEYS.POSTS);
    const newPost: Post = {
      id: generateId(),
      likes: 0,
      liked_by: [],
      comment_count: 0,
      created_at: new Date().toISOString(),
      is_sponsored: postData.is_sponsored || false,
      title: postData.title!,
      content: postData.content!,
      category: postData.category!,
      user_id: postData.user_id!,
      author: postData.author!, 
      image_url: postData.image_url
    };
    posts.unshift(newPost);
    this.set(STORAGE_KEYS.POSTS, posts);
    await this.awardPoints(postData.user_id!, 10, PointReason.CREATE_POST);
    return newPost;
  }

  async createSponsoredPost(postData: Partial<Post>, amount: number): Promise<Post> {
    const post = await this.createPost({ ...postData, is_sponsored: true });
    await this.recordRevenue({
      source: 'sponsored_post',
      amount,
      currency: 'NPR',
      description: `Sponsored Post: ${post.title}`
    });
    return post;
  }

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    await this.simulateDelay();
    const posts = this.get<Post>(STORAGE_KEYS.POSTS);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error('Post not found');

    const post = posts[postIndex];
    const likedBy = post.liked_by || [];
    const hasLiked = likedBy.includes(userId);
    let isLiked = false;

    if (hasLiked) {
      post.liked_by = likedBy.filter(id => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.liked_by = [...likedBy, userId];
      post.likes += 1;
      isLiked = true;
      if (post.user_id !== userId) {
        await this.awardPoints(post.user_id, 2, PointReason.RECEIVE_LIKE);
        await this.createNotification({
          user_id: post.user_id,
          actor_id: userId,
          type: 'like',
          content: 'liked your post',
          related_id: postId
        });
      }
    }
    posts[postIndex] = post;
    this.set(STORAGE_KEYS.POSTS, posts);
    return isLiked;
  }

  // --- Comment Operations ---

  async getComments(postId: string): Promise<Comment[]> {
    await this.simulateDelay();
    const allComments = this.get<Comment>(STORAGE_KEYS.COMMENTS);
    const users = this.get<User>(STORAGE_KEYS.USERS);
    
    const postComments = allComments
      .filter(c => c.post_id === postId)
      .map(c => ({
        ...c,
        author: users.find(u => u.id === c.user_id) || MOCK_USER,
        replies: [] 
      }))
      .sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const commentMap = new Map<string, Comment>();
    postComments.forEach(c => commentMap.set(c.id, c));
    
    const rootComments: Comment[] = [];
    postComments.forEach(comment => {
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        commentMap.get(comment.parent_id)!.replies!.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  async addComment(commentData: Partial<Comment>): Promise<Comment> {
    await this.simulateDelay();
    const comments = this.get<Comment>(STORAGE_KEYS.COMMENTS);
    const posts = this.get<Post>(STORAGE_KEYS.POSTS);
    const users = this.get<User>(STORAGE_KEYS.USERS);

    const postIndex = posts.findIndex(p => p.id === commentData.post_id);
    if (postIndex === -1) throw new Error('Post not found');

    const newComment: Comment = {
      id: generateId(),
      post_id: commentData.post_id!,
      parent_id: commentData.parent_id || null,
      user_id: commentData.user_id!,
      author: users.find(u => u.id === commentData.user_id!)!,
      content: commentData.content!,
      likes: 0,
      liked_by: [],
      created_at: new Date().toISOString(),
      replies: []
    };

    comments.push(newComment);
    this.set(STORAGE_KEYS.COMMENTS, comments);

    posts[postIndex].comment_count += 1;
    this.set(STORAGE_KEYS.POSTS, posts);

    await this.awardPoints(commentData.user_id!, 5, PointReason.CREATE_COMMENT);

    const post = posts[postIndex];
    if (post.user_id !== commentData.user_id) {
       await this.createNotification({
         user_id: post.user_id,
         actor_id: commentData.user_id!,
         type: 'comment',
         content: 'commented on your post',
         related_id: post.id
       });
    }

    return newComment;
  }

  // --- Notification System ---

  async createNotification(notifData: Partial<Notification>): Promise<void> {
    const notifs = this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const users = this.get<User>(STORAGE_KEYS.USERS);
    const actor = users.find(u => u.id === notifData.actor_id);

    notifs.unshift({
      id: generateId(),
      user_id: notifData.user_id!,
      actor_id: notifData.actor_id!,
      actor_name: actor?.username || 'Someone',
      actor_avatar: actor?.avatar || '',
      type: notifData.type as any,
      content: notifData.content!,
      read: false,
      related_id: notifData.related_id,
      created_at: new Date().toISOString()
    });

    if (notifs.length > 100) notifs.pop();
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    await this.simulateDelay();
    return this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS).filter(n => n.user_id === userId);
  }

  async markNotificationsRead(userId: string): Promise<void> {
    const notifs = this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const updated = notifs.map(n => n.user_id === userId ? { ...n, read: true } : n);
    this.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // --- Follow System ---

  async followUser(followerId: string, followingId: string): Promise<void> {
    await this.simulateDelay();
    const follows = this.get<Follow>(STORAGE_KEYS.FOLLOWS);
    if (follows.find(f => f.follower_id === followerId && f.following_id === followingId)) return;

    follows.push({
      id: generateId(),
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.FOLLOWS, follows);

    await this.createNotification({
      user_id: followingId,
      actor_id: followerId,
      type: 'follow',
      content: 'started following you'
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await this.simulateDelay();
    let follows = this.get<Follow>(STORAGE_KEYS.FOLLOWS);
    follows = follows.filter(f => !(f.follower_id === followerId && f.following_id === followingId));
    this.set(STORAGE_KEYS.FOLLOWS, follows);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follows = this.get<Follow>(STORAGE_KEYS.FOLLOWS);
    return !!follows.find(f => f.follower_id === followerId && f.following_id === followingId);
  }

  // --- Marketplace & Monetization ---

  async getProducts(): Promise<Product[]> {
    await this.simulateDelay();
    return this.get<Product>(STORAGE_KEYS.PRODUCTS);
  }

  async trackAffiliateClick(productId: string, userId?: string): Promise<void> {
    const clicks = this.get<AffiliateClick>(STORAGE_KEYS.AFFILIATE_CLICKS);
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS);
    
    // Record Click
    clicks.push({
      id: generateId(),
      product_id: productId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.AFFILIATE_CLICKS, clicks);

    // Update Product Click Count (Simulated hotness)
    const pIndex = products.findIndex(p => p.id === productId);
    if (pIndex !== -1) {
      products[pIndex].clicks = (products[pIndex].clicks || 0) + 1;
      this.set(STORAGE_KEYS.PRODUCTS, products);
    }

    // Simulate Affiliate Revenue (Randomly)
    if (Math.random() > 0.8) {
       await this.recordRevenue({
         source: 'affiliate',
         amount: Math.floor(Math.random() * 50) + 10,
         currency: 'NPR',
         description: `Commission from product ${productId}`
       });
    }
  }

  async recordRevenue(record: Partial<RevenueRecord>): Promise<void> {
    const revenue = this.get<RevenueRecord>(STORAGE_KEYS.REVENUE);
    revenue.push({
      id: generateId(),
      source: record.source!,
      amount: record.amount!,
      currency: 'NPR',
      description: record.description || 'Revenue',
      timestamp: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.REVENUE, revenue);
  }

  async getBusinessMetrics(): Promise<BusinessMetrics> {
    await this.simulateDelay();
    const revenue = this.get<RevenueRecord>(STORAGE_KEYS.REVENUE);
    const clicks = this.get<AffiliateClick>(STORAGE_KEYS.AFFILIATE_CLICKS);
    const users = this.get<User>(STORAGE_KEYS.USERS);
    const posts = this.get<Post>(STORAGE_KEYS.POSTS);

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const dailyRevenue = revenue
      .filter(r => r.timestamp.startsWith(today))
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      total_revenue: totalRevenue,
      daily_revenue: dailyRevenue,
      affiliate_clicks: clicks.length,
      premium_subscribers: users.filter(u => u.is_premium).length,
      active_campaigns: posts.filter(p => p.is_sponsored).length,
      user_engagement: {
        total_users: users.length,
        posts_today: posts.filter(p => p.created_at.startsWith(today)).length,
        active_users_today: users.length // Simplified for demo
      }
    };
  }

  // --- Crypto & Governance ---

  async saveWalletAddress(userId: string, address: string, chain: WalletAddress['chain']): Promise<void> {
    await this.simulateDelay();
    const wallets = this.get<WalletAddress>(STORAGE_KEYS.WALLETS);
    const index = wallets.findIndex(w => w.user_id === userId);
    
    const newWallet: WalletAddress = {
      user_id: userId,
      address,
      chain,
      verified: true, // Auto-verify for demo
      updated_at: new Date().toISOString()
    };

    if (index !== -1) {
      wallets[index] = newWallet;
    } else {
      wallets.push(newWallet);
    }
    this.set(STORAGE_KEYS.WALLETS, wallets);
  }

  async getWalletAddress(userId: string): Promise<WalletAddress | null> {
    await this.simulateDelay();
    const wallets = this.get<WalletAddress>(STORAGE_KEYS.WALLETS);
    return wallets.find(w => w.user_id === userId) || null;
  }

  async getVotes(): Promise<CommunityVote[]> {
    await this.simulateDelay();
    return this.get<CommunityVote>(STORAGE_KEYS.VOTES);
  }

  async castVote(voteId: string, optionId: string, userId: string): Promise<void> {
    await this.simulateDelay();
    const votes = this.get<CommunityVote>(STORAGE_KEYS.VOTES);
    const voteIndex = votes.findIndex(v => v.id === voteId);
    
    if (voteIndex === -1) throw new Error('Vote not found');
    const vote = votes[voteIndex];
    
    if (vote.voted_users.includes(userId)) throw new Error('Already voted');
    
    vote.voted_users.push(userId);
    const optIndex = vote.options.findIndex(o => o.id === optionId);
    if (optIndex !== -1) {
      vote.options[optIndex].votes += 1;
    }

    votes[voteIndex] = vote;
    this.set(STORAGE_KEYS.VOTES, votes);
    await this.awardPoints(userId, 5, PointReason.VOTING_REWARD);
  }

  async saveTokenConversion(conversion: Partial<TokenConversion>): Promise<void> {
    const conversions = this.get<TokenConversion>(STORAGE_KEYS.TOKEN_CONVERSIONS);
    conversions.push({
      id: generateId(),
      user_id: conversion.user_id!,
      hemp_points: conversion.hemp_points!,
      estimated_tokens: conversion.estimated_tokens!,
      conversion_rate: conversion.conversion_rate!,
      timestamp: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.TOKEN_CONVERSIONS, conversions);
  }

  // --- Education ---

  async getCourses(): Promise<Course[]> {
    await this.simulateDelay();
    return this.get<Course>(STORAGE_KEYS.COURSES);
  }

  async getLearningProgress(userId: string): Promise<LearningProgress[]> {
    await this.simulateDelay();
    const allProgress = this.get<LearningProgress>(STORAGE_KEYS.PROGRESS);
    return allProgress.filter(p => p.user_id === userId);
  }

  async updateCourseProgress(userId: string, courseId: string, modulesCompleted: number): Promise<void> {
    await this.simulateDelay();
    const progressList = this.get<LearningProgress>(STORAGE_KEYS.PROGRESS);
    const courses = this.get<Course>(STORAGE_KEYS.COURSES);
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    let index = progressList.findIndex(p => p.user_id === userId && p.course_id === courseId);
    
    if (index === -1) {
        const newProgress: LearningProgress = {
            id: generateId(),
            user_id: userId,
            course_id: courseId,
            completed_modules: modulesCompleted,
            is_completed: modulesCompleted >= course.modules_count,
            last_updated: new Date().toISOString()
        };
        progressList.push(newProgress);
        index = progressList.length - 1;
    } else {
        progressList[index].completed_modules = modulesCompleted;
        progressList[index].is_completed = modulesCompleted >= course.modules_count;
        progressList[index].last_updated = new Date().toISOString();
    }

    // Award points if completed just now
    if (progressList[index].is_completed && modulesCompleted >= course.modules_count) {
       await this.awardPoints(userId, course.points_reward, `${PointReason.COURSE_COMPLETION}: ${course.title}`);
    }

    this.set(STORAGE_KEYS.PROGRESS, progressList);
  }

  // --- Animal Welfare ---
  
  async logWelfareActivity(activity: Partial<WelfareActivity>): Promise<void> {
    await this.simulateDelay();
    const activities = this.get<WelfareActivity>(STORAGE_KEYS.WELFARE);
    activities.unshift({
        id: generateId(),
        user_id: activity.user_id!,
        type: activity.type || 'Volunteer',
        description: activity.description || '',
        hours: activity.hours || 0,
        donation_amount: activity.donation_amount || 0,
        proof_url: activity.proof_url || '',
        verified: false, // Default to false
        created_at: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.WELFARE, activities);
    
    // Auto award for reporting (small bonus)
    await this.awardPoints(activity.user_id!, 20, PointReason.ANIMAL_WELFARE);
  }

  async getWelfareActivities(): Promise<WelfareActivity[]> {
      await this.simulateDelay();
      return this.get<WelfareActivity>(STORAGE_KEYS.WELFARE);
  }

  async getWelfareStats(): Promise<WelfareStats> {
      await this.simulateDelay();
      const activities = this.get<WelfareActivity>(STORAGE_KEYS.WELFARE);
      return {
          total_activities: activities.length,
          total_volunteer_hours: activities.reduce((sum, a) => sum + (a.hours || 0), 0),
          total_donations: activities.reduce((sum, a) => sum + (a.donation_amount || 0), 0)
      };
  }

  // --- Points & Common ---

  async awardPoints(userId: string, points: number, reason: PointReason | string): Promise<void> {
    const users = this.get<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    users[userIndex].hemp_points += points;
    this.set(STORAGE_KEYS.USERS, users);

    const history = this.get<PointHistory>(STORAGE_KEYS.POINTS);
    history.push({
      id: generateId(),
      user_id: userId,
      points,
      reason,
      created_at: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.POINTS, history);
  }

  async getLeaderboard(): Promise<User[]> {
    await this.simulateDelay();
    const users = this.get<User>(STORAGE_KEYS.USERS);
    return users.sort((a, b) => b.hemp_points - a.hemp_points).slice(0, 10);
  }

  async donatePoints(fromUserId: string, amount: number): Promise<void> {
    await this.simulateDelay();
    const users = this.get<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === fromUserId);
    if (userIndex === -1) throw new Error("User not found");
    if (users[userIndex].hemp_points < amount) throw new Error("Insufficient points");

    users[userIndex].hemp_points -= amount;
    this.set(STORAGE_KEYS.USERS, users);

    const history = this.get<PointHistory>(STORAGE_KEYS.POINTS);
    history.push({
      id: generateId(),
      user_id: fromUserId,
      points: -amount,
      reason: PointReason.DONATION,
      created_at: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.POINTS, history);
    
    // Log as donation activity
    await this.logWelfareActivity({
        user_id: fromUserId,
        type: 'Donation',
        description: `Donated ${amount} Hemp Points`,
        donation_amount: amount,
        verified: true
    });
  }
}

export const db = new BrowserDatabase();
