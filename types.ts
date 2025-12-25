export enum ViewState {
  FEED = 'FEED',
  MARKETPLACE = 'MARKETPLACE',
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  PROFILE = 'PROFILE',
}

export enum PostCategory {
  EDUCATION = 'Hemp Education',
  GROWING = 'Growing Tips',
  PRODUCTS = 'Products',
  ANIMAL_WELFARE = 'Animal Welfare',
  NEPAL_NEWS = 'Nepal News',
  GENERAL = 'General Discussion'
}

export interface User {
  id: string;
  username: string;
  email: string;
  hemp_points: number;
  avatar: string;
  location: string;
  is_verified_age: boolean;
  role: 'user' | 'admin' | 'moderator';
  joined_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  author: User;
  title: string;
  content: string;
  image_url?: string;
  category: PostCategory;
  likes: number;
  comment_count: number;
  created_at: string;
  is_sponsored?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  created_at: string;
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
}

export interface PointHistory {
  id: string;
  user_id: string;
  points: number;
  reason: string; // e.g., "Post Created", "Daily Login"
  created_at: string;
}
