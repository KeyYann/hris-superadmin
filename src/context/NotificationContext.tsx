'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

// --- TYPE DEFINITIONS ---
export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  status: string;
  avatar: string;
  employmentStatus: string; 
}

export interface Department {
  id: number;
  name: string;
  members: number;
  status: string;
  description: string;
}

export interface Credit {
  type: string;
  entitled: number;
  balance: number;
}

export interface TimeOffRequest {
  id: string;
  user: string;
  avatar: string;
  role: string;
  submitted: string;
  leaveDate: string;
  type: string;
  status: string;
  duration: string;
  isHalfDay?: boolean; 
  message: string;
}

// New Interface for Global Events
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'company' | 'holiday' | 'birthday' | 'deadline' | 'festival' | 'personal';
  description: string;
}

export interface Role {
    id: number;
    name: string;
    users: number;
    description: string;
}

export interface TrashItem {
  trashId: string;
  originalId: string | number;
  type: 'User' | 'Department' | 'Request' | 'Role' | 'Event';
  data: User | Department | TimeOffRequest | Role | CalendarEvent;
  deletedAt: string;
  deletedBy: string; 
}

// --- 1. ROLES ---
const INITIAL_ROLES: Role[] = [
  { id: 1, name: 'Admin Engineering', users: 2, description: 'This admin handles all engineering department leaves.' },
  { id: 2, name: 'Admin HR', users: 3, description: 'This role handles all HR related transaction including managing all users, time offs, employee time off credits, upcoming events.' },
  { id: 3, name: 'Admin Marketing', users: 1, description: 'This admin handles all marketing department time offs.' },
  { id: 4, name: 'Admin', users: 5, description: 'A generic admin role.' },
  { id: 5, name: 'Super Admin', users: 2, description: 'This role handles and manages all types of administrator including all users, events and timeoffs.' },
  { id: 6, name: 'Admin Sales', users: 2, description: '' },
  { id: 7, name: 'Admin Finance', users: 2, description: '' },
  { id: 8, name: 'Admin Managers', users: 4, description: '' },
  { id: 9, name: 'Admin Timesheet', users: 1, description: '' },
  { id: 10, name: 'Admin NetSuite', users: 1, description: '' },
  { id: 11, name: 'Admin New Cluster', users: 0, description: '' },
  { id: 12, name: 'Developer', users: 10, description: 'Standard engineering staff.' },
  { id: 13, name: 'Designer', users: 5, description: 'Standard design staff.' },
  { id: 14, name: 'QA', users: 4, description: 'Quality assurance staff.' },
];

// --- 2. DEPARTMENTS ---
const INITIAL_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Engineering', members: 15, status: 'Active', description: 'Software development and IT operations.' },
  { id: 2, name: 'Design', members: 6, status: 'Active', description: 'Product design, UI/UX, and creative assets.' },
  { id: 3, name: 'Human Resources', members: 4, status: 'Active', description: 'Recruitment, employee relations, and benefits.' },
  { id: 4, name: 'Operations', members: 5, status: 'Active', description: 'Day-to-day business operations.' },
  { id: 5, name: 'Finance', members: 2, status: 'Active', description: 'Accounting and financial planning.' },
  { id: 6, name: 'Sales', members: 3, status: 'Active', description: 'Client acquisition and revenue.' },
];

