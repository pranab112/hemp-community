import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (!user) return;
    const list = await db.getNotifications(user.id);
    // Sort by date desc
    list.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setNotifications(list);
    setUnreadCount(list.filter(n => !n.read).length);
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Polling for simulation
    return () => clearInterval(interval);
  }, [user]);

  const toggleOpen = async () => {
    if (!isOpen && unreadCount > 0 && user) {
        // Mark as read when opening
        await db.markNotificationsRead(user.id);
        setUnreadCount(0);
    }
    setIsOpen(!isOpen);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={14} className="text-white fill-current" />;
      case 'comment': return <MessageCircle size={14} className="text-white" />;
      case 'follow': return <UserPlus size={14} className="text-white" />;
      default: return <Bell size={14} className="text-white" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-red-500';
      case 'comment': return 'bg-blue-500';
      case 'follow': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={toggleOpen}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-100 font-bold text-sm text-gray-700 flex justify-between">
            <span>Notifications</span>
            {notifications.length > 0 && <span className="text-xs text-gray-400 font-normal cursor-pointer">Clear all</span>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : (
                notifications.map(n => (
                    <div key={n.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start space-x-3 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                        <div className="relative">
                            <img src={n.actor_avatar} alt="" className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${getBgColor(n.type)} border-2 border-white`}>
                                {getIcon(n.type)}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-800">
                                <span className="font-bold">{n.actor_name}</span> {n.content}
                            </p>
                            <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}
      
      {/* Overlay to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
