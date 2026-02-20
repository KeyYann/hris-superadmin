'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, ChevronDown, Eye, Trash2, 
  Calendar, Check, X, ArrowUpDown, MoreHorizontal, 
  Clock, Users, FileText, AlertTriangle, File, BriefcaseBusiness
} from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, isWithinInterval, parseISO, format, isSameDay, addDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function TimeOffPage() {
  const { user } = useAuth();
  const [timeOffRequests, setTimeOffRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  
  // Export States
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [viewRequest, setViewRequest] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch time-off requests
  useEffect(() => {
    if (user?.id) {
      fetchTimeOffRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, user?.departmentId]);

  const fetchTimeOffRequests = async () => {
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
      
      const response = await fetch(`/api/time-off?${params.toString()}`);
      
      if (!response.ok) {
        console.error('Time-off API error:', response.status);
        setTimeOffRequests([]);
        return;
      }
      
      const data = await response.json();
      setTimeOffRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching time-off requests:', error);
      setTimeOffRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompany = (email: string) => {
    if (email.toLowerCase().includes('@bequik')) {
      return 'BEQUIK';
    }
    return 'ABBE';
  };

  const filteredData = timeOffRequests.filter(item => {
    const matchesSearch = item.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesType = typeFilter === 'All' || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    if (sortOrder === 'Newest') return new Date(b.submitted).getTime() - new Date(a.submitted).getTime();
    if (sortOrder === 'Oldest') return new Date(a.submitted).getTime() - new Date(b.submitted).getTime();
    return 0; 
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Calculate pending count
  const pendingTimeOffCount = timeOffRequests.filter(req => req.status === 'Pending').length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, sortOrder]);

  // --- LOGIC: ON LEAVE TODAY COUNT ---
  const getOnLeaveCount = () => {
    const today = new Date();
    // Filter for approved requests where TODAY falls within the leave period
    return timeOffRequests.filter(req => {
        if (req.status !== 'Approved') return false;
        
        const startDate = parseISO(req.leaveDate);
        // Duration is already a number from the API
        const duration = typeof req.duration === 'number' ? req.duration : parseFloat(req.duration) || 1;
        
        // If duration is less than 1 (e.g., half day), treat as single day check
        if (duration < 1) {
            return isSameDay(today, startDate);
        }

        // Create end date based on duration
        const endDate = addDays(startDate, Math.ceil(duration) - 1); // -1 because start date counts as day 1
        
        // Check if today is within start and end date (inclusive)
        return isWithinInterval(today, { start: startDate, end: endDate });
    }).length;
  };

  const onLeaveCount = getOnLeaveCount();
  const totalCount = timeOffRequests.length;

  // --- EXPORT LOGIC ---
  const handleExportOptionClick = (option: string) => {
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (option === 'custom') {
        setIsExportOpen(false);
        setIsCustomExportModalOpen(true);
        return;
    }

    switch (option) {
        case 'week':
            startDate = startOfWeek(today);
            endDate = endOfWeek(today);
            break;
        case 'month':
            startDate = startOfMonth(today);
            endDate = endOfMonth(today);
            break;
        case '3months':
            startDate = subMonths(today, 3);
            endDate = today;
            break;
        case '6months':
            startDate = subMonths(today, 6);
            endDate = today;
            break;
        case 'year':
            startDate = startOfYear(today);
            endDate = endOfYear(today);
            break;
    }

    if (startDate && endDate) {
        performExport(startDate, endDate, option);
    }
    setIsExportOpen(false);
  };

  const performExport = (startDate: Date, endDate: Date, label: string) => {
    const dataToExport = timeOffRequests.filter(item => {
        const itemDate = parseISO(item.leaveDate);
        return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });

    if (dataToExport.length === 0) {
        alert(`No records found for the selected range (${label}).`);
        return;
    }

    const headers = ["Request Number", "User", "Company", "Role", "Leave Type", "Status", "Duration", "Is Half Day", "Leave Date", "Submitted Date", "Message"];
    const csvRows = [headers.join(",")];

    for (const row of dataToExport) {
        const company = getCompany(row.email);
        const cleanMessage = row.message ? `"${row.message.replace(/"/g, '""')}"` : "";
        const cleanUser = `"${row.user}"`;

        const values = [
            row.requestNumber || 'N/A', cleanUser, company, row.role, row.type, row.status, 
            row.isHalfDay ? "Half Day" : `${row.duration} ${row.duration === 1 ? 'Day' : 'Days'}`,
            row.isHalfDay ? "Yes" : "No", row.leaveDate, row.submitted, cleanMessage
        ];
        csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `time_off_export_${label}_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/time-off?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchTimeOffRequests(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }

    if (viewRequest && viewRequest.id === id) {
      setViewRequest(null);
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const response = await fetch(`/api/time-off?id=${deleteId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchTimeOffRequests(); // Refresh data
        }
      } catch (error) {
        console.error('Error deleting request:', error);
      } finally {
        setDeleteId(null);
      }
    }
  };

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setViewRequest(null);
        setDeleteId(null);
        setIsCustomExportModalOpen(false);
        setIsExportOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* HEADER CARD */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-8 items-start xl:items-center shrink-0">
        <div className="min-w-[200px]">
          <h1 className="text-2xl font-bold text-gray-800">Time Off</h1>
          <p className="text-gray-500 text-sm mt-1">Manage leave requests.</p>
        </div>

        <div className="flex-1 w-full xl:w-auto grid grid-cols-3 gap-4 border-l border-r border-gray-100 px-0 xl:px-8">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Clock size={20} /></div>
                <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending</p><p className="text-xl font-bold text-gray-800">{pendingTimeOffCount}</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">On Leave Today</p><p className="text-xl font-bold text-gray-800">{onLeaveCount}</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><FileText size={20} /></div>
                <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</p><p className="text-xl font-bold text-gray-800">{totalCount}</p></div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full xl:w-auto">
           {/* Export Dropdown */}
           <div className="relative">
               <button 
                 onClick={() => setIsExportOpen(!isExportOpen)} 
                 className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-light transition-all shadow-lg shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer w-full sm:w-auto"
               >
                 <Download size={14} /> Export <ChevronDown size={14} />
               </button>
               
               {isExportOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="p-2 flex flex-col gap-1">
                        <button onClick={() => handleExportOptionClick('week')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand rounded-lg transition-colors font-medium">This Week</button>
                        <button onClick={() => handleExportOptionClick('month')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand rounded-lg transition-colors font-medium">This Month</button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={() => handleExportOptionClick('3months')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand rounded-lg transition-colors font-medium">Last 3 Months</button>
                        <button onClick={() => handleExportOptionClick('6months')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand rounded-lg transition-colors font-medium">Last 6 Months</button>
                        <button onClick={() => handleExportOptionClick('year')} className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand rounded-lg transition-colors font-medium">This Year</button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={() => handleExportOptionClick('custom')} className="text-left px-4 py-2 text-sm text-brand hover:bg-orange-50 rounded-lg transition-colors font-bold flex items-center justify-between">
                            Custom Range
                        </button>
                    </div>
                 </div>
               )}
           </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-0">
        
        {/* Controls Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-50/30 shrink-0">
          
          {/* SEARCH with CLEAR BUTTON */}
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm" 
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative group">
               <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm min-w-[140px]">
                 <option value="All">All Status</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Declined">Declined</option>
               </select>
               <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
            <div className="relative group">
               <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm min-w-[160px]">
                 <option value="All">All Types</option><option value="Vacation Leave">Vacation Leave</option><option value="Sick Leave">Sick Leave</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
            <div className="relative group">
               <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm">
                 <option value="Newest">Newest First</option><option value="Oldest">Oldest First</option>
               </select>
               <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 bg-gray-50 pl-6">Request #</th>
                <th className="p-4 bg-gray-50">User</th>
                <th className="p-4 bg-gray-50">Company</th>
                <th className="p-4 bg-gray-50">Submitted</th>
                <th className="p-4 bg-gray-50">Leave Date</th>
                <th className="p-4 bg-gray-50">Type</th>
                <th className="p-4 bg-gray-50">Duration</th>
                <th className="p-4 bg-gray-50">Status</th>
                <th className="p-4 text-right bg-gray-50 pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-brand rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500 font-medium">Loading requests...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-400">No requests found.</td></tr>
              ) : (
                paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6 text-sm font-medium text-gray-600">{row.requestNumber}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{row.avatar}</div>
                      <div><p className="text-sm font-bold text-gray-800">{row.user}</p><p className="text-xs text-gray-500">{row.role}</p></div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <BriefcaseBusiness size={14} className="text-gray-400"/>
                        {getCompany(row.email)}
                    </div>
                  </td>

                  <td className="p-4 text-sm text-gray-600">{row.submitted}</td>
                  <td className="p-4 text-sm font-semibold text-gray-800">{row.leaveDate}</td>
                  <td className="p-4"><span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">{row.type}</span></td>
                  
                  <td className="p-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {row.isHalfDay ? "Half Day" : `${row.duration} ${row.duration === 1 ? 'Day' : 'Days'}`}
                    </span>
                  </td>

                  <td className="p-4"><StatusBadge status={row.status} /></td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewRequest(row)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors tooltip cursor-pointer" title="View Details"><Eye size={16} /></button>
                        <button onClick={() => setDeleteId(row.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors tooltip cursor-pointer" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30 shrink-0">
           <p className="text-xs text-gray-500">
             Showing <span className="font-bold">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="font-bold">{filteredData.length}</span> entries
           </p>
           <div className="flex gap-2">
             <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Prev</button>
             <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-bold text-gray-700">Page {currentPage}</span>
                <span className="text-xs text-gray-400">/ {totalPages || 1}</span>
             </div>
             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {viewRequest && (
        <LeaveDetailModal 
          request={viewRequest} 
          onClose={() => setViewRequest(null)}
          onApprove={() => handleStatusChange(viewRequest.id, 'Approved')}
          onDecline={() => handleStatusChange(viewRequest.id, 'Declined')}
        />
      )}

      {isCustomExportModalOpen && (
        <CustomExportModal 
            isOpen={isCustomExportModalOpen}
            onClose={() => setIsCustomExportModalOpen(false)}
            onExport={(start, end) => performExport(parseISO(start), parseISO(end), 'custom_range')}
        />
      )}

      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Request?"
        message="This action cannot be undone. Are you sure you want to remove this leave request?"
        confirmText="Delete"
      />
    </div>
  );
}

// --- NEW COMPONENT: CUSTOM EXPORT MODAL ---
function CustomExportModal({ isOpen, onClose, onExport }: { isOpen: boolean, onClose: () => void, onExport: (s: string, e: string) => void }) {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Calendar size={18} className="text-brand" />
                        Custom Date Range
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
                    <button onClick={onClose} className="flex-1 py-2.5 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm">Cancel</button>
                    <button 
                        onClick={() => {
                            if(start && end) {
                                onExport(start, end);
                                onClose();
                            } else {
                                alert("Please select both dates.");
                            }
                        }} 
                        disabled={!start || !end}
                        className="flex-1 py-2.5 text-white font-bold bg-brand hover:bg-brand-light rounded-xl shadow-lg shadow-orange-100 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>
        </div>
    );
}

// ... (Other Sub-components: LeaveDetailModal, ConfirmationModal, StatusBadge remain same)
function LeaveDetailModal({ request, onClose, onApprove, onDecline }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-brand shadow-sm">{request.avatar}</div>
             <div><h2 className="text-xl font-bold text-gray-800">{request.user}</h2><p className="text-sm text-gray-500">{request.role}</p></div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
           {request.isHalfDay && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                    <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-orange-700">Half Day Request</p>
                        <p className="text-xs text-orange-600">This request will deduct 0.5 days from the employee's leave balance.</p>
                    </div>
                </div>
           )}

           <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Leave Type</p><div className="flex items-center gap-2 text-gray-800 font-semibold"><File size={16} className="text-brand"/> {request.type}</div></div>
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</p><div className="flex items-center gap-2 text-gray-800 font-semibold"><Clock size={16} className="text-brand"/> {request.isHalfDay ? "Half Day" : `${request.duration} ${request.duration === 1 ? 'Day' : 'Days'}`}</div></div>
           </div>
           <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requested Date</p><div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl text-gray-700 bg-white shadow-sm"><Calendar size={18} className="text-gray-400"/><span className="font-medium">{request.leaveDate}</span></div></div>
           <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reason / Message</p><div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100 italic">"{request.message || "No message provided."}"</div></div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
           {request.status === 'Pending' ? (
             <>
               <button onClick={onDecline} className="flex-1 py-3 text-red-600 font-bold bg-red-50 border border-red-100 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2"><X size={18} /> Decline</button>
               <button onClick={onApprove} className="flex-1 py-3 text-white font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 rounded-xl transition-all flex items-center justify-center gap-2"><Check size={18} /> Approve Request</button>
             </>
           ) : (
             <div className="w-full text-center py-2 text-gray-400 font-medium bg-gray-100 rounded-xl">Request is already {request.status}</div>
           )}
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
          <div className="p-6 flex flex-col items-center text-center gap-4 bg-red-50/50">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm bg-red-100 text-red-600"><AlertTriangle size={32} /></div>
              <div><h3 className="text-xl font-bold text-gray-800">{title}</h3><p className="text-sm text-gray-500 mt-1 px-4">{message}</p></div>
          </div>
          <div className="p-6 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 text-gray-600 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={onConfirm} className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 bg-red-500 hover:bg-red-600 shadow-red-200">{confirmText}</button>
          </div>
       </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = { Approved: "bg-emerald-100 text-emerald-700 border-emerald-200", Pending: "bg-amber-100 text-amber-700 border-amber-200", Declined: "bg-red-100 text-red-700 border-red-200" };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>{status === 'Approved' ? <Check size={12}/> : status === 'Declined' ? <X size={12}/> : <MoreHorizontal size={12}/>} {status}</span>;
}