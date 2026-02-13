'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { 
  Search, Filter, CheckCircle, XCircle, Clock, 
  Calendar, Briefcase, FileText, ChevronDown, X, Eye, ArrowUpDown
} from 'lucide-react';

type CategoryType = 'all' | 'leave' | 'overtime' | 'official-business';
type StatusType = 'all' | 'Pending' | 'Approved' | 'Declined';

export default function ApprovalsPage() {
  const { timeOffRequests, updateTimeOffStatus } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState('Newest');

  // Mock data for overtime and official business (you can expand this later)
  const overtimeRequests = [
    { id: 'ot1', user: 'Roger Jr. Dumaguit', avatar: 'RD', role: 'Developer', submitted: '2026-02-10', date: '2026-02-15', startTime: '18:00', endTime: '22:00', hours: '4', status: 'Pending', reason: 'Project deadline', approvalType: 'pre' },
    { id: 'ot2', user: 'Mike Johnson', avatar: 'MJ', role: 'Developer', submitted: '2026-02-08', date: '2026-02-12', startTime: '17:00', endTime: '20:00', hours: '3', status: 'Approved', reason: 'Bug fixes', approvalType: 'post' },
    { id: 'ot3', user: 'Emily White', avatar: 'EW', role: 'Developer', submitted: '2026-02-11', date: '2026-02-16', startTime: '19:00', endTime: '23:00', hours: '4', status: 'Pending', reason: 'Feature development', approvalType: 'pre' },
    { id: 'ot4', user: 'Christopher Martinez', avatar: 'CM', role: 'Developer', submitted: '2026-02-09', date: '2026-02-13', startTime: '18:00', endTime: '21:00', hours: '3', status: 'Approved', reason: 'Production issue', approvalType: 'post' },
  ];

  const officialBusinessRequests = [
    { id: 'ob1', user: 'Jomel Dela Cruz', avatar: 'JD', role: 'Designer', submitted: '2026-02-09', startDate: '2026-02-20', endDate: '2026-02-22', destination: 'Client Office - Cebu', status: 'Pending', purpose: 'Client presentation and workshop' },
    { id: 'ob2', user: 'David Brown', avatar: 'DB', role: 'QA', submitted: '2026-02-07', startDate: '2026-02-14', endDate: '2026-02-16', destination: 'BGC Training Center', status: 'Approved', purpose: 'QA certification training' },
    { id: 'ob3', user: 'Alice Chen', avatar: 'AC', role: 'Admin Managers', submitted: '2026-02-11', startDate: '2026-02-24', endDate: '2026-02-25', destination: 'Makati Head Office', status: 'Pending', purpose: 'Management conference' },
  ];

  // Combine all requests
  const allRequests = [
    ...timeOffRequests.map(r => ({ ...r, category: 'leave' as const })),
    ...overtimeRequests.map(r => ({ ...r, category: 'overtime' as const })),
    ...officialBusinessRequests.map(r => ({ ...r, category: 'official-business' as const })),
  ];

  // Filter logic
  const filteredRequests = allRequests.filter(req => {
    const matchesSearch = req.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || req.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortOrder === 'Newest') return new Date(b.submitted).getTime() - new Date(a.submitted).getTime();
    if (sortOrder === 'Oldest') return new Date(a.submitted).getTime() - new Date(b.submitted).getTime();
    return 0;
  });

  const pendingCount = allRequests.filter(r => r.status === 'Pending').length;

  const handleApprove = (id: string, category: string) => {
    if (category === 'leave') {
      updateTimeOffStatus(id, 'Approved');
    }
    // Add logic for overtime and official business later
  };

  const handleDecline = (id: string, category: string) => {
    if (category === 'leave') {
      updateTimeOffStatus(id, 'Declined');
    }
    // Add logic for overtime and official business later
  };

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setViewingRequest(null);
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Approvals</h1>
          <p className="text-gray-500 text-sm font-medium">Review and approve leave, overtime, and official business requests.</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedCategory('all')}
          className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
            selectedCategory === 'all' ? 'border-brand shadow-md' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <FileText className="text-purple-600" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{allRequests.length}</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">All Requests</p>
        </div>

        <div 
          onClick={() => setSelectedCategory('leave')}
          className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
            selectedCategory === 'leave' ? 'border-brand shadow-md' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{timeOffRequests.length}</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave</p>
        </div>

        <div 
          onClick={() => setSelectedCategory('overtime')}
          className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
            selectedCategory === 'overtime' ? 'border-brand shadow-md' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Clock className="text-orange-600" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{overtimeRequests.length}</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overtime</p>
        </div>

        <div 
          onClick={() => setSelectedCategory('official-business')}
          className={`bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
            selectedCategory === 'official-business' ? 'border-brand shadow-md' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Briefcase className="text-green-600" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{officialBusinessRequests.length}</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Official Business</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* CONTROLS */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-brand/10 transition-all shadow-sm placeholder:text-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full text-gray-500 hover:text-gray-700"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl">
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Pending</span>
              <span className="bg-orange-100 text-brand px-2.5 py-0.5 rounded-full text-xs font-bold">
                {pendingCount}
              </span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Filter size={16} />
                <span>Status</span>
                <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                  {(['all', 'Pending', 'Approved', 'Declined'] as StatusType[]).map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                        selectedStatus === status ? 'bg-orange-50 text-brand font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {status === 'all' ? 'All Status' : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative group">
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">Category</th>
                <th className="p-4">Details</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold border border-purple-100 shadow-sm">
                        {request.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{request.user}</p>
                        <p className="text-xs text-gray-500">{request.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                      request.category === 'leave' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      request.category === 'overtime' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {request.category === 'leave' && <Calendar size={12} />}
                      {request.category === 'overtime' && <Clock size={12} />}
                      {request.category === 'official-business' && <Briefcase size={12} />}
                      {request.category === 'leave' ? 'Leave' : 
                       request.category === 'overtime' ? 'Overtime' : 'Official Business'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {request.category === 'leave' && (
                        <>
                          <p className="font-semibold text-gray-800">{(request as any).type}</p>
                          <p className="text-xs text-gray-500">
                            {(request as any).endDate && (request as any).leaveDate !== (request as any).endDate
                              ? `${(request as any).leaveDate} to ${(request as any).endDate}`
                              : (request as any).leaveDate}
                          </p>
                          <p className="text-xs text-gray-600 font-semibold mt-1">
                            {(request as any).isHalfDay ? 'Half Day' : (request as any).duration}
                          </p>
                        </>
                      )}
                      {request.category === 'overtime' && (
                        <>
                          <p className="font-semibold text-gray-800">{(request as any).date}</p>
                          <p className="text-xs text-gray-500">{(request as any).startTime} - {(request as any).endTime}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-600 font-semibold">{(request as any).hours} hours</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              (request as any).approvalType === 'pre' 
                                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                                : 'bg-purple-50 text-purple-600 border border-purple-200'
                            }`}>
                              {(request as any).approvalType === 'pre' ? 'Pre-Approval' : 'Post-Approval'}
                            </span>
                          </div>
                        </>
                      )}
                      {request.category === 'official-business' && (
                        <>
                          <p className="font-semibold text-gray-800">{(request as any).destination}</p>
                          <p className="text-xs text-gray-500">
                            {(request as any).startDate === (request as any).endDate 
                              ? (request as any).startDate 
                              : `${(request as any).startDate} to ${(request as any).endDate}`}
                          </p>
                          <p className="text-xs text-gray-600 font-semibold mt-1">
                            {(() => {
                              const start = new Date((request as any).startDate);
                              const end = new Date((request as any).endDate);
                              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                              return `${days} ${days === 1 ? 'Day' : 'Days'}`;
                            })()}
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-600">{request.submitted}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      request.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                      request.status === 'Approved' ? 'bg-green-50 text-green-600 border border-green-200' :
                      'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    {request.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewingRequest(request)}
                          className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleApprove(request.id, request.category)}
                          className="p-2 bg-white border border-gray-200 text-green-600 rounded-lg hover:bg-green-50 hover:border-green-200 transition-all shadow-sm active:scale-95"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleDecline(request.id, request.category)}
                          className="p-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
                          title="Decline"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setViewingRequest(request)}
                        className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-20"/>
                    <p>No requests found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <button 
                onClick={() => setViewingRequest(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
              >
                <X size={20}/>
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  {viewingRequest.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">{viewingRequest.user}</h3>
                  <p className="text-sm text-gray-500 mt-1">{viewingRequest.role}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      {viewingRequest.category === 'leave' && <Calendar size={12} />}
                      {viewingRequest.category === 'overtime' && <Clock size={12} />}
                      {viewingRequest.category === 'official-business' && <Briefcase size={12} />}
                      {viewingRequest.category === 'leave' ? 'Leave Request' : 
                       viewingRequest.category === 'overtime' ? 'Overtime Request' : 'Official Business'}
                    </span>
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold ${
                      viewingRequest.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      viewingRequest.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {viewingRequest.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Submitted Date</p>
                    <div className="flex items-center gap-2 text-gray-800">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-semibold">{viewingRequest.submitted}</span>
                    </div>
                  </div>

                  {viewingRequest.category === 'leave' && (
                    <>
                      <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Leave Type</p>
                        <p className="text-lg font-bold text-gray-800">{viewingRequest.type}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Duration</p>
                        <p className="text-lg font-bold text-gray-800">
                          {viewingRequest.isHalfDay ? 'Half Day' : viewingRequest.duration}
                        </p>
                      </div>
                    </>
                  )}

                  {viewingRequest.category === 'overtime' && (
                    <>
                      <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Overtime Date</p>
                        <p className="text-lg font-bold text-gray-800">{viewingRequest.date}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Hours</p>
                        <p className="text-lg font-bold text-gray-800">{viewingRequest.hours} hours</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Approval Type</p>
                        <span className={`inline-flex text-sm font-bold px-3 py-1.5 rounded-lg ${
                          viewingRequest.approvalType === 'pre' 
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                            : 'bg-purple-50 text-purple-600 border border-purple-200'
                        }`}>
                          {viewingRequest.approvalType === 'pre' ? 'Pre-Approval' : 'Post-Approval'}
                        </span>
                      </div>
                    </>
                  )}

                  {viewingRequest.category === 'official-business' && (
                    <>
                      <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Destination</p>
                        <p className="text-lg font-bold text-gray-800">{viewingRequest.destination}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Purpose</p>
                        <p className="text-sm text-gray-700">{viewingRequest.purpose}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {viewingRequest.category === 'leave' && (
                    <>
                      {viewingRequest.endDate && viewingRequest.leaveDate !== viewingRequest.endDate ? (
                        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-5 text-white shadow-lg">
                          <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-90">Leave Period</p>
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-xs opacity-75 mb-1">From</p>
                              <p className="text-lg font-bold">{viewingRequest.leaveDate.split('-')[2]}</p>
                              <p className="text-xs opacity-75">{new Date(viewingRequest.leaveDate).toLocaleDateString('en-US', { month: 'short' })}</p>
                            </div>
                            <div className="text-2xl opacity-50">→</div>
                            <div className="text-center">
                              <p className="text-xs opacity-75 mb-1">To</p>
                              <p className="text-lg font-bold">{viewingRequest.endDate.split('-')[2]}</p>
                              <p className="text-xs opacity-75">{new Date(viewingRequest.endDate).toLocaleDateString('en-US', { month: 'short' })}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-5 text-white shadow-lg">
                          <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-90">Leave Date</p>
                          <div className="text-center">
                            <p className="text-4xl font-bold">{viewingRequest.leaveDate.split('-')[2]}</p>
                            <p className="text-sm opacity-90 mt-2">
                              {new Date(viewingRequest.leaveDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {viewingRequest.category === 'overtime' && (
                    <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-5 text-white shadow-lg">
                      <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-90">Time Range</p>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-xs opacity-75 mb-1">Start</p>
                          <p className="text-2xl font-bold">{viewingRequest.startTime}</p>
                        </div>
                        <div className="text-2xl opacity-50">→</div>
                        <div className="text-center">
                          <p className="text-xs opacity-75 mb-1">End</p>
                          <p className="text-2xl font-bold">{viewingRequest.endTime}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewingRequest.category === 'official-business' && (
                    <>
                      {viewingRequest.startDate !== viewingRequest.endDate ? (
                        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-5 text-white shadow-lg">
                          <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-90">Travel Period</p>
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-xs opacity-75 mb-1">From</p>
                              <p className="text-lg font-bold">{viewingRequest.startDate.split('-')[2]}</p>
                              <p className="text-xs opacity-75">{new Date(viewingRequest.startDate).toLocaleDateString('en-US', { month: 'short' })}</p>
                            </div>
                            <div className="text-2xl opacity-50">→</div>
                            <div className="text-center">
                              <p className="text-xs opacity-75 mb-1">To</p>
                              <p className="text-lg font-bold">{viewingRequest.endDate.split('-')[2]}</p>
                              <p className="text-xs opacity-75">{new Date(viewingRequest.endDate).toLocaleDateString('en-US', { month: 'short' })}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-5 text-white shadow-lg">
                          <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-90">Travel Date</p>
                          <div className="text-center">
                            <p className="text-4xl font-bold">{viewingRequest.startDate.split('-')[2]}</p>
                            <p className="text-sm opacity-90 mt-2">
                              {new Date(viewingRequest.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Message/Reason */}
                  {(viewingRequest.message || viewingRequest.reason || viewingRequest.purpose) && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {viewingRequest.category === 'leave' ? 'Message' : 
                         viewingRequest.category === 'overtime' ? 'Reason' : 'Details'}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        "{viewingRequest.message || viewingRequest.reason || viewingRequest.purpose}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {viewingRequest.status === 'Pending' && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => {
                    handleDecline(viewingRequest.id, viewingRequest.category);
                    setViewingRequest(null);
                  }}
                  className="flex-1 py-3.5 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Decline
                </button>
                <button 
                  onClick={() => {
                    handleApprove(viewingRequest.id, viewingRequest.category);
                    setViewingRequest(null);
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Approve Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