// --- 3. USERS ---
const INITIAL_USERS: User[] = [
  { id: 'admin1', name: 'Sarah Smith', role: 'Super Admin', email: 'sarah.s@abbeconsult.com', department: 'Operations', status: 'Active', avatar: 'SS', employmentStatus: 'Regular Employee' },
  { id: 'admin3', name: 'Victoria Hand', role: 'Admin', email: 'victoria.h@abbeconsult.com', department: 'Operations', status: 'Active', avatar: 'VH', employmentStatus: 'Regular Employee' },
  { id: 'u4', name: 'Emily White', role: 'Admin HR', email: 'emily.w@abbeconsult.com', department: 'Human Resources', status: 'Active', avatar: 'EW', employmentStatus: 'Regular Employee' },
  { id: 'admin2', name: 'Alexander Pierce', role: 'Super Admin', email: 'alex.p@abbe.com', department: 'Operations', status: 'Active', avatar: 'AP', employmentStatus: 'Regular Employee' },
  { id: 'admin4', name: 'Phil Coulson', role: 'Admin HR', email: 'phil.c@abbe.com', department: 'Human Resources', status: 'Active', avatar: 'PC', employmentStatus: 'Regular Employee' },
  { id: 'admin5', name: 'Nick Fury', role: 'Admin Managers', email: 'nick.f@abbe.com', department: 'Operations', status: 'Active', avatar: 'NF', employmentStatus: 'Regular Employee' },
  { id: 'u1', name: 'Roger Jr. Dumaguit', role: 'Developer', email: 'roger.d@abbe.com', department: 'Engineering', status: 'Active', avatar: 'RD', employmentStatus: 'Regular Employee' },
  { id: 'u2', name: 'Jomel Dela Cruz', role: 'Designer', email: 'jomel.dc@abbe.com', department: 'Design', status: 'Active', avatar: 'JD', employmentStatus: 'Regular Employee' },
  { id: 'u3', name: 'Mike Johnson', role: 'Developer', email: 'mike.j@abbe.com', department: 'Engineering', status: 'Active', avatar: 'MJ', employmentStatus: 'Probationary Employee' },
  { id: 'u5', name: 'David Brown', role: 'QA', email: 'david.b@abbe.com', department: 'Engineering', status: 'Active', avatar: 'DB', employmentStatus: 'Regular Employee' },
  { id: 'u6', name: 'Laurence Rey', role: 'Designer', email: 'laurence.r@abbe.com', department: 'Design', status: 'Active', avatar: 'LR', employmentStatus: 'Regular Employee' },
  { id: 'u7', name: 'Rommel Manalo', role: 'Developer', email: 'rommel.m@abbe.com', department: 'Engineering', status: 'Active', avatar: 'RM', employmentStatus: 'Project-based Employee' },
  { id: 'u8', name: 'Alice Chen', role: 'Admin Managers', email: 'alice.c@abbe.com', department: 'Operations', status: 'Active', avatar: 'AC', employmentStatus: 'Regular Employee' },
  { id: 'u9', name: 'Robert Taylor', role: 'Developer', email: 'robert.t@abbe.com', department: 'Engineering', status: 'Active', avatar: 'RT', employmentStatus: 'Regular Employee' },
  { id: 'u10', name: 'Maria Garcia', role: 'Designer', email: 'maria.g@bequik.com', department: 'Design', status: 'On Leave', avatar: 'MG', employmentStatus: 'Seasonal Employee' },
  { id: 'u11', name: 'James Wilson', role: 'QA', email: 'james.w@bequik.com', department: 'Engineering', status: 'Active', avatar: 'JW', employmentStatus: 'Probationary Employee' },
  { id: 'u12', name: 'Patricia Miller', role: 'Admin HR', email: 'patricia.m@abbe.com', department: 'Human Resources', status: 'Active', avatar: 'PM', employmentStatus: 'Regular Employee' },
  { id: 'u13', name: 'Michael Anderson', role: 'Developer', email: 'michael.a@abbe.com', department: 'Engineering', status: 'Active', avatar: 'MA', employmentStatus: 'Regular Employee' },
  { id: 'u14', name: 'Jennifer Thomas', role: 'Admin Managers', email: 'jennifer.t@abbe.com', department: 'Operations', status: 'Active', avatar: 'JT', employmentStatus: 'Regular Employee' },
  { id: 'u15', name: 'Christopher Martinez', role: 'Developer', email: 'christopher.m@abbe.com', department: 'Engineering', status: 'Active', avatar: 'CM', employmentStatus: 'Regular Employee' },
];

