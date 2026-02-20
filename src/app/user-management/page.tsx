'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Pencil, Trash2, Mail, Building, Briefcase, 
  Plus, X, User, BriefcaseBusiness, ChevronDown, AlertCircle
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form & Error State
  const initialFormState = { 
    firstName: '', 
    middleName: '', 
    lastName: '', 
    email: '', 
    department: '', 
    employmentStatus: 'Regular Employee' 
  };
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const employmentStatuses = [
    'Regular Employee',
    'Project-based Employee',
    'Seasonal Employee',
    'Probationary Employee'
  ];

  // Fetch users and departments
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Helper: Filter only ACTIVE departments for dropdowns
  const activeDepartments = departments.filter((d: any) => d.status === 'Active');
  const uniqueDepartments = ['All', ...Array.from(new Set(activeDepartments.map((d: any) => d.name)))];

  const getCompany = (email: string) => {
    if (email.toLowerCase().includes('bequik')) return 'BEQUIK';
    if (email.toLowerCase().includes('abbeconsult')) return 'ABBE Consult';
    return 'ABBE'; 
  };

  const getEmploymentStatusColor = (status: string) => {
    switch (status) {
      case 'Regular Employee': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Probationary Employee': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Project-based Employee': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Seasonal Employee': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const openAddModal = () => {
    setCurrentUser(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setCurrentUser(user);
    setErrors({});
    
    // Rough name parsing logic
    const nameParts = user.name.split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() : '';
    let middleName = '';
    let firstName = '';

    if (nameParts.length > 1 && nameParts[nameParts.length - 1].endsWith('.')) {
        middleName = nameParts.pop().replace('.', ''); 
    }
    firstName = nameParts.join(' ');

    setFormData({ 
      firstName: firstName || '', 
      middleName: middleName || '', 
      lastName: lastName || '', 
      email: user.email, 
      department: user.department, 
      employmentStatus: user.employmentStatus || 'Regular Employee' 
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async () => {
    // Reset errors
    setErrors({});

    // 1. Validate Email Domain
    const validDomains = [
        '@abbe.com', '@abbe.com.ph', 
        '@bequik.com', '@bequik.com.ph',
        '@abbeconsult.com', '@abbeconsult.com.ph'
    ];
    const email = formData.email.toLowerCase().trim();
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));

    if (!isValidDomain) {
        setErrors({ email: "Invalid domain. Must use an official company email (@abbe, @bequik, or @abbeconsult)." });
        return;
    }

    // 2. Process Middle Initial (M.I.)
    let middleInitial = formData.middleName.trim();
    if (middleInitial) {
        if (!middleInitial.endsWith('.')) {
            middleInitial += '.';
        }
    }

    const fullName = `${formData.firstName} ${middleInitial ? middleInitial + ' ' : ''}${formData.lastName}`;
    
    const userData = {
      name: fullName,
      email: formData.email,
      department: formData.department,
      employmentStatus: formData.employmentStatus
    };

    try {
      if (currentUser) {
        // Update existing user
        const response = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user');
        }
        
        await fetchUsers();
      } else {
        // Create new user
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create user');
        }
        
        await fetchUsers();
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.message || 'Failed to save user. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (currentUser) {
      try {
        const response = await fetch(`/api/users/${currentUser.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Delete failed:', errorData);
          alert(`Failed to delete user: ${errorData.error || 'Unknown error'}`);
          return;
        }
        
        await fetchUsers();
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const company = getCompany(user.email);
    const matchesCompany = filterCompany === 'All' || company === filterCompany;
    const empStatus = user.employmentStatus || 'Regular Employee';
    const matchesStatus = filterStatus === 'All' || empStatus === filterStatus;
    const matchesDepartment = filterDepartment === 'All' || user.department === filterDepartment;

    return matchesSearch && matchesCompany && matchesStatus && matchesDepartment;
  });

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Manage User</h1>
          <p className="text-gray-500 text-sm font-medium">Manage employee accounts and access.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-light transition-all shadow-lg shadow-orange-100 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus size={18} /> 
          <span>Add User</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30">
          
          {/* SEARCH INPUT */}
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-brand/10 transition-all shadow-sm placeholder:text-gray-400"
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

          {/* FILTERS AND COUNT */}
          <div className="flex items-center gap-3">
              
              {/* Company Filter */}
              <div className="relative group">
                <select 
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm min-w-[140px]"
                >
                  <option value="All">All Companies</option>
                  <option value="ABBE">ABBE</option>
                  <option value="BEQUIK">BEQUIK</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Department Filter */}
              <div className="relative group">
                <select 
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm min-w-[150px]"
                >
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Status Filter */}
              <div className="relative group">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm min-w-[140px]"
                >
                  <option value="All">All Status</option>
                  {employmentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Total Count */}
              <div className="flex items-center gap-2">
                 <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</span>
                 <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 shadow-sm">
                   {filteredUsers.length}
                 </span>
              </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-brand rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">Loading employees...</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6">Employee Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Employment Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => {
                const company = getCompany(user.email);
                const empStatus = user.employmentStatus || 'Regular Employee';

                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold border border-orange-100 shadow-sm">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                             <Building size={10} />
                             {user.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <BriefcaseBusiness size={14} className="text-gray-400"/>
                        {company}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getEmploymentStatusColor(empStatus)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                        {empStatus}
                      </span>
                    </td>

                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(user)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-orange-50 hover:text-brand hover:border-orange-200 transition-all shadow-sm active:scale-95 cursor-pointer" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => openDeleteModal(user)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-95 cursor-pointer" title="Remove">
                            <Trash2 size={16} />
                          </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <Briefcase size={48} className="mx-auto mb-3 opacity-20"/>
                    <p className="font-medium">No employees found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT USER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <User size={18} className="text-brand opacity-80" />
                {currentUser ? 'Edit User' : 'Add User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
                    <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all" placeholder="John" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">M.I. (Optional)</label>
                    <input type="text" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all" placeholder="M" maxLength={3} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => {
                        setFormData({...formData, email: e.target.value});
                        setErrors({}); // Clear error on type
                      }} 
                      className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.email 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50' 
                          : 'border-gray-200 focus:ring-brand/20 focus:bg-white'
                      }`} 
                      placeholder="employee@abbe.com" 
                    />
                </div>
                
                {/* Error Message UI */}
                {errors.email ? (
                    <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={12} />
                        {errors.email}
                    </div>
                ) : (
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">* Allowed: @abbe, @bequik, @abbeconsult (and .ph variants)</p>
                )}
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                  <div className="relative">
                    <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all cursor-pointer appearance-none">
                        <option value="">Select Department</option>
                        {activeDepartments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employment Status</label>
                <div className="relative">
                    <select value={formData.employmentStatus} onChange={e => setFormData({...formData, employmentStatus: e.target.value})} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all cursor-pointer appearance-none">
                        {employmentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 text-white font-bold bg-brand hover:bg-brand-light rounded-xl shadow-lg shadow-orange-100 transition-all text-sm transform hover:-translate-y-0.5">
                {currentUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className="p-6 flex flex-col items-center text-center gap-4 bg-red-50/50">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm bg-red-100 text-red-600"><Trash2 size={32} /></div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">Delete User?</h3>
                      <p className="text-sm text-gray-500 mt-1 px-4">Are you sure you want to delete <strong>{currentUser?.name}</strong>? This action cannot be undone.</p>
                  </div>
              </div>
              <div className="p-6 flex gap-3">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 bg-red-500 hover:bg-red-600 shadow-red-200">Delete</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}