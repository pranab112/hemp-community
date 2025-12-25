import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { BusinessMetrics } from '../types';
import { TrendingUp, Users, DollarSign, MousePointer, Activity } from 'lucide-react';

export const BusinessDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await db.getBusinessMetrics();
      setMetrics(data);
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Live updates
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div className="p-10 text-center">Loading analytics...</div>;

  const Card = ({ title, value, icon, color }: any) => (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center">
      <div className={`p-4 rounded-full ${color} text-white mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Business Overview</h2>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Live Data</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          title="Total Revenue" 
          value={`NPR ${metrics.total_revenue.toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="bg-green-600" 
        />
        <Card 
          title="Revenue Today" 
          value={`NPR ${metrics.daily_revenue.toLocaleString()}`} 
          icon={<TrendingUp size={24} />} 
          color="bg-blue-600" 
        />
        <Card 
          title="Affiliate Clicks" 
          value={metrics.affiliate_clicks} 
          icon={<MousePointer size={24} />} 
          color="bg-purple-600" 
        />
        <Card 
          title="Total Users" 
          value={metrics.user_engagement.total_users} 
          icon={<Users size={24} />} 
          color="bg-orange-500" 
        />
         <Card 
          title="Premium Subscribers" 
          value={metrics.premium_subscribers} 
          icon={<Activity size={24} />} 
          color="bg-indigo-500" 
        />
         <Card 
          title="Posts Today" 
          value={metrics.user_engagement.posts_today} 
          icon={<Activity size={24} />} 
          color="bg-pink-500" 
        />
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Revenue Activity</h3>
        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
           Chart Visualization would go here
        </div>
      </div>
    </div>
  );
};