// --- 4. TIME OFF REQUESTS ---
const INITIAL_TIME_OFF_REQUESTS: TimeOffRequest[] = [
  { id: '399', user: 'James Wilson', avatar: 'JW', role: 'QA', submitted: '2026-02-08', leaveDate: '2026-02-12', type: 'Sick Leave', status: 'Pending', duration: '1 Day', isHalfDay: false, message: 'Doctor appointment.' },
  { id: '400', user: 'Mike Johnson', avatar: 'MJ', role: 'Developer', submitted: '2026-02-01', leaveDate: '2026-02-04', type: 'Sick Leave', status: 'Approved', duration: '5 Days', isHalfDay: false, message: 'Medical leave.' },
  { id: '401', user: 'Alice Chen', avatar: 'AC', role: 'Admin Managers', submitted: '2026-02-01', leaveDate: '2026-02-05', type: 'Vacation Leave', status: 'Approved', duration: '5 Days', isHalfDay: false, message: 'Family trip.' },
  { id: '365', user: 'Roger Jr. Dumaguit', avatar: 'RD', role: 'Developer', submitted: '2026-01-01', leaveDate: '2025-12-27', type: 'Vacation Leave', status: 'Approved', duration: '1 Day', isHalfDay: false, message: 'Taking a personal break.' },
  { id: '366', user: 'Jomel Dela Cruz', avatar: 'JD', role: 'Designer', submitted: '2026-01-02', leaveDate: '2026-01-05', type: 'Sick Leave', status: 'Pending', duration: '2 Days', isHalfDay: false, message: 'Not feeling well.' },
  { id: '367', user: 'Sarah Smith', avatar: 'SS', role: 'Super Admin', submitted: '2026-01-03', leaveDate: '2026-01-10', type: 'Emergency Leave', status: 'Declined', duration: '1 Day', isHalfDay: false, message: 'Family emergency.' },
  { id: '369', user: 'Emily White', avatar: 'EW', role: 'Admin HR', submitted: '2026-02-05', leaveDate: '2026-02-08', type: 'Sick Leave', status: 'Approved', duration: '10 Day', isHalfDay: false, message: 'Migraine.' },
  { id: '370', user: 'Laurence Rey', avatar: 'LR', role: 'Designer', submitted: '2026-02-05', leaveDate: '2026-02-06', type: 'Vacation Leave', status: 'Pending', duration: '2 Days', isHalfDay: false, message: 'Attending a conference.' },
  { id: '371', user: 'Rommel Manalo', avatar: 'RM', role: 'Developer', submitted: '2026-01-07', leaveDate: '2026-01-25', type: 'Vacation Leave', status: 'Approved', duration: '0.5 Days', isHalfDay: true, message: 'Hiking trip.' },
];

// --- 5. NEW: GLOBAL CALENDAR EVENTS (5 MOCK EVENTS from Feb 12, 2026 onwards) ---
const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'evt-1', title: 'Q1 Strategic Planning', date: '2026-02-12', type: 'company', description: 'All hands meeting for Q1 goals.' },
  { id: 'evt-2', title: 'Valentine\'s Day Lunch', date: '2026-02-14', type: 'company', description: 'Office celebration.' },
  { id: 'evt-3', title: 'Project Beta Deadline', date: '2026-02-18', type: 'deadline', description: 'Final submission for Beta phase.' },
  { id: 'evt-4', title: 'New Cluster Training', date: '2026-02-23', type: 'company', description: 'Training for the new admin cluster.' },
  { id: 'evt-5', title: 'Monthly Town Hall', date: '2026-02-27', type: 'company', description: 'Monthly updates and awarding.' },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'leave', user: 'Jomel Dela Cruz', action: 'submitted a', target: 'Vacation Leave', time: '2 hours ago', timestamp: new Date(), isRead: false, avatarColor: 'bg-blue-100 text-blue-600', initials: 'JD' },
  { id: 3, type: 'leave', user: 'Laurence Rey', action: 'submitted a', target: 'Sick Leave', time: 'Yesterday', timestamp: new Date(Date.now() - 86400000), isRead: true, avatarColor: 'bg-purple-100 text-purple-600', initials: 'LR' },
];

const DEFAULT_CREDITS: Credit[] = [
  { type: 'Vacation Leave', entitled: 15, balance: 15.0 },
  { type: 'Emergency Leave', entitled: 5, balance: 5.0 },
  { type: 'Sick Leave', entitled: 15, balance: 15.0 },
  { type: 'Bereavement Leave', entitled: 3, balance: 3.0 },
  { type: 'Paternity Leave', entitled: 7, balance: 7.0 },
  { type: 'Maternity Leave', entitled: 0, balance: 0.0 },
];

// Initialize credits for all users based on ID
const generateInitialCredits = (users: User[]) => {
    const credits: Record<string, Credit[]> = {};
    users.forEach(u => {
        credits[u.id] = [...DEFAULT_CREDITS]; 
    });
    return credits;
}

interface NotificationContextType {
  notifications: typeof INITIAL_NOTIFICATIONS;
  unreadCount: number;
  markAllAsRead: () => void;
  timeOffRequests: TimeOffRequest[];
  pendingTimeOffCount: number;
  addTimeOffRequest: (request: Partial<TimeOffRequest>) => void;
  updateTimeOffStatus: (id: string, status: string) => void;
  deleteTimeOffRequest: (id: string) => void;
  
