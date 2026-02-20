'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Trash2, RotateCcw, Search, User, Building, FileText, AlertTriangle, Shield, Filter, Calendar as CalendarIcon, Loader2
} from 'lucide-react';

export default function TrashPage() {
  const { hasRole } = useAuth();
  const [trash, setTrash] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Confirmation for Permanent Delete
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Check if user is Super Admin
  const isSuperAdmin = hasRole(['Super Admin']);

  // Fetch trash items
  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trash');
      const data = await response.json();
      setTrash(data.trash || []);
    } catch (error) {
      console.error('Error fetching trash:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredTrash = trash.filter(item => {
    // Admin can only see Request type items
    if (!isSuperAdmin && item.type !== 'Request') {
      return false;
    }

    const matchesType = filterType === 'All' || item.type === filterType;
    
    // Determine the name/label based on item type
    let itemName = '';
    if (item.type === 'User') itemName = (item.data as any).name;
    if (item.type === 'Department') itemName = (item.data as any).name;
    if (item.type === 'Request') itemName = (item.data as any).user + ' ' + (item.data as any).type;
    if (item.type === 'Role') itemName = (item.data as any).name;
    if (item.type === 'Event') itemName = (item.data as any).title;

    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Helper to render icon based on type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'User': return <User size={18} className="text-blue-500" />;
      case 'Department': return <Building size={18} className="text-orange-500" />;
      case 'Request': return <FileText size={18} className="text-purple-500" />;
      case 'Role': return <Shield size={18} className="text-emerald-500" />;
      case 'Event': return <CalendarIcon size={18} className="text-pink-500" />;
      default: return <Trash2 size={18} className="text-gray-500" />;
    }
  };

  // Helper to get description
  const getDescription = (item: any) => {
    if (item.type === 'User') return `${(item.data as any).department} - ${(item.data as any).email}`;
    if (item.type === 'Department') return (item.data as any).description || 'No description';
    if (item.type === 'Request') return `${(item.data as any).type} on ${(item.data as any).leaveDate}`;
    if (item.type === 'Role') return (item.data as any).description || 'No description';
    if (item.type === 'Event') return `${(item.data as any).date} - ${(item.data as any).type}`;
    return '';
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trashId: id })
      });

      if (response.ok) {
        await fetchTrash(); // Refresh trash list
      }
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const handlePermanentDelete = async () => {
    if (deleteConfirmId) {
      try {
        const response = await fetch(`/api/trash?id=${deleteConfirmId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchTrash(); // Refresh trash list
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        setDeleteConfirmId(null);
      }
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            Trash
          </h1>
          <p className="text-gray-500 text-sm font-medium">Restore deleted items or remove them permanently.</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* CONTROLS */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search trash..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-brand/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group">
                <select 
                   value={filterType}
                   onChange={(e) => setFilterType(e.target.value)}
                   className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer hover:border-gray-300 shadow-sm min-w-[160px]"
                >
                   <option value="All">All Types</option>
                   {isSuperAdmin && <option value="User">Users</option>}
                   {isSuperAdmin && <option value="Department">Departments</option>}
                   <option value="Request">Requests</option>
                   {isSuperAdmin && <option value="Role">Roles</option>}
                   {isSuperAdmin && <option value="Event">Events</option>}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
             </div>
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={64} className="mb-4 opacity-20 animate-spin" />
              <p>Loading trash...</p>
            </div>
          ) : filteredTrash.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <Trash2 size={64} className="mb-4 opacity-20" />
               <p>Trash is empty.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTrash.map((item) => (
                <div key={item.trashId} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors group bg-white">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-gray-800">
                             {item.type === 'User' ? (item.data as any).name : 
                              item.type === 'Department' ? (item.data as any).name : 
                              item.type === 'Role' ? (item.data as any).name : 
                              item.type === 'Event' ? (item.data as any).title :
                              (item.data as any).user}
                           </h3>
                           <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-wider">{item.type}</span>
                        </div>
                        <p className="text-sm text-gray-500">{getDescription(item)}</p>
                        <p className="text-xs text-gray-400 mt-1">Deleted: {item.deletedAt}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleRestore(item.trashId)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(item.trashId)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} /> Delete Forever
                      </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className="p-6 flex flex-col items-center text-center gap-4 bg-red-50/50">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm bg-red-100 text-red-600"><AlertTriangle size={32} /></div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">Delete Forever?</h3>
                      <p className="text-sm text-gray-500 mt-1 px-4">This item will be permanently removed and cannot be recovered.</p>
                  </div>
              </div>
              <div className="p-6 flex gap-3">
                  <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button onClick={handlePermanentDelete} className="flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 bg-red-500 hover:bg-red-600 shadow-red-200">Delete</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}