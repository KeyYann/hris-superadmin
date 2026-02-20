'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Bell, Clock, AlertCircle, Search, Calendar, ChevronDown
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');

  // Fetch notifications
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, user?.departmentId]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        userId: user.id,
        userRole: user.role,
      });
      if (user.departmentId) {
        params.append('departmentId', user.departmentId);
      }
      
      const response = await fetch(`/api/notifications?${params.toString()}`);
      const data = await response.json();
      
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark all as read when leaving the page
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return () => {
      timeoutRef.current = setTimeout(async () => {
        if (user?.id) {
          try {
            await fetch('/api/notifications/mark-read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id })
            });
          } catch (error) {
            console.error('Error marking notifications as read:', error);
          }
        }
      }, 500);
    };
  }, [user]);

  // --- FILTER LOGIC ---
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread' && n.isRead) return false;
    if (activeTab === 'archived') return false; 
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const textMatch = n.message.toLowerCase().includes(query);
      if (!textMatch) return false;
    }

    const nDate = new Date(n.timestamp);
    const today = new Date();
    
    if (dateFilter === 'Today') return nDate.toDateString() === today.toDateString();
    if (dateFilter === 'Yesterday') {
      const yDay = new Date();
      yDay.setDate(today.getDate() - 1);
      return nDate.toDateString() === yDay.toDateString();
    }
    if (dateFilter === 'This Month') return nDate.getMonth() === today.getMonth() && nDate.getFullYear() === today.getFullYear();

    return true; 
  });

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)]">

      {/* MAIN CARD */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* TOOLBAR */}
        <div className="flex flex-col xl:flex-row items-center justify-between p-4 border-b border-gray-100 gap-4">
           
           <div className="flex bg-gray-50 p-1 rounded-xl w-full xl:w-auto">
              <TabButton label="All" count={notifications.length} isActive={activeTab === 'all'} onClick={() => setActiveTab('all')} />
              <TabButton label="Unread" count={unreadCount} isActive={activeTab === 'unread'} onClick={() => setActiveTab('unread')} />
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:w-48 group">
                 <select 
                   value={dateFilter}
                   onChange={(e) => setDateFilter(e.target.value)}
                   className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                 >
                   <option>All Time</option>
                   <option>Today</option>
                   <option>Yesterday</option>
                   <option>This Month</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" size={16} />
              </div>

              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm transition-all"
                  />
              </div>
           </div>
        </div>

        {/* NOTIFICATION LIST */}
        <div className="flex-1 overflow-y-auto">
            {isLoading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Bell size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">No notifications found.</p>
                    <p className="text-sm">Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {filteredNotifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className={`
                                group p-4 flex gap-4 items-start transition-all hover:bg-gray-50
                                ${!notif.isRead ? 'bg-blue-50/10' : ''}
                            `}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${
                              notif.type === 'time_off_requests' ? 'bg-blue-100 text-blue-600' :
                              notif.type === 'overtime_requests' ? 'bg-orange-100 text-orange-600' :
                              notif.type === 'official_business_requests' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                                <Bell size={20} />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm text-gray-800 leading-snug">
                                    {notif.message}
                                    
                                    {/* Unread Dot (INLINE) */}
                                    {!notif.isRead && (
                                        <span className="inline-flex align-middle ml-2">
                                            <span className="w-2 h-2 bg-brand rounded-full ring-2 ring-orange-100 animate-pulse shadow-sm shadow-orange-300"></span>
                                        </span>
                                    )}
                                </p>

                                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 font-medium">
                                    <Clock size={12} className="opacity-70" />
                                    <span>{notif.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, count, isActive, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`
                flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all
                ${isActive 
                    ? 'bg-white text-brand shadow-sm ring-1 ring-gray-200' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }
            `}
        >
            {label}
            {count !== undefined && (
                <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full ${isActive ? 'bg-orange-100 text-brand' : 'bg-gray-200 text-gray-600'}`}>
                    {count}
                </span>
            )}
        </button>
    )
}