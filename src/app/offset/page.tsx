'use client';

import { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';

interface ExcessHour {
  id: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  totalHours: string;
  justification: string;
}

interface AppliedLeave {
  id: string;
  startDate: string;
  endDate: string;
  timeFrom: string;
  timeTo: string;
  totalHours: string;
}

export default function OffsetPage() {
  const [employeeName, setEmployeeName] = useState('');
  const [position, setPosition] = useState('');
  const [dateFiled, setDateFiled] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('');

  const [excessHours, setExcessHours] = useState<ExcessHour[]>([
    { id: '1', date: '', timeFrom: '', timeTo: '', totalHours: '', justification: '' }
  ]);

  const [appliedLeaves, setAppliedLeaves] = useState<AppliedLeave[]>([
    { id: '1', startDate: '', endDate: '', timeFrom: '', timeTo: '', totalHours: '' }
  ]);

  const addExcessHour = () => {
    setExcessHours([...excessHours, { 
      id: Date.now().toString(), 
      date: '', 
      timeFrom: '', 
      timeTo: '', 
      totalHours: '', 
      justification: '' 
    }]);
  };

  const removeExcessHour = (id: string) => {
    if (excessHours.length > 1) {
      setExcessHours(excessHours.filter(h => h.id !== id));
    }
  };

  const updateExcessHour = (id: string, field: keyof ExcessHour, value: string) => {
    setExcessHours(excessHours.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const addAppliedLeave = () => {
    setAppliedLeaves([...appliedLeaves, { 
      id: Date.now().toString(), 
      startDate: '', 
      endDate: '', 
      timeFrom: '', 
      timeTo: '', 
      totalHours: '' 
    }]);
  };

  const removeAppliedLeave = (id: string) => {
    if (appliedLeaves.length > 1) {
      setAppliedLeaves(appliedLeaves.filter(l => l.id !== id));
    }
  };

  const updateAppliedLeave = (id: string, field: keyof AppliedLeave, value: string) => {
    setAppliedLeaves(appliedLeaves.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSubmit = () => {
    console.log('Submitting offset request:', {
      employeeName,
      position,
      dateFiled,
      department,
      excessHours,
      appliedLeaves
    });
    alert('Offset request submitted successfully!');
  };

  return (
    <div className="w-full mx-auto flex flex-col h-[calc(100vh-2rem)] gap-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Offsetting Overtime Request Form</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Convert excess overtime hours into leave credits</p>
          </div>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 transition-all"
          >
            <Save size={18} />
            Submit Request
          </button>
        </div>
      </div>

      {/* MAIN FORM */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* EMPLOYEE INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Employee Name</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Enter employee name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date Filed</label>
              <input
                type="date"
                value={dateFiled}
                onChange={(e) => setDateFiled(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Position</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Enter position"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="Enter department"
              />
            </div>
          </div>

          {/* EXCESS HOURS RENDERED */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Excess Hours Rendered</h3>
              <button
                onClick={addExcessHour}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={16} />
                Add Row
              </button>
            </div>

            <div className="space-y-4">
              {excessHours.map((hour, index) => (
                <div key={hour.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Date</label>
                      <input
                        type="date"
                        value={hour.date}
                        onChange={(e) => updateExcessHour(hour.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Time From</label>
                      <input
                        type="time"
                        value={hour.timeFrom}
                        onChange={(e) => updateExcessHour(hour.id, 'timeFrom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Time To</label>
                      <input
                        type="time"
                        value={hour.timeTo}
                        onChange={(e) => updateExcessHour(hour.id, 'timeTo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Total Hours</label>
                      <input
                        type="text"
                        value={hour.totalHours}
                        onChange={(e) => updateExcessHour(hour.id, 'totalHours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="e.g. 11 hrs"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Justification</label>
                        <input
                          type="text"
                          value={hour.justification}
                          onChange={(e) => updateExcessHour(hour.id, 'justification', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="Enter justification"
                        />
                      </div>
                      {excessHours.length > 1 && (
                        <button
                          onClick={() => removeExcessHour(hour.id)}
                          className="self-end p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EXCESS HOURS APPLIED FOR LEAVE */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Excess Hours Applied For Leave</h3>
              <button
                onClick={addAppliedLeave}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={16} />
                Add Row
              </button>
            </div>

            <div className="space-y-4">
              {appliedLeaves.map((leave, index) => (
                <div key={leave.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={leave.startDate}
                        onChange={(e) => updateAppliedLeave(leave.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">End Date</label>
                      <input
                        type="date"
                        value={leave.endDate}
                        onChange={(e) => updateAppliedLeave(leave.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Time From</label>
                      <input
                        type="time"
                        value={leave.timeFrom}
                        onChange={(e) => updateAppliedLeave(leave.id, 'timeFrom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Time To</label>
                      <input
                        type="time"
                        value={leave.timeTo}
                        onChange={(e) => updateAppliedLeave(leave.id, 'timeTo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Total Hours</label>
                        <input
                          type="text"
                          value={leave.totalHours}
                          onChange={(e) => updateAppliedLeave(leave.id, 'totalHours', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="e.g. 9 hrs"
                        />
                      </div>
                      {appliedLeaves.length > 1 && (
                        <button
                          onClick={() => removeAppliedLeave(leave.id)}
                          className="self-end p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
