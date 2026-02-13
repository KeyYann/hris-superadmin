'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Settings, LogOut, ChevronLeft, ChevronRight, ChevronDown, 
  CalendarDays, Calendar, Users, UserCog, Bell, Activity, Trash2, User,
  List, CreditCard, Network, Shield, X, CheckCircle, FileText
} from 'lucide-react';

interface NavbarProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  onCloseMobile?: () => void;
}

export default function Navbar({ isExpanded, setIsExpanded, onCloseMobile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, hasRole } = useAuth();
  
  // Get counts from context
  const { unreadCount, pendingTimeOffCount } = useNotifications(); 
  
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    timeOff: false,
    userMgmt: false,
    adminMgmt: false,
  });

  useEffect(() => {
    // Keep dropdowns open if on their respective paths
    if (pathname.startsWith('/time-off')) setOpenDropdowns(p => ({ ...p, timeOff: true }));
    if (pathname.startsWith('/user-management')) setOpenDropdowns(p => ({ ...p, userMgmt: true }));
    if (pathname.startsWith('/admin-management')) setOpenDropdowns(p => ({ ...p, adminMgmt: true }));
  }, [pathname]);

  const toggleDropdown = (key: string) => {
    if (!isExpanded) setIsExpanded(true);
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Define admin roles
  const adminRoles = ['Super Admin', 'Admin', 'Admin HR', 'Admin Engineering', 'Admin Marketing', 'Admin Sales', 'Admin Finance', 'Admin Managers', 'Admin Timesheet', 'Admin NetSuite'];
  const superAdminRoles = ['Super Admin'];
  const isAdmin = hasRole(adminRoles);
  const isSuperAdmin = hasRole(superAdminRoles);

  return (
    <nav 
      className={`
        bg-white shadow-xl border border-gray-100 
        flex flex-col 
        transition-all duration-300 ease-in-out
        h-full 
        z-50 
        rounded-r-3xl lg:rounded-3xl
        ${isExpanded ? 'w-72 p-5' : 'w-16 p-3'}
      `}
    >
      {/* HEADER SECTION */}
      <div className={`flex items-center mb-6 shrink-0 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {isExpanded ? (
          <>
            <div className="flex-1 flex justify-center ml-5"> 
              <div className="relative w-32 h-10">
                <Image src="/abbe-logo.png" alt="ABBE Logo" fill className="object-contain" priority />
              </div>
            </div>
            <button onClick={onCloseMobile} className="lg:hidden w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-500 cursor-pointer shrink-0"><X size={14} /></button>
            <button onClick={() => setIsExpanded(false)} className="hidden lg:flex w-5 h-5 bg-gray-100 rounded-full items-center justify-center hover:bg-gray-200 text-gray-500 hover:text-gray-900 cursor-pointer shrink-0"><ChevronLeft size={12} /></button>
          </>
        ) : (
          <button onClick={() => setIsExpanded(true)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"><ChevronRight size={18} /></button>
        )}
      </div>

      {isExpanded && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 shrink-0">Overview</p>}

      {/* MIDDLE SECTION */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white to-transparent z-20 pointer-events-none" />

        <div className="h-full overflow-y-auto flex flex-col gap-0.5 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="h-2 shrink-0"></div>
          
          <NavItem 
            href="/dashboard" 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            isExpanded={isExpanded} 
            isActive={pathname === '/dashboard'} 
          />

          {isAdmin && !isSuperAdmin && (
            <NavItem 
              href="/approvals" 
              icon={<CheckCircle size={18}/>} 
              label="Approvals" 
              isExpanded={isExpanded} 
              isActive={pathname.startsWith('/approvals')}
              hasUnread={pendingTimeOffCount > 0} 
            />
          )}

          {isSuperAdmin && (
            <NavDropdown 
              icon={<CalendarDays size={18} />} 
              label="Time Off" 
              isOpen={openDropdowns.timeOff} 
              onToggle={() => toggleDropdown('timeOff')} 
              isExpanded={isExpanded} 
              isActive={pathname.startsWith('/time-off')} 
              hasUnread={pendingTimeOffCount > 0}
            >
              <SubItem 
                href="/time-off" 
                icon={<List size={14}/>} 
                label="View All" 
                currentPath={pathname} 
                hasUnread={pendingTimeOffCount > 0} 
              />
              <SubItem href="/time-off/credits" icon={<CreditCard size={14}/>} label="Manage Credits" currentPath={pathname} />
              <SubItem href="/time-off/calendar" icon={<Calendar size={14}/>} label="Calendar" badge="Beta" badgeColor="bg-gray-500" currentPath={pathname} />
            </NavDropdown>
          )}

          {isAdmin && (
            <NavItem href="/events" icon={<Calendar size={18}/>} label="Events" isExpanded={isExpanded} isActive={pathname.startsWith('/events')} />
          )}

          {isSuperAdmin && (
            <NavDropdown 
              icon={<Users size={20} />} 
              label="User Management" 
              isOpen={openDropdowns.userMgmt} 
              onToggle={() => toggleDropdown('userMgmt')} 
              isExpanded={isExpanded} 
              isActive={pathname.startsWith('/user-management')}
            >
              <SubItem href="/user-management" icon={<Users size={14}/>} label="Manage Users" currentPath={pathname} isActive={pathname === '/user-management'} />
              <SubItem href="/user-management/departments" icon={<Network size={14}/>} label="Manage Departments" currentPath={pathname} />
            </NavDropdown>
          )}

          {isSuperAdmin && (
            <NavDropdown icon={<UserCog size={20} />} label="Admin Management" isOpen={openDropdowns.adminMgmt} onToggle={() => toggleDropdown('adminMgmt')} isExpanded={isExpanded} isActive={pathname.startsWith('/admin')}>
              <SubItem href="/admin-management" icon={<UserCog size={14}/>} label="Manage Admin" currentPath={pathname} />
              <SubItem href="/admin-management/roles" icon={<Shield size={14}/>} label="Manage Roles" currentPath={pathname} />
            </NavDropdown>
          )}

          {isAdmin && (
            <NavItem 
              href="/notifications" 
              icon={<Bell size={18}/>} 
              label="Notifications" 
              isExpanded={isExpanded} 
              isActive={pathname.startsWith('/notifications')}
              hasUnread={unreadCount > 0} 
            />
          )}
          
          {isAdmin && (
            <NavItem href="/history" icon={<Activity size={18}/>} label="History" isExpanded={isExpanded} isActive={pathname.startsWith('/history')} />
          )}
          
          {isAdmin && (
            <NavItem href="/trash" icon={<Trash2 size={18}/>} label="Trash" isExpanded={isExpanded} isActive={pathname.startsWith('/trash')} />
          )}
          
          <div className="h-6 shrink-0"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none rounded-b-lg" />
      </div>

      {/* BOTTOM SECTION */}
      <div className="shrink-0 bg-white pt-2 relative z-30"> 
        <div className="border-t border-gray-100 mb-2"></div>
        {isExpanded && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>}
        <div className="flex flex-col gap-0.5">
          <NavItem href="/profile" icon={<User size={18}/>} label="Profile" isExpanded={isExpanded} isActive={pathname.startsWith('/profile')} />
          <NavItem href="/settings" icon={<Settings size={18}/>} label="Settings" isExpanded={isExpanded} isActive={pathname.startsWith('/settings')} />
          
          <button 
            onClick={handleLogout}
            className={`
              flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 mb-0.5 shrink-0 relative
              ${!isExpanded ? 'justify-center' : ''}
              text-gray-500 hover:bg-red-50 hover:text-red-600
            `}
          >
            <div className="w-5 flex justify-center shrink-0">
              <LogOut size={18}/>
            </div>
            {isExpanded && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Log Out</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

// --- HELPER COMPONENTS ---

function NavItem({ icon, label, isExpanded, href = "#", isActive = false, hasUnread = false }: any) {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 mb-0.5 shrink-0 relative
        ${!isExpanded ? 'justify-center' : ''}
        ${isActive ? 'bg-brand text-white shadow-md shadow-orange-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
      `}
    >
      <div className="w-5 flex justify-center shrink-0 relative">
        {icon}
        {hasUnread && (
          <span className={`absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-10 ${isActive ? 'border-brand' : 'border-white'} `}>
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-inherit"></span>
          </span>
        )}
      </div>
      {isExpanded && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>}
    </Link>
  );
}

