'use client';

import { useState, useEffect } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO,
  setMonth, setYear, getYear, getMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext'; // 1. Import Context

export default function EventsPage() {
  const { calendarEvents, addCalendarEvent } = useNotifications(); // 2. Consume Context
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mergedEvents, setMergedEvents] = useState<any[]>([]); // State for combined events
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '' });

  // --- 1. FETCH HOLIDAYS & MERGE WITH CONTEXT EVENTS ---
  useEffect(() => {
    const fetchAndMergeEvents = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();

        // 1. Fetch Public Holidays
        const response = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/PH`);
        const data = response.ok ? await response.json() : [];

        const apiHolidays = data.map((holiday: any) => ({
          id: `holiday-${holiday.date}`,
          title: holiday.name,
          date: holiday.date,
          type: 'holiday',
          description: holiday.localName
        }));

        // 2. Merge API Holidays with Context Events (Mock Data + User Added)
        // This ensures the 5 mock events from Feb 12 onwards appear here
        setMergedEvents([...apiHolidays, ...calendarEvents]);

      } catch (error) {
        console.error("Failed to fetch holidays", error);
        // Fallback: just show context events if API fails
        setMergedEvents([...calendarEvents]); 
      } finally {
        setLoading(false);
      }
    };

    fetchAndMergeEvents();
  }, [currentDate.getFullYear(), calendarEvents]); // Re-run when year changes OR context events change

  // --- CALENDAR LOGIC ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    return mergedEvents.filter(event => isSameDay(parseISO(event.date), day));
  };

  // --- HANDLERS ---
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(setYear(currentDate, parseInt(e.target.value)));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(setMonth(currentDate, parseInt(e.target.value)));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add to Global Context instead of local state
    addCalendarEvent({
        title: newEvent.title,
        date: newEvent.date,
        description: newEvent.description,
        type: 'personal' // Default type for user-added events
    });

    setIsModalOpen(false);
    setNewEvent({ title: '', date: '', description: '' });
  };

  const currentYear = getYear(new Date());
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)]">
      
      {/* CALENDAR CONTAINER */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-b border-gray-100 gap-4">
          
          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                <select 
                  value={getMonth(currentDate)} 
                  onChange={handleMonthChange}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-lg font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer min-w-[140px]"
                >
                  {months.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronRight size={14} className="rotate-90"/>
                </div>
              </div>

              <div className="relative">
                <select 
                  value={getYear(currentDate)} 
                  onChange={handleYearChange}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 font-semibold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronRight size={14} className="rotate-90"/>
                </div>
              </div>
              
              {loading && <Loader2 className="animate-spin text-brand ml-2" size={20}/>}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 transition-all text-sm whitespace-nowrap"
            >
              <Plus size={16} strokeWidth={3} /> Add Event
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all"><ChevronLeft size={18}/></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-brand uppercase tracking-wider">Today</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>

        {/* --- DAYS HEADER --- */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* --- CALENDAR GRID --- */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6 overflow-y-auto">
          {calendarDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div 
                key={day.toString()} 
                className={`
                  min-h-[100px] border-b border-r border-gray-50 p-2 flex flex-col gap-1 transition-colors hover:bg-gray-50/30
                  ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : 'bg-white'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand text-white shadow-md shadow-orange-200' : ''}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                {/* Event Chips */}
                <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                  {dayEvents.map((evt: any) => {
                    // Dynamic Styles based on Event Type
                    let badgeStyle = "bg-gray-100 text-gray-600 border-gray-200"; 
                    
                    if (evt.type === 'holiday') badgeStyle = "bg-red-50 text-red-600 border-red-100";
                    if (evt.type === 'festival') badgeStyle = "bg-purple-50 text-purple-600 border-purple-100";
                    if (evt.type === 'company') badgeStyle = "bg-blue-50 text-blue-600 border-blue-100";
                    if (evt.type === 'birthday') badgeStyle = "bg-pink-50 text-pink-600 border-pink-100";
                    if (evt.type === 'deadline') badgeStyle = "bg-amber-50 text-amber-700 border-amber-100";
                    if (evt.type === 'personal') badgeStyle = "bg-emerald-50 text-emerald-600 border-emerald-100";

                    return (
                      <div key={evt.id} className={`text-[10px] px-2 py-1 rounded-md border truncate font-bold cursor-pointer hover:opacity-80 transition-opacity ${badgeStyle}`} title={evt.description}>
                        {evt.type === 'birthday' ? '🎂 ' : ''}
                        {evt.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- ADD EVENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Add New Event</h3>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Event Title</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50" 
                  placeholder="e.g. Team Meeting" 
                  value={newEvent.title} 
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</label>
                <input 
                  required 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm" 
                  value={newEvent.date} 
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
                />
                <p className="text-[10px] text-gray-400 text-right">Future dates only</p>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                 <textarea
                    rows={2}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm resize-none"
                    placeholder="Brief details..."
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                 />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-brand text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}