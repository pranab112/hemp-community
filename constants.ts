import { Post, Product, User, PostCategory } from './types';

export const NEPAL_CITIES = [
  'Kathmandu',
  'Pokhara',
  'Lalitpur',
  'Biratnagar',
  'Bharatpur',
  'Birgunj',
  'Dharan',
  'Hetauda',
  'Butwal',
  'Bhaktapur',
  'Dhangadhi',
  'Itahari',
  'Nepalgunj'
];

export const MOCK_USER: User = {
  id: 'u1',
  username: 'HimalayanGrower',
  email: 'user@example.com',
  hemp_points: 1420,
  avatar: 'https://picsum.photos/seed/user1/200/200',
  location: 'Pokhara',
  is_verified_age: true,
  role: 'user',
  joined_at: '2023-11-01'
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user_id: 'u2',
    author: { ...MOCK_USER, id: 'u2', username: 'KathmanduVibes', avatar: 'https://picsum.photos/seed/u2/200' },
    title: 'The history of hemp usage in rural Nepal',
    content: 'For centuries, hemp has been an integral part of Nepalese culture, used for fibers, food, and medicine. Let’s discuss how we can preserve these traditions while modernizing cultivation.',
    image_url: 'https://picsum.photos/seed/hemp1/800/400',
    category: PostCategory.EDUCATION,
    likes: 45,
    comment_count: 12,
    created_at: '2 hours ago',
    is_sponsored: false
  },
  {
    id: 'p2',
    user_id: 'u3',
    author: { ...MOCK_USER, id: 'u3', username: 'StrayDogRescue', avatar: 'https://picsum.photos/seed/u3/200' },
    title: 'Rescued 3 pups from Thamel today! 🐶',
    content: 'Our team found these little ones near the market. They are safe now. A portion of all hemp accessory sales this week goes to their food and vaccination. #AnimalWelfare',
    image_url: 'https://picsum.photos/seed/dog1/800/400',
    category: PostCategory.ANIMAL_WELFARE,
    likes: 128,
    comment_count: 34,
    created_at: '5 hours ago',
    is_sponsored: false
  },
  {
    id: 'p3',
    user_id: 'u4',
    author: { ...MOCK_USER, id: 'u4', username: 'GreenValleyShop', avatar: 'https://picsum.photos/seed/u4/200' },
    title: 'Top 5 Organic CBD Oils available in Kathmandu',
    content: 'Reviewing the best local brands. Check the marketplace for links!',
    category: PostCategory.PRODUCTS,
    likes: 89,
    comment_count: 5,
    created_at: '1 day ago',
    is_sponsored: true
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'pr1',
    title: 'Hemp Backpack - Handmade',
    description: 'Durable, eco-friendly backpack made from 100% wild Himalayan hemp.',
    price: 2500,
    currency: 'NPR',
    image_url: 'https://picsum.photos/seed/bag/300/300',
    affiliate_link: '#',
    rating: 4.8,
    category: 'Accessories',
    is_featured: true
  },
  {
    id: 'pr2',
    title: 'Full Spectrum CBD Oil (10%)',
    description: 'Organic CBD oil sourced from local farms. Great for relaxation.',
    price: 4500,
    currency: 'NPR',
    image_url: 'https://picsum.photos/seed/oil/300/300',
    affiliate_link: '#',
    rating: 4.9,
    category: 'Wellness',
    is_featured: true
  },
  {
    id: 'pr3',
    title: 'Hemp Seed Oil Soap',
    description: 'Natural soap bar rich in Omega-3 and Omega-6.',
    price: 350,
    currency: 'NPR',
    image_url: 'https://picsum.photos/seed/soap/300/300',
    affiliate_link: '#',
    rating: 4.5,
    category: 'Beauty'
  },
  {
    id: 'pr4',
    title: 'Dog Treats - Calming Hemp',
    description: 'Help your furry friend relax with these natural treats.',
    price: 1200,
    currency: 'NPR',
    image_url: 'https://picsum.photos/seed/treats/300/300',
    affiliate_link: '#',
    rating: 5.0,
    category: 'Pets'
  }
];

export const LEADERBOARD = [
  { id: '1', username: 'EverestHigh', points: 5200, avatar: 'https://picsum.photos/seed/l1/100' },
  { id: '2', username: 'HimalayanGrower', points: 1420, avatar: 'https://picsum.photos/seed/user1/100' },
  { id: '3', username: 'GreenTara', points: 980, avatar: 'https://picsum.photos/seed/l3/100' },
  { id: '4', username: 'YetiKush', points: 850, avatar: 'https://picsum.photos/seed/l4/100' },
  { id: '5', username: 'BuddhaHerbs', points: 720, avatar: 'https://picsum.photos/seed/l5/100' },
];