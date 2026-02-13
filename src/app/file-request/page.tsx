'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Briefcase, ArrowLeft } from 'lucide-react';

type RequestType = 'leave' | 'overtime' | 'official-business' | null;

export default function FileRequestPage() {
  const [selectedType, setSelectedType] = useState<RequestType>(null);

  if (selectedType === 'leave') {
    return <LeaveRequestForm onBack={() => setSelectedType(null)} />;
  }

  if (selectedType === 'overtime') {
    return <OvertimeRequestForm onBack={() => setSelectedType(null)} />;
  }

  if (selectedType === 'official-business') {
    return <OfficialBusinessRequestForm onBack={() => setSelectedType(null)} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">File Request</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Choose the type of request you want to file.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setSelectedType('leave')}
          className="bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all group"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-100 transition-colors">
            <Calendar className="text-blue-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Leave Request</h3>
          <p className="text-sm text-gray-500">File for vacation, sick leave, or other time off</p>
        </button>

        <button
          onClick={() => setSelectedType('overtime')}
          className="bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all group"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4 mx-auto group-hover:bg-orange-100 transition-colors">
            <Clock className="text-orange-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Overtime Request</h3>
          <p className="text-sm text-gray-500">Request approval for overtime work</p>
        </button>

        <button
          onClick={() => setSelectedType('official-business')}
          className="bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-green-300 hover:shadow-lg transition-all group"
        >
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4 mx-auto group-hover:bg-green-100 transition-colors">
            <Briefcase className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Official Business</h3>
          <p className="text-sm text-gray-500">File for client meetings or business travel</p>
        </button>
      </div>
    </div>
  );
}

function LeaveRequestForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to File Request</span>
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">File Leave Request</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Submit your leave application</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-3xl text-white">
        <h3 className="text-lg font-bold mb-4">Your Leave Credits</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm opacity-80">Vacation Leave</p>
            <p className="text-2xl font-bold">15 <span className="text-sm font-normal">of 15 days</span></p>
          </div>
          <div>
            <p className="text-sm opacity-80">Emergency Leave</p>
            <p className="text-2xl font-bold">5 <span className="text-sm font-normal">of 5 days</span></p>
          </div>
          <div>
            <p className="text-sm opacity-80">Sick Leave</p>
            <p className="text-2xl font-bold">15 <span className="text-sm font-normal">of 15 days</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Leave Type *</label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20">
              <option>Select leave type</option>
              <option>Vacation Leave</option>
              <option>Sick Leave</option>
              <option>Emergency Leave</option>
              <option>Bereavement Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Leave Format *</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="p-4 border-2 border-brand bg-orange-50 rounded-xl text-center">
                <p className="font-bold text-gray-800">Whole Day</p>
                <p className="text-xs text-gray-500 mt-1">Full day leave (1.0 day)</p>
              </button>
              <button type="button" className="p-4 border-2 border-gray-200 bg-white rounded-xl text-center hover:border-gray-300">
                <p className="font-bold text-gray-800">Half Day</p>
                <p className="text-xs text-gray-500 mt-1">4 hours only (0.5 day)</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
              <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">End Date *</label>
              <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Reason *</label>
            <textarea 
              rows={4}
              placeholder="State your reason for leave..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onBack} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-light shadow-lg shadow-orange-100 transition-all">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OvertimeRequestForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to File Request</span>
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">File Overtime Request</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Request approval for overtime work</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Clock size={18} />
          Overtime Guidelines
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
          <li>Overtime must be pre-approved by your supervisor</li>
          <li>Maximum 4 hours of overtime per day</li>
          <li>Submit requests at least 1 day before the scheduled OT</li>
          <li>Provide detailed task description for approval</li>
        </ul>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Overtime Date *</label>
            <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Time *</label>
              <input type="time" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">End Time *</label>
              <input type="time" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Overtime *</label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20">
              <option>Select reason</option>
              <option>Project Deadline</option>
              <option>Bug Fixes</option>
              <option>Client Request</option>
              <option>System Maintenance</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Task Description *</label>
            <textarea 
              rows={4}
              placeholder="Describe the tasks you'll be working on during overtime..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onBack} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-light shadow-lg shadow-orange-100 transition-all">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OfficialBusinessRequestForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to File Request</span>
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">File Official Business Request</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Submit your official business travel request</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl">
        <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
          <Briefcase size={18} />
          Official Business Guidelines
        </h4>
        <ul className="text-sm text-orange-800 space-y-1 ml-6 list-disc">
          <li>Submit OB requests at least 3 days before travel date</li>
          <li>Provide complete itinerary and client information</li>
          <li>Include meeting minutes or purpose details</li>
          <li>Your email will be recorded for confirmation</li>
        </ul>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <form className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-start gap-3">
            <input type="checkbox" className="mt-1" />
            <div>
              <p className="font-bold text-purple-900 text-sm">Record my email address *</p>
              <p className="text-xs text-purple-700 mt-1">Your email will be included with your response for confirmation and updates (Required)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Employee Name *</label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20">
              <option>Select your name</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Client Name *</label>
            <input 
              type="text"
              placeholder="Enter client or company name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">From (Origin) *</label>
              <input 
                type="text"
                placeholder="e.g. Office, Home"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">To (Destination) *</label>
              <input 
                type="text"
                placeholder="e.g. Client Office, BGC"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Purpose of Official Business / Meeting Minutes *</label>
            <textarea 
              rows={4}
              placeholder="Describe the purpose of your official business or provide meeting minutes..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Date & Time *</label>
              <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">End Date & Time *</label>
              <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onBack} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-light shadow-lg shadow-orange-100 transition-all">
              Submit to Google Forms
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
