'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent login if captcha isn't checked
    if (!isCaptchaVerified) return;

    setIsLoading(true);

    // SIMULATE LOGIN DELAY
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard'); 
    }, 1500);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#121212] overflow-hidden p-6">
      
      {/* --- MOVING BACKGROUND LAYER (PRESERVED) --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Blob 1: Brand Orange */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#EF9621]/20 rounded-full blur-[120px] animate-blob mix-blend-screen" />
        {/* Blob 2: Brand Light */}
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#F5AF1B]/15 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
        {/* Blob 3: Bottom Accent */}
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-[#EF9621]/10 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen" />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.04]" 
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
        />
      </div>

      {/* --- NEW WHITE LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] p-8 sm:p-10 animate-in fade-in zoom-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative w-28 h-28 mb-4 drop-shadow-lg hover:scale-105 transition-transform duration-500">
             <Image 
               src="/abbe-emblem.png" 
               alt="ABBE Emblem" 
               fill
               className="object-contain"
               priority
             />
          </div>
          {/* Changed text to dark for white background */}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-gray-400 group-focus-within:text-[#EF9621] transition-colors duration-300" size={18} />
              </div>
              {/* Light input styling */}
              <input 
                type="email" 
                required
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EF9621]/20 focus:border-[#EF9621] transition-all hover:bg-gray-100"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-gray-400 group-focus-within:text-[#EF9621] transition-colors duration-300" size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EF9621]/20 focus:border-[#EF9621] transition-all hover:bg-gray-100"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* --- reCAPTCHA UI SIMULATION --- */}
          <div 
            onClick={() => setIsCaptchaVerified(!isCaptchaVerified)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              {/* Checkbox Box */}
              <div className={`flex items-center justify-center w-6 h-6 border rounded-sm transition-all duration-200 ${
                isCaptchaVerified 
                  ? 'bg-[#EF9621] border-[#EF9621]' 
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}>
                {isCaptchaVerified && <Check size={16} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-sm font-medium text-gray-700">I'm not a robot</span>
            </div>
            
            {/* Recaptcha Logo Simulation */}
            <div className="flex flex-col items-center">
               <img 
                 src="https://www.gstatic.com/recaptcha/api2/logo_48.png" 
                 alt="reCAPTCHA" 
                 className="w-8 h-8 opacity-70"
               />
               <span className="text-[9px] text-gray-400 mt-0.5">reCAPTCHA</span>
               <span className="text-[8px] text-gray-400">Privacy - Terms</span>
            </div>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={isLoading || !isCaptchaVerified}
            className="w-full group relative flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#EF9621] to-[#F5AF1B] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

        </form>
      </div>

      {/* --- CSS ANIMATIONS --- */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 15s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}