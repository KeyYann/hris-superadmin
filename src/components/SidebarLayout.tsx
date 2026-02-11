'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation'; // 1. Import hook
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Menu } from 'lucide-react'; 

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // 2. Get current path
  const pathname = usePathname();

  // 3. If on Login page, render full screen content WITHOUT Sidebar/Header/Footer
  if (pathname === '/login') {
    return (
      <main className="w-full h-screen bg-white overflow-y-auto">
        {children}
      </main>
    );
  }

  // 4. Standard Dashboard Layout for all other pages
  return (
    <div className="h-screen w-full bg-[#F0F2F5] font-sans text-slate-800 flex overflow-hidden">
      
      {/* --- MOBILE OVERLAY --- */}
      <div 
        className={`
          fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden
          ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 h-screen transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-full lg:py-4 lg:pl-4
        `}
      >
        <div className="h-full">
            <Navbar 
              isExpanded={isExpanded} 
              setIsExpanded={setIsExpanded}
              onCloseMobile={() => setIsMobileOpen(false)}
            />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-white p-4 flex items-center justify-between shadow-sm shrink-0 z-30">
           <button 
             onClick={() => setIsMobileOpen(true)}
             className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
           >
             <Menu size={24} />
           </button>
           <span className="font-bold text-gray-800">ABBE Dashboard</span>
           <div className="w-8"></div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-4 mr-0.45">
            <div className="flex flex-col min-h-full gap-8">
                <div className="flex-1">
                    {children}
                </div>
                <div className="shrink-0">
                    <Footer />
                </div>
                <div className="h-2"></div> 
            </div>
        </main>
      </div>
    </div>
  );
}