'use client';

import { useRef, useState } from 'react';
import { User, Mail, Lock, Camera, Save, MapPin, Calendar, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Trigger file input
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection (Direct Update - NO CROPPING)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
    // Reset input to allow re-selecting the same file if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-8 h-[calc(100vh-2rem)] overflow-y-auto pr-2 relative">

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* --- LEFT COLUMN: PROFILE CARD --- */}
        <div className="xl:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-0 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                
                {/* Decorative Background Header - BRAND COLOR (Vibrant) */}
                <div 
                  className="h-32 w-full relative"
                  style={{ background: 'linear-gradient(to right, #EF9621, #F59E0B)' }} 
                >
                    <div className="absolute inset-0 bg-white/10 pattern-dots"></div>
                </div>

                {/* Avatar Section */}
                <div className="relative -mt-16 mb-4">
                    <div className="w-32 h-32 rounded-full border-[5px] border-white shadow-md bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl font-bold text-[#EF9621] overflow-hidden relative z-10">
                         {profileImage ? (
                           <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                           "SS"
                         )}
                    </div>
                    
                    {/* Camera Button */}
                    <button 
                        onClick={handleCameraClick}
                        className="absolute bottom-1 right-1 p-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-colors shadow-lg z-20 cursor-pointer border-[3px] border-white active:scale-95"
                    >
                        <Camera size={14} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>

                {/* Name & Role */}
                <div className="px-8 pb-8 w-full flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Sarah Smith</h2>
                    
                    {/* Role Badge */}
                    <div className="mt-2 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#EF9621] text-xs font-bold uppercase tracking-wider rounded-full border border-orange-100">
                            <ShieldCheck size={12} />
                            Super Admin
                        </span>
                    </div>

                    {/* Mini Stats */}
                    <div className="w-full flex flex-col gap-4 pt-6 border-t border-dashed border-gray-200">
                        <InfoRow icon={<Mail size={14} />} text="sarah.s@abbeconsult.com" />
                        <InfoRow icon={<MapPin size={14} />} text="Makati City, Philippines" />
                        <InfoRow icon={<Calendar size={14} />} text="Joined January 2023" />
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: EDIT FORM --- */}
        <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Account Details</h3>
                        <p className="text-sm text-gray-500">Update your personal information.</p>
                    </div>
                </div>

                <form className="p-8 space-y-8">
                    {/* Section 1: Basic Info */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Basic Information</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="First Name" icon={<User size={18}/>} defaultValue="Sarah" />
                            <InputGroup label="Last Name" icon={<User size={18}/>} defaultValue="Smith" />
                            
                            <div className="md:col-span-2">
                                <InputGroup label="Email Address" icon={<Mail size={18}/>} type="email" defaultValue="sarah.s@abbeconsult.com" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Security */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Security</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="New Password" icon={<Lock size={18}/>} type="password" placeholder="Leave blank to keep current" />
                            <InputGroup label="Confirm Password" icon={<Lock size={18}/>} type="password" placeholder="Confirm new password" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                        <button type="button" className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all">
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="px-8 py-3 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            style={{ background: 'linear-gradient(to right, #EF9621, #F59E0B)' }}
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function InfoRow({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-3 text-gray-600 text-sm group cursor-default">
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#EF9621] group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                {icon}
            </div>
            <span className="font-medium">{text}</span>
        </div>
    );
}

function InputGroup({ label, icon, type = "text", defaultValue, placeholder }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#EF9621] transition-colors">
                    {icon}
                </div>
                <input
                    type={type}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all placeholder:text-gray-300"
                />
            </div>
        </div>
    );
}