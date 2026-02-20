'use client';

import { useState, useEffect } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO,
  setMonth, setYear, getYear, getMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Loader2, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';

export default function EventsPage() {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mergedEvents, setMergedEvents] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date, events: any[] } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '' });

  // Fetch calendar events from Supabase
  const fetchCalendarEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setCalendarEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  // --- 1. FETCH HOLIDAYS & MERGE ---
  useEffect(() => {
    const fetchAndMergeEvents = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const response = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/PH`);
        const data = response.ok ? await response.json() : [];

        const apiHolidays = data.map((holiday: any) => ({
          id: `holiday-${holiday.date}`,
          title: holiday.name,
          date: holiday.date,
          type: 'holiday',
          description: holiday.localName
        }));

        setMergedEvents([...apiHolidays, ...calendarEvents]);

      } catch (error) {
        console.error("Failed to fetch holidays", error);
        setMergedEvents([...calendarEvents]); 
      } finally {
        setLoading(false);
      }
    };

    fetchAndMergeEvents();
  }, [currentDate.getFullYear(), calendarEvents]); 

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

  const handleDayClick = (day: Date) => {
    const events = getEventsForDay(day);
    setSelectedDayEvents({ date: day, events });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          date: newEvent.date,
          description: newEvent.description,
          type: 'event'
        })
      });

      if (response.ok) {
        await fetchCalendarEvents(); // Refresh events
        setIsAddModalOpen(false);
        setNewEvent({ title: '', date: '', description: '' });
        
        // Close day modal if open
        if (selectedDayEvents) {
          setSelectedDayEvents(null);
        }
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        const response = await fetch(`/api/events/${deleteId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchCalendarEvents(); // Refresh events
          setDeleteId(null);
          setSelectedDayEvents(null);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
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
              onClick={() => {
                  setNewEvent({ title: '', date: format(new Date(), 'yyyy-MM-dd'), description: '' });
                  setIsAddModalOpen(true);
              }}
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

            // Limit visible events per cell
            const MAX_VISIBLE = 2;
            const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
            const hiddenCount = dayEvents.length - MAX_VISIBLE;

            return (
              <div 
                key={day.toString()} 
                onClick={() => handleDayClick(day)}
                className={`
                  min-h-[100px] border-b border-r border-gray-50 p-2 flex flex-col gap-1 transition-colors hover:bg-gray-50/80 group/cell cursor-pointer
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
                  {visibleEvents.map((evt: any) => {
                    // Simplified Styling: Holidays/Festivals vs Standard Events
                    let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100"; // Default Generic Style
                    
                    if (evt.type === 'holiday') badgeStyle = "bg-red-50 text-red-600 border-red-100";
                    if (evt.type === 'festival') badgeStyle = "bg-purple-50 text-purple-600 border-purple-100";
                    if (evt.type === 'birthday') badgeStyle = "bg-pink-50 text-pink-600 border-pink-100";
                    
                    return (
                      <div key={evt.id} className={`text-[10px] px-2 py-1 rounded-md border truncate font-bold ${badgeStyle}`} title={evt.title}>
                        {evt.type === 'birthday' ? '🎂 ' : ''}
                        {evt.title}
                      </div>
                    );
                  })}
                  
                  {/* + More Badge */}
                  {hiddenCount > 0 && (
                      <div className="text-[10px] px-2 py-1 rounded-md bg-gray-100 text-gray-500 font-bold text-center">
                          + {hiddenCount} more
                      </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- DAY DETAILS MODAL --- */}
      {selectedDayEvents && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{format(selectedDayEvents.date, 'MMM d, yyyy')}</h3>
                        <p className="text-xs text-gray-500">{format(selectedDayEvents.date, 'EEEE')}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setNewEvent({ title: '', date: format(selectedDayEvents.date, 'yyyy-MM-dd'), description: '' });
                                setIsAddModalOpen(true);
                            }}
                            className="p-2 bg-white text-brand border border-gray-200 hover:bg-orange-50 rounded-xl transition-colors"
                            title="Add Event"
                        >
                            <Plus size={18}/>
                        </button>
                        <button onClick={() => setSelectedDayEvents(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                    </div>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1 space-y-3">
                    {selectedDayEvents.events.length > 0 ? (
                        selectedDayEvents.events.map((evt: any) => (
                            <div key={evt.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl group relative hover:border-gray-300 transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                        {evt.type === 'birthday' && '🎂'} {evt.title}
                                    </h4>
                                    
                                    {/* Delete Button - Only show for user created (personal) events */}
                                    {evt.type === 'personal' && (
                                        <button 
                                            onClick={() => setDeleteId(evt.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                {evt.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{evt.description}</p>}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <CalendarIcon size={32} className="mx-auto mb-2 opacity-20"/>
                            <p>No events for this day.</p>
                        </div>
                    )}
                </div>
             </div>
          </div>
      )}

      {/* --- ADD EVENT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm" 
                  value={newEvent.date} 
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
                />
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
                  onClick={() => setIsAddModalOpen(false)} 
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

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className="p-6 flex flex-col items-center text-center gap-4 bg-red-50/50">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm bg-red-100 text-red-600">
                      <Trash2 size={32} />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">Delete Event?</h3>
                      <p className="text-sm text-gray-500 mt-1 px-4">
                        Are you sure you want to remove this event? This action cannot be undone.
                      </p>
                  </div>
              </div>
              <div className="p-6 flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
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