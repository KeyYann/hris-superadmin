'use client'; 

import { useState, useEffect } from 'react';
import { 
  Users, Calendar, Hourglass, Cloud, ChevronRight, MoreHorizontal, MapPin,
  Sun, CloudRain, CloudLightning, CloudDrizzle, CloudFog, CloudSun 
} from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/context/NotificationContext';

export default function DashboardPage() {
  const { notifications, unreadCount, timeOffRequests, pendingTimeOffCount, totalUsers } = useNotifications();

  // --- LOCAL STATE (Time & Weather) ---
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string; city: string; code: number } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // --- DERIVED STATS ---
  const approvedLeavesCount = timeOffRequests.filter(r => r.status === 'Approved').length;
  const recentNotifications = notifications.slice(0, 3);

  useEffect(() => {
    // --- CLOCK LOGIC ---
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    // --- WEATHER LOGIC ---
    const fetchWeather = async () => {
      try {
        let lat = 14.5995;
        let lon = 120.9842;
        let cityLabel = "Metro Manila";

        if ("geolocation" in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;

            const cityResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const cityData = await cityResponse.json();
            cityLabel = cityData.city || cityData.locality || "Current Location";
          } catch (e) { console.log("Geolocation denied, using default."); }
        }

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
        if (!response.ok) throw new Error("Weather fetch failed");
        
        const data = await response.json();
        const current = data.current;
        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: getWeatherDescription(current.weather_code),
          city: cityLabel,
          code: current.weather_code,
        });
      } catch (error) {
        setWeather({ temp: 30, condition: "Sunny", city: "Metro Manila", code: 0 });
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full mx-auto flex flex-col gap-6 md:gap-8">
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl p-6 md:p-12 shadow-xl flex flex-col md:flex-row justify-between items-center shrink-0 min-h-[300px]">
          
          {/* DYNAMIC WEATHER BACKGROUND LAYER (Right Side Only) */}
          <WeatherBackground code={weather?.code || 0} />

          {/* Content */}
          <div className="z-10 relative text-center md:text-left flex flex-col justify-center">
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-2 leading-none drop-shadow-sm">
              {time ? time.toLocaleDateString('en-US', { weekday: 'long' }) : '...'}
            </h1>
            <p className="text-blue-100 text-base md:text-xl font-medium tracking-wide uppercase mb-8 opacity-90">
              {time ? time.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Loading Date...'}
            </p>
            <div className="inline-flex items-baseline gap-3 bg-white/10 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/10 self-center md:self-start shadow-inner">
                <p className="text-4xl md:text-5xl font-bold text-white tabular-nums tracking-wider">
                  {time ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/ (AM|PM)/, '') : '--:--'}
                </p>
                <span className="text-2xl md:text-3xl text-blue-200 font-medium tabular-nums animate-pulse w-[3ch] text-center">
                   {time ? time.getSeconds().toString().padStart(2, '0') : ''}
                </span>
                <span className="text-lg md:text-xl font-bold text-orange-400 ml-1">
                   {time ? time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).split(' ')[1] : ''}
                </span>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8 md:mt-0 z-10 bg-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-md border border-white/10 w-full md:w-auto justify-between md:justify-start min-w-[300px] shadow-lg">
            <div className="text-white opacity-90 drop-shadow-lg">
                {loadingWeather 
                  ? <Cloud size={80} strokeWidth={1.5} /> 
                  : <WeatherIcon code={weather?.code || 0} size={80} />
                }
            </div>
            <div className="text-right flex flex-col justify-center w-full">
              {loadingWeather ? (
                <div className="animate-pulse flex flex-col items-end gap-2">
                  <div className="h-4 w-24 bg-white/20 rounded"></div>
                  <div className="h-12 w-20 bg-white/20 rounded"></div>
                  <div className="h-4 w-32 bg-white/20 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-end gap-2 text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                    <MapPin size={14} />
                    {weather?.city}
                  </div>
                  <p className="text-6xl md:text-7xl font-bold leading-none tracking-tighter my-1">
                    {weather?.temp}<span className="text-3xl md:text-4xl align-top text-gray-400 ml-1 font-light">°C</span>
                  </p>
                  <p className="text-gray-200 text-lg md:text-xl font-medium tracking-wide">
                    {weather?.condition}
                  </p>
                </>
              )}
            </div>
          </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0">
        <StatsCard 
          icon={<Users size={24} className="text-blue-500"/>} 
          label="Total Users" 
          value={totalUsers.toString()} 
          color="bg-blue-50"
          hoverColor="group-hover:text-[#EF9621]"
        />
        <StatsCard 
          icon={<Calendar size={24} className="text-purple-500"/>} 
          label="Approved Time Offs" 
          value={approvedLeavesCount.toString()} 
          trend="This Year" 
          color="bg-purple-50"
          hoverColor="group-hover:text-[#EF9621]"
        />
        <StatsCard 
          icon={<Hourglass size={24} className="text-orange-500"/>} 
          label="Pending Leaves" 
          value={pendingTimeOffCount.toString()} 
          trend={pendingTimeOffCount > 0 ? "Action Needed" : "All Clear"} 
          trendColor={pendingTimeOffCount > 0 ? "text-orange-600 bg-orange-100" : "text-green-600 bg-green-100"}
          color="bg-orange-50"
          hoverColor="group-hover:text-[#EF9621]"
        />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[450px]">
             <div className="flex justify-between items-center mb-8">
               <div>
                 <h3 className="text-lg md:text-xl font-bold text-gray-800">Leave Applications</h3>
                 <p className="text-xs md:text-sm text-gray-400">Overview of employee leave requests</p>
               </div>
               <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"><MoreHorizontal size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-x-auto pb-4">
                <div className="h-full flex flex-col min-w-[600px] xl:min-w-0">
                  <div className="flex-1 flex items-end justify-between gap-4 px-6 relative">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="border-t border-dashed border-gray-100 w-full h-0"></div>
                        ))}
                      </div>
                      {[35, 55, 40, 70, 50, 85, 60, 45, 65, 30, 50, 75].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full z-10">
                          <div className="w-full max-w-[40px] bg-[#EF9621]/20 group-hover:bg-[#EF9621] transition-all duration-300 rounded-t-lg relative" style={{ height: `${h}%` }}>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">{h} Requests</div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-4 px-6 font-medium uppercase tracking-wide">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                      <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-6">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Upcoming Events</h3>
                  <Link href="/events" className="text-xs font-semibold text-brand hover:underline">View Calendar</Link>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center py-8">
                  <Calendar size={32} className="mx-auto text-gray-300 mb-2"/>
                  <p className="text-sm text-gray-400 italic">No events scheduled.</p>
                </div>
             </div>

             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {unreadCount}
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((n) => (
                      <NotificationItem 
                        key={n.id}
                        initials={n.initials} 
                        bg={n.avatarColor} 
                        user={n.user} 
                        action={n.action} 
                        type={n.target} 
                        time={n.time} 
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No notifications.</p>
                  )}
                </div>

                <Link 
                  href="/notifications" className="mt-8 w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group">
                  See All Notifications <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
             </div>
          </div>
      </div>

      {/* --- CSS ANIMATIONS --- */}
      <style jsx global>{`
        @keyframes fall {
          0% { transform: translateY(-20px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, 5px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        .animate-rain { animation: fall linear infinite; }
        .animate-cloud-float { animation: float 12s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENTS ---

// UPDATED: Background Component (Right Side Only, Transparent)
function WeatherBackground({ code }: { code: number }) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute inset-y-0 right-0 w-2/3 md:w-1/2 overflow-hidden pointer-events-none z-0 mix-blend-screen">
      <div className="absolute inset-0 bg-gradient-to-l from-gray-800/50 to-transparent"></div>
      {children}
    </div>
  );

  // SUNNY (0) - UPDATED RAYS
  if (code === 0) {
    return (
      <Wrapper>
        {/* Warm glow on bottom-right */}
        <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[80px] animate-pulse"></div>
        {/* HUGE Static Rays from bottom-right (blinking) */}
        <div className="absolute bottom-[-200px] right-[-200px] w-[1200px] h-[1200px] animate-pulse-slow origin-center -rotate-90"
             style={{ background: 'conic-gradient(from 0deg, transparent 0deg, white 15deg, transparent 30deg, white 45deg, transparent 60deg, white 75deg, transparent 90deg)' }}>
        </div>
      </Wrapper>
    );
  }

  // CLOUDY / PARTLY CLOUDY (1-3)
  if (code >= 1 && code <= 3) {
    return (
      <Wrapper>
         <div className="absolute top-12 right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-cloud-float"></div>
         <div className="absolute top-24 right-[-20px] w-48 h-48 bg-white/5 rounded-full blur-3xl animate-cloud-float delay-1000"></div>
         <div className="absolute bottom-10 right-20 w-40 h-20 bg-white/5 rounded-full blur-2xl animate-cloud-float delay-2000"></div>
      </Wrapper>
    );
  }

  // RAIN / DRIZZLE / SHOWERS (51-65, 80-82)
  if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
    return (
      <Wrapper>
        {/* Rain droplets */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute top-[-20px] w-[1px] h-[30px] bg-blue-300/20 animate-rain"
            style={{ 
              left: `${20 + Math.random() * 80}%`, // Concentrate on right side
              animationDuration: `${0.5 + Math.random()}s`,
              animationDelay: `${Math.random()}s`
            }}
          />
        ))}
      </Wrapper>
    );
  }

  // THUNDERSTORM (95+)
  if (code >= 95) {
    return (
      <Wrapper>
        <div className="absolute inset-0 bg-white/5 animate-pulse duration-100"></div> {/* Lightning flash */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute top-[-20px] w-[1px] h-[40px] bg-white/30 animate-rain"
            style={{ 
              left: `${20 + Math.random() * 80}%`, 
              animationDuration: `${0.3 + Math.random()}s`,
              animationDelay: `${Math.random()}s`
            }}
          />
        ))}
      </Wrapper>
    );
  }

  // Default
  return null;
}

function WeatherIcon({ code, size }: { code: number, size: number }) {
  if (code === 0) return <Sun size={size} strokeWidth={1.5} />;
  if (code >= 1 && code <= 3) return <CloudSun size={size} strokeWidth={1.5} />;
  if (code === 45 || code === 48) return <CloudFog size={size} strokeWidth={1.5} />;
  if (code >= 51 && code <= 55) return <CloudDrizzle size={size} strokeWidth={1.5} />;
  if (code >= 61 && code <= 82) return <CloudRain size={size} strokeWidth={1.5} />;
  if (code >= 95) return <CloudLightning size={size} strokeWidth={1.5} />;
  return <Cloud size={size} strokeWidth={1.5} />;
}

function StatsCard({ icon, label, value, trend, trendColor = "text-green-600 bg-green-100", color, hoverColor = "group-hover:text-blue-600" }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group flex flex-col justify-between h-full min-h-[160px]">
      <div className="flex items-start justify-between w-full">
        <div className={`p-3.5 rounded-2xl ${color} transition-colors`}>{icon}</div>
        {trend && (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${trendColor} h-fit`}>
                {trend}
            </span>
        )}
      </div>
      <div className="flex items-end justify-between mt-4">
        <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider leading-snug max-w-[40%] self-end pb-1.5">
            {label}
        </h4>
        <span className={`text-6xl font-black text-gray-800 tracking-tighter leading-[0.85] ${hoverColor} transition-colors mr-0`}>
            {value}
        </span>
      </div>
    </div>
  );
}

function NotificationItem({ initials, bg, user, action, type, time }: any) {
  return (
    <div className="flex gap-4 items-start group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${bg}`}>{initials}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 leading-snug"><span className="font-bold hover:text-brand cursor-pointer transition-colors">{user}</span> {action} <span className="font-semibold text-gray-600">{type}</span></p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code >= 1 && code <= 3) return "Partly Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rainy";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Variable";
}