'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Plus, Pencil, Trash2, Shield, 
  X, AlertTriangle, UserCog, Mail, Lock, User, ChevronDown, Check, AlertCircle, Loader2
} from 'lucide-react';

export default function ManageAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [eligibleEmployees, setEligibleEmployees] = useState<any[]>([]);
  const [adminRoleObjects, setAdminRoleObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null); 

  // Custom Dropdown State
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form & Error State
  const initialFormState = { id: '', name: '', email: '', role: '', roleId: '', password: '', confirmPassword: '' };
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ role?: string; password?: string; user?: string }>({});

  // Fetch data on mount
  useEffect(() => {
    fetchAdmins();
    fetchEligibleData();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins');
      const data = await response.json();
      setAdminUsers(data.admins || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdminUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleData = async () => {
    try {
      const response = await fetch('/api/admins/eligible');
      const data = await response.json();
      setEligibleEmployees(data.employees || []);
      setAdminRoleObjects(data.adminRoles || []);
    } catch (error) {
      console.error('Error fetching eligible data:', error);
      setEligibleEmployees([]);
      setAdminRoleObjects([]);
    }
  };

  // Filter for the custom dropdown
  const filteredEmployees = eligibleEmployees.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredAdmins = adminUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- ACTIONS ---
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openAddModal = () => {
    setCurrentAdmin(null);
    setFormData({ 
        ...initialFormState, 
        role: adminRoleObjects.length > 0 ? adminRoleObjects[0].name : '',
        roleId: adminRoleObjects.length > 0 ? adminRoleObjects[0].id : ''
    });
    setErrors({});
    setUserSearchTerm('');
    setIsModalOpen(true);
  };

  const openEditModal = (admin: any) => {
    setCurrentAdmin(admin);
    setFormData({ 
        id: admin.id,
        name: admin.name, 
        email: admin.email, 
        role: admin.role,
        roleId: admin.roleId,
        password: '', 
        confirmPassword: '' 
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (admin: any) => {
    setCurrentAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleUserSelect = (user: any) => {
    setFormData(prev => ({
        ...prev,
        id: user.id,
        name: user.name,
        email: user.email
    }));
    setErrors(prev => ({ ...prev, user: undefined }));
    setIsUserDropdownOpen(false);
  };

  const handleSave = async () => {
    setErrors({});
    const newErrors: any = {};

    // 1. User Selection Validation (Add Mode)
    if (!currentAdmin && !formData.id) {
        newErrors.user = "Please select an employee to promote.";
    }

    // 2. Role Validation
    if (!formData.roleId) {
        newErrors.role = "Please select an admin role.";
    }

    // 3. Password Validation (Required for new admins)
    if (!currentAdmin) {
      if (!formData.password) {
        newErrors.password = "Password is required for new admin accounts.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.password = "Passwords do not match!";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    try {
      if (currentAdmin) {
        // UPDATE existing admin
        const response = await fetch(`/api/admins/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId: formData.roleId })
        });

        if (!response.ok) throw new Error('Failed to update admin');
        
        await fetchAdmins();
      } else {
        // CREATE new admin (with auth account)
        const response = await fetch('/api/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: formData.id,
            roleId: formData.roleId,
            password: formData.password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to create admin');
        }
        
        await fetchAdmins();
        await fetchEligibleData();
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving admin:', error);
      alert(error.message || 'Failed to save admin. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!currentAdmin) return;

    try {
      const response = await fetch(`/api/admins/${currentAdmin.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete admin failed:', errorData);
        alert(`Failed to delete admin: ${errorData.error || 'Unknown error'}\nDetails: ${errorData.details || ''}`);
        return;
      }

      await fetchAdmins();
      await fetchEligibleData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin. Please try again.');
    }
  };

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* --- HEADER --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Admins</h1>
          <p className="text-gray-500 text-sm font-medium">Create and modify system administrator accounts.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-light transition-all shadow-lg shadow-orange-100 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus size={18} /> 
          <span>Add Admin</span>
        </button>
      </div>

      {/* --- MAIN TABLE --- */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search admins..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-brand/10 transition-all shadow-sm placeholder:text-gray-400"
            />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full text-gray-500 hover:text-gray-700"><X size={12} /></button>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Admins</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 shadow-sm">{filteredAdmins.length}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-gray-300" size={32} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6">Username</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Admin Role</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold border border-purple-100 shadow-sm">
                          {admin.avatar}
                        </div>
                        <p className="text-sm font-bold text-gray-800">{admin.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {admin.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-orange-50 text-brand border border-orange-100 whitespace-nowrap">
                        <Shield size={12} />
                        {admin.role}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(admin)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-orange-50 hover:text-brand hover:border-orange-200 transition-all shadow-sm active:scale-95 cursor-pointer" title="Edit Admin">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => openDeleteModal(admin)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-95 cursor-pointer" title="Delete Admin">
                            <Trash2 size={16} />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400">
                      <UserCog size={48} className="mx-auto mb-3 opacity-20"/>
                      <p>No admins found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT ADMIN MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95 duration-200" style={{ minHeight: '400px' }}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Shield size={18} className="text-brand opacity-80" />
                {currentAdmin ? 'Update Admin' : 'Add New Admin'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-5">
              
              {/* --- SEARCHABLE USER DROPDOWN (ADD MODE) --- */}
              {!currentAdmin ? (
                  <div className="relative" ref={dropdownRef}>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Employee to Promote</label>
                      
                      {/* Trigger Button */}
                      <div 
                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer hover:bg-white hover:border-brand/30 transition-all ${isUserDropdownOpen ? 'ring-2 ring-brand/20 border-brand' : 'border-gray-200'}`}
                      >
                        {formData.id ? (
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                                    {eligibleEmployees.find(u => u.id === formData.id)?.avatar}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800 leading-none">{formData.name}</span>
                                    <span className="text-[10px] text-gray-500 leading-none mt-0.5">{formData.email}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">Search for an employee...</span>
                        )}
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Dropdown Menu */}
                      {isUserDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {/* Search Bar inside dropdown */}
                            <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        autoFocus
                                        type="text"
                                        placeholder="Filter by name..."
                                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* List */}
                            <div className="max-h-48 overflow-y-auto">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map(u => (
                                        <div 
                                            key={u.id} 
                                            onClick={() => handleUserSelect(u)}
                                            className="px-4 py-3 hover:bg-orange-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0 group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold group-hover:bg-white group-hover:text-brand transition-colors">
                                                {u.avatar}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 group-hover:text-brand">{u.name}</p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </div>
                                            {formData.id === u.id && <Check size={16} className="ml-auto text-brand" />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-gray-400">No employees found.</div>
                                )}
                            </div>
                        </div>
                      )}
                      {errors.user && <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium"><AlertCircle size={12}/>{errors.user}</div>}
                  </div>
              ) : (
                  // EDIT MODE: JUST SHOW NAME (READ ONLY)
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Name</label>
                      <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-not-allowed">
                          {formData.name} <span className="font-normal text-gray-400 ml-1">({formData.email})</span>
                      </div>
                  </div>
              )}

              {/* --- ROLE SELECTION --- */}
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Role</label>
                  <div className="relative">
                      <select 
                          value={formData.roleId} 
                          onChange={e => {
                            const selectedRole = adminRoleObjects.find(r => r.id === e.target.value);
                            setFormData({
                              ...formData, 
                              roleId: e.target.value,
                              role: selectedRole?.name || ''
                            });
                          }} 
                          className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none ${errors.role ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-brand/20'}`}
                      >
                          {adminRoleObjects.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              {/* --- PASSWORD FIELDS (Required for Add) --- */}
              {!currentAdmin && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="password" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                                    errors.password 
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                                    : 'border-gray-200 focus:ring-brand/20 focus:bg-white'
                                }`}
                                placeholder="Min. 6 characters" 
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="password" 
                                value={formData.confirmPassword} 
                                onChange={e => {
                                    setFormData({...formData, confirmPassword: e.target.value});
                                    setErrors({...errors, password: undefined});
                                }} 
                                className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                                    errors.password 
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                                    : 'border-gray-200 focus:ring-brand/20 focus:bg-white'
                                }`}
                                placeholder="Confirm password" 
                                required
                            />
                        </div>
                    </div>
                    {errors.password && <p className="col-span-2 text-red-500 text-xs text-center flex items-center justify-center gap-1"><AlertCircle size={12}/>{errors.password}</p>}
                    <p className="col-span-2 text-xs text-gray-500 text-center">
                      This password will be used to log in to the admin account.
                    </p>
                  </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 text-white font-bold bg-brand hover:bg-brand-light rounded-xl shadow-lg shadow-orange-100 transition-all text-sm transform hover:-translate-y-0.5">
                {currentAdmin ? 'Save Changes' : 'Create Admin'}
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm bg-red-100 text-red-600">
                      <AlertTriangle size={32} />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">Remove Admin?</h3>
                      <p className="text-sm text-gray-500 mt-1 px-4">
                        Are you sure you want to remove <strong>{currentAdmin?.name}</strong>? This action will revoke their administrative access.
                      </p>
                  </div>
              </div>
              <div className="p-6 flex gap-3">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 bg-red-500 hover:bg-red-600 shadow-red-200">
                    Remove
                  </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}