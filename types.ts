export enum ViewState {
  FEED = 'FEED',
  MARKETPLACE = 'MARKETPLACE',
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  PROFILE = 'PROFILE',
  POST_DETAIL = 'POST_DETAIL',
  ADMIN = 'ADMIN',
  BUSINESS_DASHBOARD = 'BUSINESS_DASHBOARD',
  CRYPTO = 'CRYPTO',
  GOVERNANCE = 'GOVERNANCE',
  EDUCATION = 'EDUCATION'
}

export enum PostCategory {
  EDUCATION = 'Hemp Education',
  GROWING = 'Growing Tips',
  PRODUCTS = 'Products',
  ANIMAL_WELFARE = 'Animal Welfare',
  NEPAL_NEWS = 'Nepal News',
  GENERAL = 'General Discussion'
}

export enum PointReason {
  REGISTER = 'Registration Bonus',
  DAILY_LOGIN = 'Daily Login',
  CREATE_POST = 'Created Post',
  CREATE_COMMENT = 'Commented',
  RECEIVE_LIKE = 'Received Like',
  PROFILE_COMPLETE = 'Profile Completion',
  ANIMAL_WELFARE = 'Animal Welfare Activity',
  DONATION = 'Donation to Animal Shelter',
  PREMIUM_BONUS = 'Premium Subscription Bonus',
  MARKETPLACE_PURCHASE = 'Marketplace Purchase Reward',
  COURSE_COMPLETION = 'Course Completion',
  VOTING_REWARD = 'Governance Participation'
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string; // Simulated hash
  hemp_points: number;
  avatar: string;
  location: string;
  bio?: string;
  is_verified_age: boolean;
  role: 'user' | 'admin' | 'moderator';
  is_premium?: boolean;
  joined_at: string;
  last_login?: string;
}

export interface Post {
  id: string;
  user_id: string;
  author: User; // Populated on fetch
  title: string;
  content: string;
  image_url?: string;
  category: PostCategory;
  likes: number;
  liked_by: string[]; // Array of user IDs
  comment_count: number;
  created_at: string;
  is_sponsored?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string | null;
  user_id: string;
  author: User; // Populated
  content: string;
  likes: number;
  liked_by: string[];
  created_at: string;
  replies?: Comment[]; // Populated structure
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  affiliate_link: string;
  rating: number;
  category: string;
  is_featured?: boolean;
  clicks?: number;
}

export interface PointHistory {
  id: string;
  user_id: string;
  points: number;
  reason: PointReason | string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string; // Recipient
  actor_id: string; // Who triggered it
  actor_name: string;
  actor_avatar: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  content: string;
  read: boolean;
  related_id?: string; // post_id or user_id
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface UserStats {
  postsCount: number;
  commentsCount: number;
  followersCount: number;
  followingCount: number;
  rank: number;
}

// Monetization & Analytics Types

export interface AffiliateClick {
  id: string;
  product_id: string;
  user_id?: string;
  timestamp: string;
}

export interface RevenueRecord {
  id: string;
  source: 'affiliate' | 'sponsored_post' | 'premium_subscription';
  amount: number;
  currency: string;
  description: string;
  timestamp: string;
}

export interface BusinessMetrics {
  total_revenue: number;
  daily_revenue: number;
  affiliate_clicks: number;
  premium_subscribers: number;
  active_campaigns: number;
  user_engagement: UserEngagement;
}

export interface UserEngagement {
  total_users: number;
  posts_today: number;
  active_users_today: number;
}

// Crypto & Governance Types

export interface WalletAddress {
  user_id: string;
  address: string;
  chain: 'Solana' | 'Polygon' | 'Ethereum';
  verified: boolean;
  updated_at: string;
}

export interface CommunityVote {
  id: string;
  title: string;
  description: string;
  options: { id: string; label: string; votes: number }[];
  endDate: string;
  voted_users: string[]; // user_ids
  status: 'active' | 'closed';
  category: 'Feature' | 'Community' | 'Charity';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules_count: number;
  points_reward: number;
  image_url: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface LearningProgress {
  id: string;
  user_id: string;
  course_id: string;
  completed_modules: number;
  is_completed: boolean;
  last_updated: string;
}

export interface WelfareActivity {
  id: string;
  user_id: string;
  type: 'Donation' | 'Volunteer' | 'Rescue';
  description: string;
  hours?: number; // For volunteer work
  donation_amount?: number; // For point donations or cash tracking
  proof_url?: string;
  verified: boolean;
  created_at: string;
}

export interface TokenConversion {
  id: string;
  user_id: string;
  hemp_points: number;
  estimated_tokens: number;
  conversion_rate: number;
  timestamp: string;
}

export interface WelfareStats {
    total_activities: number;
    total_volunteer_hours: number;
    total_donations: number;
}
