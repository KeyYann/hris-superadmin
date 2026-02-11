'use client';

import { useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { 
  Search, Plus, Pencil, Trash2, Shield, 
  X, AlertTriangle, UserCog, Mail, Lock, User
} from 'lucide-react';

export default function ManageAdminPage() {
  const { users, addUser, updateUser, deleteUser, roles } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null); 

  // Form State - Default role to the first admin role available
  const initialFormState = { name: '', email: '', role: '', password: '', confirmPassword: '' };
  const [formData, setFormData] = useState(initialFormState);

  // --- 1. FILTER ROLES: Only get roles that contain "Admin" ---
  // This filters the context roles to find "Admin Engineering", "Super Admin", etc.
  const adminRoleObjects = roles.filter(r => r.name.includes('Admin'));
  const adminRoleNames = adminRoleObjects.map(r => r.name);

  // --- 2. FILTER USERS: Only show users who have an Admin role ---
  const adminUsers = users.filter(u => adminRoleNames.includes(u.role));

  const filteredAdmins = adminUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- ACTIONS ---
  const openAddModal = () => {
    setCurrentAdmin(null);
    // Set default role to the first available admin role or empty if none
    setFormData({ 
        ...initialFormState, 
        role: adminRoleObjects.length > 0 ? adminRoleObjects[0].name : '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (admin: any) => {
    setCurrentAdmin(admin);
    setFormData({ 
        name: admin.name, 
        email: admin.email, 
        role: admin.role, 
        password: '', 
        confirmPassword: '' 
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (admin: any) => {
    setCurrentAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleSave = () => {
    // Basic Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!formData.role) {
        alert("Please select an admin role.");
        return;
    }

    if (currentAdmin) {
      updateUser({ ...currentAdmin, name: formData.name, email: formData.email, role: formData.role });
    } else {
      // Default department to 'Management' for new admins
      addUser({ name: formData.name, email: formData.email, role: formData.role, department: 'Management' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (currentAdmin) {
      deleteUser(currentAdmin.id);
      setIsDeleteModalOpen(false);
    }
  };

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
          <span>New Admin</span>
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
                        <button onClick={() => openEditModal(admin)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-orange-50 hover:text-brand hover:border-orange-200 transition-all shadow-sm active:scale-95" title="Edit Admin">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(admin)} className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-95" title="Delete Admin">
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
        </div>
      </div>

      {/* --- ADD / EDIT ADMIN MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Shield size={18} className="text-brand opacity-80" />
                {currentAdmin ? 'Update Admin' : 'Add New Admin'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username / Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all" placeholder="John Doe" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Role</label>
                    {/* Updated Select to use adminRoleObjects from context */}
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all cursor-pointer">
                        {adminRoleObjects.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all" placeholder="admin@company.com" />
                </div>
              </div>

              {!currentAdmin && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all" placeholder="••••••••" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all" placeholder="••••••••" />
                        </div>
                    </div>
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