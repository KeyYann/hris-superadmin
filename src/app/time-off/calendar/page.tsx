'use client';

import { useState, useEffect } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, 
  addDays, parseISO, getYear, getMonth, setMonth, setYear,
  addWeeks, subWeeks, subDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TimeOffCalendarPage() {
  const { user } = useAuth();
  const [timeOffRequests, setTimeOffRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'Month' | 'Week' | 'Day'>('Month');

  // Fetch time off requests
  useEffect(() => {
    if (user?.id) {
      fetchTimeOffRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, user?.departmentId]);

  const fetchTimeOffRequests = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: user.id,
        userRole: user.role,
      });
      if (user.departmentId) {
        params.append('departmentId', user.departmentId);
      }
      
      const response = await fetch(`/api/time-off?${params.toString()}`);
      const data = await response.json();
      setTimeOffRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching time off requests:', error);
      setTimeOffRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: PROCESS EVENTS ---
  const getLeaveEvents = () => {
    const events: any[] = [];
    const approvedLeaves = timeOffRequests.filter(req => req.status === 'Approved');

    approvedLeaves.forEach(request => {
      const startDate = parseISO(request.leaveDate);
      // Handle duration - it could be a number or a string like "2 Days"
      const durationValue = typeof request.duration === 'number' 
        ? request.duration 
        : parseFloat(request.duration?.toString().split(' ')[0] || '1');
      
      const duration = isNaN(durationValue) ? 1 : durationValue;

      // For half-day leaves, just show on the single day
      if (request.isHalfDay || duration < 1) {
        events.push({
          id: `${request.id}-0`,
          date: startDate,
          user: request.user,
          type: request.type,
          avatar: request.avatar,
          isHalfDay: request.isHalfDay,
          role: request.role || 'Employee'
        });
      } else {
        // For multi-day leaves, create an event for each day
        for (let i = 0; i < Math.floor(duration); i++) {
          const currentLeaveDay = addDays(startDate, i);
          events.push({
            id: `${request.id}-${i}`,
            date: currentLeaveDay,
            user: request.user,
            type: request.type,
            avatar: request.avatar,
            isHalfDay: false,
            role: request.role || 'Employee'
          });
        }
      }
    });
    return events;
  };

  const leaveEvents = getLeaveEvents();

  // --- LOGIC: DATE NAVIGATION ---
  const handlePrev = () => {
    if (view === 'Month') setCurrentDate(subMonths(currentDate, 1));
    if (view === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    if (view === 'Day') setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'Month') setCurrentDate(addMonths(currentDate, 1));
    if (view === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    if (view === 'Day') setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(setYear(currentDate, parseInt(e.target.value)));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(setMonth(currentDate, parseInt(e.target.value)));
  };

  // --- LOGIC: GENERATE GRID DAYS ---
  let daysToRender = [];
  if (view === 'Month') {
     const monthStart = startOfMonth(currentDate);
     const monthEnd = endOfMonth(monthStart);
     const startDate = startOfWeek(monthStart);
     const endDate = endOfWeek(monthEnd);
     daysToRender = eachDayOfInterval({ start: startDate, end: endDate });
  } else if (view === 'Week') {
     const startDate = startOfWeek(currentDate);
     const endDate = endOfWeek(currentDate);
     daysToRender = eachDayOfInterval({ start: startDate, end: endDate });
  } else {
     daysToRender = [currentDate];
  }

  const getEventsForDay = (day: Date) => {
    return leaveEvents
      .filter(event => isSameDay(event.date, day))
      .sort((a, b) => a.user.localeCompare(b.user));
  };

  // Dropdown Data
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* --- HEADER --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row justify-between xl:items-center gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Time Off Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of employee time offs.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
           {/* View Switcher */}
           <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
              {['Month', 'Week', 'Day'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={`
                    px-4 py-2 rounded-lg text-xs font-bold transition-all
                    ${view === v ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  {v}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* --- CALENDAR CONTAINER --- */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-b border-gray-100 gap-4 bg-gray-50/30">
          
          {/* Selectors (Month/Year or Date Title) */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {view !== 'Day' ? (
              <>
                <div className="relative group">
                  <select 
                    value={getMonth(currentDate)} 
                    onChange={handleMonthChange}
                    className="appearance-none bg-white border border-gray-200 text-gray-800 text-lg font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer min-w-[140px] shadow-sm hover:border-gray-300 transition-colors"
                  >
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                  {/* Restored Dropdown Arrow */}
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>

                <div className="relative group">
                  <select 
                    value={getYear(currentDate)} 
                    onChange={handleYearChange}
                    className="appearance-none bg-white border border-gray-200 text-gray-600 font-semibold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
                  >
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {/* Restored Dropdown Arrow */}
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </>
            ) : (
                <h2 className="text-xl font-bold text-gray-700 ml-2">
                    {format(currentDate, 'MMMM d, yyyy')}
                </h2>
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
              <button onClick={handlePrev} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-all"><ChevronLeft size={18}/></button>
              <button onClick={handleToday} className="px-4 py-1 text-xs font-bold text-gray-600 hover:text-brand uppercase tracking-wider border-l border-r border-gray-100 mx-1">Today</button>
              <button onClick={handleNext} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-all"><ChevronRight size={18}/></button>
          </div>
        </div>

        {/* Calendar Header */}
        {view !== 'Day' && (
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Calendar Body */}
        <div className={`
          flex-1 overflow-y-auto min-h-0
          ${view === 'Day' ? 'p-6' : 'grid grid-cols-7'}
        `}>
          {loading ? (
            <div className="col-span-7 flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-gray-300" size={32} />
            </div>
          ) : (
            daysToRender.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            // --- DAY VIEW RENDERING ---
            if (view === 'Day') {
                return (
                  <div key={day.toString()} className="w-full h-full">
                    {dayEvents.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300">
                        <CalIcon size={48} className="mb-2 opacity-20"/>
                        <p>No leaves scheduled for this day.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayEvents.map((evt: any) => (
                          <div key={evt.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                              {evt.avatar}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">{evt.user}</h3>
                              <p className="text-xs text-gray-500">{evt.role}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                {evt.type} {evt.isHalfDay ? '(Half Day)' : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
            }

            // --- MONTH & WEEK VIEW RENDERING ---
            return (
              <div 
                key={day.toString()} 
                className={`
                  border-b border-r border-gray-50 p-2 flex flex-col gap-2 transition-colors hover:bg-gray-50/50
                  ${!isCurrentMonth && view === 'Month' ? 'bg-gray-50/30 text-gray-300' : 'bg-white'}
                  ${view === 'Week' ? 'min-h-[300px]' : 'min-h-[140px]'} 
                `}
              >
                {/* Date Number */}
                <div className="flex justify-between items-start shrink-0">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand text-white shadow-md shadow-orange-200' : ''}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                {/* Event List */}
                <div className="flex-1 flex flex-col gap-1">
                  {dayEvents.map((evt: any) => (
                    <div 
                      key={evt.id} 
                      className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm hover:border-brand/30 transition-all group cursor-default"
                    >
                      <span className="text-[10px] font-bold text-gray-700 truncate group-hover:text-brand transition-colors max-w-[60%]">
                        {evt.user.split(' ')[0]} {evt.user.split(' ')[1]?.[0]}.
                      </span>
                      <span className="text-[9px] text-gray-400 truncate flex-1 text-right">
                        {evt.type.replace(' Leave', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}