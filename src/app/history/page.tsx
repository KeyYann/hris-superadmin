'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext'; 
import { 
  Search, Filter, ChevronDown, ArrowUpDown, History, FileText, Calendar
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const { timeOffRequests } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');

  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = timeOffRequests.filter(item => {
    const matchesSearch = item.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || item.type === typeFilter;

    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortOrder === 'Newest') return new Date(b.submitted).getTime() - new Date(a.submitted).getTime();
    if (sortOrder === 'Oldest') return new Date(a.submitted).getTime() - new Date(b.submitted).getTime();
    return 0; 
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, sortOrder]);

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* --- HEADER CARD --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">History Logs</h1>
          <p className="text-gray-500 text-sm font-medium">View the history of all leave applications and requests.</p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by user or type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-brand/10 transition-all shadow-sm placeholder:text-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative group">
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)} 
                  className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm min-w-[160px]"
                >
                  <option value="All">All Types</option>
                  <option value="Vacation Leave">Vacation Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
             </div>

             <div className="relative group">
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)} 
                  className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-6 w-1/6">Type</th>
                <th className="p-4 w-1/5">User</th>
                <th className="p-4 w-1/2">Description</th>
                <th className="p-4 text-right pr-6">Date Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedData.map((log) => {
                  // UPDATED LOGIC: If isHalfDay is true, ignore duration string and just say "Half Day"
                  const durationText = log.isHalfDay ? "Half Day" : log.duration;
                  const desc = `Filed a ${log.type} with leave date: ${log.leaveDate} (${durationText})`;

                  return (
                   <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                     <td className="p-4 pl-6 align-top">
                       <span className="font-bold text-gray-700 text-sm">Leave Application</span>
                     </td>
                     <td className="p-4 align-top">
                       <div className="text-sm font-medium text-gray-600">{log.user}</div>
                     </td>
                     <td className="p-4 align-top">
                       <p className="text-sm text-gray-600 leading-snug">{desc}</p>
                     </td>
                     <td className="p-4 text-right pr-6 align-top">
                       <span className="text-sm font-medium text-gray-500">{log.submitted}</span>
                     </td>
                   </tr>
                  );
              })}
              
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400">
                    <History size={48} className="mx-auto mb-3 opacity-20"/>
                    <p className="font-medium">No history logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30 shrink-0">
           <p className="text-xs text-gray-500">
             Showing <span className="font-bold">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="font-bold">{filteredData.length}</span> entries
           </p>
           <div className="flex gap-2">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="px-3 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               Prev
             </button>
             <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-bold text-gray-700">Page {currentPage}</span>
                <span className="text-xs text-gray-400">/ {totalPages || 1}</span>
             </div>
             <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages || totalPages === 0}
               className="px-3 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               Next
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}