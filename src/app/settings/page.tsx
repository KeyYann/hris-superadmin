'use client';

import { useState } from 'react';
import { 
  Save, Database, Shield, FileCode, Download, 
  Plus, Trash2, AlertCircle, Clock, Settings, Briefcase, RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('policies'); // Default to policies now
  const [loading, setLoading] = useState(false);

  // Mock Save Handler
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('System settings updated successfully!');
    }, 1000);
  };

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            System Settings
          </h1>
          <p className="text-gray-500 text-sm font-medium">Configure global system parameters, policies, and data management.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-light transition-all shadow-lg shadow-orange-100 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : <><Save size={18} /> Save Configuration</>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">
        
        {/* SIDEBAR TABS - Removed General */}
        <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <TabButton 
            id="policies" 
            label="Leave Policies" 
            icon={<Briefcase size={18} />} 
            activeTab={activeTab} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="backup" 
            label="Backup & Data" 
            icon={<Database size={18} />} 
            activeTab={activeTab} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="security" 
            label="System Security" 
            icon={<Shield size={18} />} 
            activeTab={activeTab} 
            onClick={setActiveTab} 
          />
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            
            {/* Removed GeneralSettings Component Call */}
            {activeTab === 'policies' && <LeavePoliciesSettings />}
            {activeTab === 'backup' && <BackupSettings />}
            {activeTab === 'security' && <SecuritySettings />}

          </div>
        </div>
      </div>
    </div>
  );
}

// --- TAB COMPONENTS ---

function TabButton({ id, label, icon, activeTab, onClick }: any) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
        ${isActive 
          ? 'bg-white text-brand shadow-sm border border-gray-100' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }
      `}
    >
      <span className={isActive ? 'text-brand' : 'text-gray-400'}>{icon}</span>
      {label}
    </button>
  );
}

// 1. LEAVE POLICIES (CREDIT TYPES)
function LeavePoliciesSettings() {
  const [leaveTypes, setLeaveTypes] = useState([
    { id: 1, name: 'Vacation Leave', defaultCredits: 15, carryOver: true },
    { id: 2, name: 'Sick Leave', defaultCredits: 15, carryOver: false },
    { id: 3, name: 'Emergency Leave', defaultCredits: 5, carryOver: false },
    { id: 4, name: 'Bereavement Leave', defaultCredits: 3, carryOver: false },
    { id: 5, name: 'Paternity Leave', defaultCredits: 7, carryOver: false },
    { id: 6, name: 'Maternity Leave', defaultCredits: 105, carryOver: false },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Leave Policies</h2>
          <p className="text-gray-500 text-sm mt-1">Define the types of leave available in the system.</p>
          <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 flex items-start gap-2 max-w-2xl">
             <AlertCircle size={16} className="shrink-0 mt-0.5"/>
             <p><strong>Note:</strong> Adjusting "Default Credits" here only affects <strong>new employees</strong> created in the future. To change credits for existing employees, please use the <strong>Manage Credits</strong> page.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors">
           <Plus size={14}/> Add Type
        </button>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
               <tr>
                  <th className="p-4 pl-6">Leave Type Name</th>
                  <th className="p-4">Default Credits (Yearly)</th>
                  <th className="p-4">Carry Over?</th>
                  <th className="p-4 text-right pr-6">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {leaveTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50/50">
                     <td className="p-4 pl-6 font-bold text-gray-800">{type.name}</td>
                     <td className="p-4">
                        <input 
                           type="number" 
                           defaultValue={type.defaultCredits}
                           className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm text-center font-bold focus:outline-none focus:border-brand"
                        />
                     </td>
                     <td className="p-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${type.carryOver ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                           {type.carryOver ? 'Yes' : 'No'}
                        </div>
                     </td>
                     <td className="p-4 text-right pr-6">
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                           <Trash2 size={16} />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}

// 2. BACKUP SETTINGS
function BackupSettings() {
  const [backups, setBackups] = useState([
     { id: 1, date: '2026-02-09 02:00 AM', size: '12.4 MB', type: 'Auto' },
     { id: 2, date: '2026-02-08 02:00 AM', size: '12.2 MB', type: 'Auto' },
     { id: 3, date: '2026-02-05 10:30 AM', size: '11.8 MB', type: 'Manual' },
  ]);

  const handleGenerateBackup = () => {
     alert("Generating SQL Backup... (This will be implemented in the backend later)");
     // Mock adding a new backup
     const newBackup = {
       id: Date.now(),
       date: new Date().toLocaleString(),
       size: '12.5 MB',
       type: 'Manual'
     };
     setBackups([newBackup, ...backups]);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Database Backup</h2>
          <p className="text-gray-500 text-sm mt-1">Download SQL dumps of the database for disaster recovery.</p>
        </div>
      </div>

      <div className="p-8 border border-brand/20 bg-orange-50/30 rounded-3xl flex flex-col items-center text-center gap-4">
         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-brand border border-orange-100">
            <FileCode size={32} />
         </div>
         <div>
            <h3 className="text-lg font-bold text-gray-900">Generate Full Backup</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">This will create a comprehensive <code>.sql</code> file containing all users, departments, roles, and leave history.</p>
         </div>
         <button 
            onClick={handleGenerateBackup}
            className="mt-2 flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all"
         >
            <Download size={18} /> Generate & Download .sql
         </button>
      </div>

      <div>
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={14}/> Recent Backups
         </h3>
         <div className="space-y-3">
            {backups.map((backup) => (
               <div key={backup.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:border-gray-300 transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                        <Database size={18} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-800">{backup.date}</p>
                        <div className="flex gap-2 text-xs text-gray-400">
                           <span>Size: {backup.size}</span>
                           <span>•</span>
                           <span className={backup.type === 'Manual' ? 'text-brand' : 'text-gray-400'}>{backup.type}</span>
                        </div>
                     </div>
                  </div>
                  <button className="text-brand text-xs font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                     Download
                  </button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

// 3. SECURITY SETTINGS
function SecuritySettings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-gray-800">System Security Policies</h2>
        <p className="text-gray-500 text-sm mt-1">Enforce security standards across the organization.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <div className="p-6 border border-gray-100 rounded-2xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h3 className="font-bold text-gray-800">Session Timeout</h3>
               <p className="text-sm text-gray-500">Automatically log out inactive users.</p>
            </div>
            <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-brand">
               <option>15 Minutes</option>
               <option>30 Minutes</option>
               <option>1 Hour</option>
               <option>4 Hours</option>
            </select>
         </div>

         <div className="p-6 border border-gray-100 rounded-2xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h3 className="font-bold text-gray-800">Password Complexity</h3>
               <p className="text-sm text-gray-500">Require special characters and numbers.</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-sm font-bold text-gray-400">Off</span>
               <button className="w-12 h-6 bg-brand rounded-full p-1 transition-colors relative">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm translate-x-6"></div>
               </button>
               <span className="text-sm font-bold text-brand">On</span>
            </div>
         </div>

         <div className="p-6 border border-gray-100 rounded-2xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h3 className="font-bold text-gray-800">Force Password Reset</h3>
               <p className="text-sm text-gray-500">Force all users to change password on next login.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors">
               <RefreshCw size={14}/> Trigger Reset
            </button>
         </div>
      </div>
    </div>
  );
}