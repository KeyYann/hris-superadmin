'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Plus, Pencil, Trash2, Building, 
  Users, X, AlertTriangle
} from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<any>(null); 

  // Form State
  const [formData, setFormData] = useState({ name: '', status: 'Active', description: '' });
  const [deleteError, setDeleteError] = useState('');

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---
  const openAddModal = () => {
    setCurrentDepartment(null);
    setFormData({ name: '', status: 'Active', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setCurrentDepartment(dept);
    setFormData({ name: dept.name, status: dept.status, description: dept.description || '' });
    setIsModalOpen(true);
  };

  const openDeleteModal = (dept: any) => {
    setCurrentDepartment(dept);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentDepartment) {
        // Update existing department
        const response = await fetch(`/api/departments/${currentDepartment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          await fetchDepartments();
        }
      } else {
        // Create new department
        const response = await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          await fetchDepartments();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDelete = async () => {
    if (currentDepartment) {
      try {
        const response = await fetch(`/api/departments/${currentDepartment.id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setDeleteError(data.error || 'Failed to delete department');
          return;
        }
        
        await fetchDepartments();
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting department:', error);
        setDeleteError('Failed to delete department');
      }
    }
  };

  // Filter
  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* --- HEADER CARD --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        
        {/* Title Group */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Departments</h1>
          <p className="text-gray-500 text-sm font-medium">Manage company departments and structure.</p>
        </div>

        {/* Button */}
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-light transition-all shadow-lg shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus size={18} /> 
          <span>New Department</span>
        </button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* CONTROLS BAR */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search departments..." 
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

          {/* Total Count Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 shadow-sm">
              {filteredDepartments.length}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-brand rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">Loading departments...</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6">Department Name</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDepartments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand flex items-center justify-center border border-orange-100 shadow-sm">
                        <Building size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{dept.name}</p>
                        <p className="text-xs text-gray-400 max-w-[200px] truncate">{dept.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users size={16} className="text-gray-400" />
                      <span className="font-semibold">{dept.memberCount || 0}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${dept.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dept.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {dept.status}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(dept)}
                          className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-orange-50 hover:text-brand hover:border-orange-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(dept)}
                          className="p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDepartments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400">
                    <Building size={48} className="mx-auto mb-3 opacity-20"/>
                    <p>No departments found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">{currentDepartment ? 'Edit Department' : 'New Department'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                  placeholder="e.g. Engineering"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all resize-none"
                  placeholder="Brief description of the department..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 text-white font-bold bg-brand hover:bg-brand-light rounded-xl shadow-lg shadow-orange-100 transition-all text-sm transform hover:-translate-y-0.5">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className="p-6 flex flex-col items-center text-center gap-4 bg-red-50/50">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm bg-red-100 text-red-600">
                      <AlertTriangle size={32} />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">Delete Department?</h3>
                      <p className="text-sm text-gray-500 mt-1 px-4">
                        Are you sure you want to delete <strong>{currentDepartment?.name}</strong>? This action cannot be undone.
                      </p>
                      {deleteError && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700 font-medium">{deleteError}</p>
                        </div>
                      )}
                  </div>
              </div>
              <div className="p-6 flex gap-3">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 bg-red-500 hover:bg-red-600 shadow-red-200">
                    Delete
                  </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}