function NavDropdown({ icon, label, isOpen, onToggle, isExpanded, children, badge, isActive = false, hasUnread = false }: any) {
  const shouldHighlight = isActive && (!isExpanded || !isOpen);

  return (
    <div className="mb-0.5 shrink-0">
      <button 
        onClick={onToggle} 
        className={`
          w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors
          ${!isExpanded ? 'justify-center' : ''}
          ${shouldHighlight ? 'text-brand bg-orange-50 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
        `}
      >
        <div className="w-5 flex justify-center shrink-0 relative">
          {icon}
          {hasUnread && (
            <span className={`absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-10 border-white`}>
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-inherit"></span>
            </span>
          )}
        </div>
        {isExpanded && (
          <>
            <span className="flex-1 text-left text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
            {badge && <span className="ml-2 shrink-0 px-1.5 py-0.5 text-[9px] font-bold text-white bg-red-500 rounded-full">{badge}</span>}
            <ChevronDown size={14} className={`ml-2 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        <div className="ml-3.5 flex flex-col gap-0.5 border-l-2 border-gray-100 pl-3">{children}</div>
      </div>
    </div>
  );
}

function SubItem({ icon, label, badge, badgeColor = "bg-red-500", href = "#", currentPath, hasUnread = false, isActive: overrideActive }: any) {
  const isActive = overrideActive !== undefined ? overrideActive : currentPath === href;
  return (
    <Link href={href} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${isActive ? 'bg-orange-50 text-brand font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
      <div className="w-4 flex justify-center shrink-0 relative">
        {icon}
        {hasUnread && (
          <span className="absolute top-0 right-0 flex h-2 w-2 z-10">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>
      <span className="flex-1">{label}</span>
      {badge && <span className={`px-1.5 py-0.5 text-[9px] font-bold text-white rounded-md ${badgeColor}`}>{badge}</span>}
    </Link>
  );
}