  // Calendar Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Trash
  trash: TrashItem[];
  restoreItem: (trashId: string) => void;
  permanentlyDeleteItem: (trashId: string) => void;

  users: User[]; 
  totalUsers: number;
  addUser: (user: Partial<User>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  
  roles: Role[]; 
  addRole: (role: any) => void;
  updateRole: (role: any) => void;
  deleteRole: (id: number) => void;
  
  departments: Department[]; 
  addDepartment: (dept: Partial<Department>) => void;
  updateDepartment: (dept: Department) => void;
  deleteDepartment: (id: number) => void;
  
  getUserCredits: (userId: string) => Credit[];
  updateUserCredits: (userId: string, newCredits: Credit[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(INITIAL_TIME_OFF_REQUESTS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [userCredits, setUserCredits] = useState<Record<string, Credit[]>>(() => generateInitialCredits(INITIAL_USERS));
  
  // TRASH STATE
  const [trash, setTrash] = useState<TrashItem[]>([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pendingTimeOffCount = timeOffRequests.filter(r => r.status === 'Pending').length;
  const totalUsers = users.length;

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // --- TRASH LOGIC ---
  const addToTrash = (type: 'User' | 'Department' | 'Request' | 'Role' | 'Event', originalId: string | number, data: any) => {
    const newItem: TrashItem = {
        trashId: `trash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalId,
        type,
        data,
        deletedAt: new Date().toLocaleDateString(),
        deletedBy: 'Admin'
    };
    setTrash(prev => [newItem, ...prev]);
  };

  const restoreItem = useCallback((trashId: string) => {
    const item = trash.find(t => t.trashId === trashId);
    if (!item) return;

    if (item.type === 'User') {
        setUsers(prev => [...prev, item.data as User]);
    } else if (item.type === 'Department') {
        setDepartments(prev => [...prev, item.data as Department]);
    } else if (item.type === 'Request') {
        setTimeOffRequests(prev => [...prev, item.data as TimeOffRequest]);
    } else if (item.type === 'Role') {
        setRoles(prev => [...prev, item.data as Role]);
    } else if (item.type === 'Event') {
        setCalendarEvents(prev => [...prev, item.data as CalendarEvent]);
    }

    setTrash(prev => prev.filter(t => t.trashId !== trashId));
  }, [trash]);

  const permanentlyDeleteItem = useCallback((trashId: string) => {
    setTrash(prev => prev.filter(t => t.trashId !== trashId));
  }, []);


  const addTimeOffRequest = useCallback((req: Partial<TimeOffRequest>) => {
    const newRequest: TimeOffRequest = {
      id: `req_${Date.now()}`,
      user: req.user || 'Current User',
      avatar: req.avatar || 'CU',
      role: req.role || 'Employee',
      submitted: new Date().toISOString().split('T')[0],
      leaveDate: req.leaveDate || '',
      type: req.type || 'Vacation Leave',
      status: 'Pending',
      duration: req.duration || '1 Day',
      isHalfDay: req.isHalfDay || false,
      message: req.message || ''
    };
    setTimeOffRequests(prev => [newRequest, ...prev]);
  }, []);

  const updateTimeOffStatus = useCallback((id: string, status: string) => {
    const request = timeOffRequests.find(r => r.id === id);

    if (request && status === 'Approved' && request.status !== 'Approved') {
        const user = users.find(u => u.name === request.user);
        if (user) {
            setUserCredits(prevCredits => {
                const userCreditList = prevCredits[user.id] ? [...prevCredits[user.id]] : [...DEFAULT_CREDITS];
                
                let deduction = 0;
                if (request.isHalfDay) {
                    deduction = 0.5;
                } else {
                    deduction = parseFloat(request.duration.split(' ')[0]) || 1.0;
                }

                const updatedCredits = userCreditList.map(credit => {
                    if (credit.type === request.type) {
                        return { ...credit, balance: Math.max(0, credit.balance - deduction) };
                    }
                    return credit;
                });

                return { ...prevCredits, [user.id]: updatedCredits };
            });
        }
    }
    setTimeOffRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, [timeOffRequests, users]);

  // DELETE FUNCTIONS (Move to Trash)
  const deleteTimeOffRequest = useCallback((id: string) => {
    const req = timeOffRequests.find(r => r.id === id);
    if (req) {
        addToTrash('Request', id, req);
        setTimeOffRequests(prev => prev.filter(r => r.id !== id));
    }
  }, [timeOffRequests]);

  // CALENDAR EVENTS LOGIC
  const addCalendarEvent = useCallback((event: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: event.title || 'New Event',
        date: event.date || new Date().toISOString().split('T')[0],
        type: event.type || 'company',
        description: event.description || ''
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    const evt = calendarEvents.find(e => e.id === id);
    if (evt) {
        addToTrash('Event', id, evt);
        setCalendarEvents(prev => prev.filter(e => e.id !== id));
    }
  }, [calendarEvents]);

  const addUser = useCallback((newUser: Partial<User>) => {
    const id = `u${Date.now()}`;
    const name = newUser.name || 'Unknown User';
    const avatar = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    const fullUser: User = {
        id,
        name,
        role: newUser.role || 'Employee',
        email: newUser.email || '',
        department: newUser.department || 'General',
        status: newUser.status || 'Active',
        avatar,
        employmentStatus: newUser.employmentStatus || 'Regular Employee'
    };

    setUsers(prev => [...prev, fullUser]);
    setUserCredits(prev => ({ ...prev, [id]: [...DEFAULT_CREDITS] }));
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
        addToTrash('User', id, user);
        setUsers(prev => prev.filter(u => u.id !== id));
    }
  }, [users]);

  const addRole = useCallback((newRole: any) => {
    const id = Math.max(...roles.map(r => r.id), 0) + 1;
    setRoles(prev => [...prev, { ...newRole, id, users: 0 }]);
  }, [roles]);

  const updateRole = useCallback((updatedRole: any) => {
    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
  }, []);

  const deleteRole = useCallback((id: number) => {
    const role = roles.find(r => r.id === id);
    if (role) {
        addToTrash('Role', id, role);
        setRoles(prev => prev.filter(r => r.id !== id));
    }
  }, [roles]);

  const addDepartment = useCallback((newDept: Partial<Department>) => {
    const id = Math.max(...departments.map(d => d.id), 0) + 1;
    const fullDept: Department = {
        id,
        name: newDept.name || 'New Dept',
        members: 0,
        status: newDept.status || 'Active',
        description: newDept.description || ''
    };
    setDepartments(prev => [...prev, fullDept]);
  }, [departments]);

  const updateDepartment = useCallback((updatedDept: Department) => {
    setDepartments(prev => prev.map(d => d.id === updatedDept.id ? updatedDept : d));
  }, []);

  const deleteDepartment = useCallback((id: number) => {
    const dept = departments.find(d => d.id === id);
    if (dept) {
        addToTrash('Department', id, dept);
        setDepartments(prev => prev.filter(d => d.id !== id));
    }
  }, [departments]);

  const getUserCredits = useCallback((userId: string) => {
    return userCredits[userId] || DEFAULT_CREDITS;
  }, [userCredits]);

  const updateUserCredits = useCallback((userId: string, newCredits: Credit[]) => {
    setUserCredits(prev => ({
      ...prev,
      [userId]: newCredits
    }));
  }, []);

  const value = useMemo(() => ({
    notifications, unreadCount, markAllAsRead,
    timeOffRequests, pendingTimeOffCount, addTimeOffRequest, updateTimeOffStatus, deleteTimeOffRequest,
    calendarEvents, addCalendarEvent, deleteCalendarEvent,
    trash, restoreItem, permanentlyDeleteItem,
    users, totalUsers, addUser, updateUser, deleteUser,
    roles, addRole, updateRole, deleteRole,
    departments, addDepartment, updateDepartment, deleteDepartment,
    getUserCredits, updateUserCredits
  }), [
    notifications, unreadCount, markAllAsRead, 
    timeOffRequests, pendingTimeOffCount, addTimeOffRequest, updateTimeOffStatus, deleteTimeOffRequest, 
    calendarEvents, addCalendarEvent, deleteCalendarEvent,
    trash, restoreItem, permanentlyDeleteItem,
    users, totalUsers, addUser, updateUser, deleteUser,
    roles, addRole, updateRole, deleteRole,
    departments, addDepartment, updateDepartment, deleteDepartment,
    getUserCredits, updateUserCredits
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}