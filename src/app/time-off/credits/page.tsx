'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext'; 
import { 
  Search, ChevronRight, Building, Mail, 
  ArrowLeft, Edit, Save, Filter, BriefcaseBusiness, User, Shield
} from 'lucide-react';

export default function ManageCreditsPage() {
  // 1. Get credit helpers from Context
  const { users, getUserCredits, updateUserCredits } = useNotifications(); 
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [localCredits, setLocalCredits] = useState<any[]>([]);

  // 2. Sync local credits when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const userCredits = getUserCredits(selectedUser.id);
      setLocalCredits(userCredits);
    }
  }, [selectedUser, getUserCredits]);

  const departments = ['All', ...Array.from(new Set(users.map(u => u.department)))];

  // Helper: Get Company
  const getCompany = (email: string) => {
    return email.toLowerCase().includes('@bequik') ? 'BEQUIK' : 'ABBE';
  };

  // Helper: Check if Admin
  const isAdmin = (role: string) => role.toLowerCase().includes('admin');

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const userCompany = getCompany(user.email);
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = departmentFilter === 'All' || user.department === departmentFilter;
    const matchesCompany = companyFilter === 'All' || userCompany === companyFilter;

    return matchesSearch && matchesDept && matchesCompany;
  });

  // 3. Handle Input Changes in the Table
  const handleCreditChange = (index: number, field: 'entitled' | 'balance', value: string) => {
    const updatedCredits = [...localCredits];
    updatedCredits[index] = { 
      ...updatedCredits[index], 
      [field]: parseFloat(value) || 0 
    };
    setLocalCredits(updatedCredits);
  };

  // 4. Handle Save Action
  const handleToggleEdit = () => {
    if (isEditing) {
      if (selectedUser) {
        updateUserCredits(selectedUser.id, localCredits);
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-6">
      
      {/* --- HEADER --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Credits</h1>
          <p className="text-gray-500 text-sm mt-1">View and adjust employee leave balances.</p>
        </div>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col">
        
        {!selectedUser ? (
          /* STATE 1: SEARCH & SELECT USER */
          <div className="flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col xl:flex-row gap-4">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search employee by name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-4 w-full xl:w-auto">
                {/* Department Filter */}
                <div className="relative group flex-1 xl:w-56">
                    <select 
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                    >
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                    ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Company Filter */}
                <div className="relative group flex-1 xl:w-48">
                    <select 
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                    >
                        <option value="All">All Companies</option>
                        <option value="ABBE">ABBE</option>
                        <option value="BEQUIK">BEQUIK</option>
                    </select>
                    <BriefcaseBusiness className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map((user) => {
                  const company = getCompany(user.email);
                  
                  return (
                    <button 
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-brand/30 hover:shadow-md hover:bg-orange-50/10 transition-all text-left group relative overflow-hidden"
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-lg border border-gray-200 group-hover:border-brand/20 group-hover:text-brand transition-colors overflow-hidden shrink-0">
                        {user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-bold text-gray-800 truncate group-hover:text-brand transition-colors">{user.name}</h3>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border mt-1 ${company === 'ABBE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                    {company}
                                </span>
                            </div>
                            
                            {/* CONDITIONAL DISPLAY: Role for Admins, Department for Users */}
                            {isAdmin(user.role) ? (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Shield size={12} className="text-brand"/> {user.role}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Building size={12} /> {user.department}
                                </p>
                            )}
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-brand group-hover:translate-x-1 transition-all" size={20} />
                    </button>
                  );
                })}
                
                {filteredUsers.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400">
                    <User size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No employees found matching filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* STATE 2: EMPLOYEE DETAILS & CREDITS */
          <div className="flex flex-col">
            
            {/* Back Toolbar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4 sticky top-0 z-10 backdrop-blur-md">
              <button 
                onClick={() => { setSelectedUser(null); setIsEditing(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
              >
                <ArrowLeft size={16} /> Back to List
              </button>
            </div>

            <div className="p-6 md:p-10">
              <div className="max-w-6xl mx-auto flex flex-col gap-8">
                
                {/* Employee Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8 bg-white border border-gray-200 rounded-3xl shadow-sm text-center sm:text-left">
                  <div className="w-24 h-24 rounded-full bg-brand text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-orange-100 shrink-0 overflow-hidden border-4 border-white ring-1 ring-gray-100">
                    {selectedUser.avatar}
                  </div>
                  
                  <div className="flex-1 mt-2">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedUser.name}</h2>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold border mt-1 ${getCompany(selectedUser.email) === 'ABBE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            {getCompany(selectedUser.email)}
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3 text-sm font-medium text-gray-500">
                      
                      {/* CONDITIONAL DISPLAY IN HEADER */}
                      {isAdmin(selectedUser.role) ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <Shield size={14} className="text-brand"/> {selectedUser.role}
                          </span>
                      ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <Building size={14} className="text-brand"/> {selectedUser.department}
                          </span>
                      )}

                      <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <Mail size={14} className="text-brand"/> {selectedUser.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Credits Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-gray-100 gap-4 bg-gray-50/30">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">Leave Credits</h3>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button 
                        onClick={handleToggleEdit}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap min-w-[140px]
                            ${isEditing ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}
                        `}
                      >
                        {isEditing ? <Save size={16} /> : <Edit size={16} />} 
                        {isEditing ? 'Save Changes' : 'Edit Credits'}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-sm font-bold text-gray-900 bg-gray-50/50">
                          <th className="p-5 pl-8 w-1/2">Leave Type</th>
                          <th className="p-5 w-1/4">Entitled</th>
                          <th className="p-5 w-1/4">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {localCredits.map((credit: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-5 pl-8 font-medium text-gray-900">{credit.type}</td>
                            <td className="p-5">
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  value={credit.entitled}
                                  onChange={(e) => handleCreditChange(index, 'entitled', e.target.value)}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-gray-900 shadow-sm"
                                />
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 rounded-lg font-semibold text-gray-600 border border-gray-200">
                                  {credit.entitled}
                                </span>
                              )}
                            </td>
                            <td className="p-5">
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  value={credit.balance}
                                  onChange={(e) => handleCreditChange(index, 'balance', e.target.value)}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-gray-900 shadow-sm"
                                />
                              ) : (
                                <span className={`px-3 py-1 rounded-lg font-bold border ${credit.balance > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                  {Number(credit.balance).toFixed(1)}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}