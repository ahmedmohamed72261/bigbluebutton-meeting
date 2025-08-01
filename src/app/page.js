'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

export default function Home() {
  const [meetingForm, setMeetingForm] = useState({
    meetingID: '',
    meetingName: '',
    moderatorName: '',
    roomType: 'meeting'
  });

  // Generate automatic meeting ID
  const generateMeetingID = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `meeting-${timestamp}-${random}`;
  };

  // Auto-generate meeting ID when component mounts or when requested
  useEffect(() => {
    if (!meetingForm.meetingID) {
      setMeetingForm(prev => ({
        ...prev,
        meetingID: generateMeetingID()
      }));
    }
  }, []);
  const [joinForm, setJoinForm] = useState({
    meetingID: '',
    fullName: '',
    role: 'attendee'
  });
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  // Load existing meetings on component mount
  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  const createMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Meeting created successfully! Meeting ID: ${data.meetingID}`);
        setMeetingForm({
          meetingID: generateMeetingID(),
          meetingName: '',
          moderatorName: '',
          roomType: 'meeting'
        });
        loadMeetings(); // Refresh meetings list
        
        // Auto-join as moderator
        if (data.moderatorJoinUrl) {
          window.open(data.moderatorJoinUrl, '_blank');
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/meetings/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(joinForm),
      });

      const data = await response.json();

      if (response.ok) {
        window.open(data.joinUrl, '_blank');
        setMessage('Joining meeting...');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const endMeeting = async (meetingID) => {
    if (!confirm('Are you sure you want to end this meeting?')) return;

    try {
      const response = await fetch('/api/meetings/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingID }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Meeting ended successfully');
        loadMeetings();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              BigBlueButton Meeting Platform
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create and join virtual meetings with BigBlueButton integration
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-100 border border-red-400 text-red-700' 
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
              }`}
            >
              Create Meeting
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'join'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
              }`}
            >
              Join Meeting
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'
              }`}
            >
              Manage Meetings
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Create Meeting Tab */}
          {activeTab === 'create' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Meeting</h2>
              <form onSubmit={createMeeting} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meeting ID (Auto-generated)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={meetingForm.meetingID}
                        onChange={(e) => setMeetingForm({...meetingForm, meetingID: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g., meeting-123"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setMeetingForm({...meetingForm, meetingID: generateMeetingID()})}
                        className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                        title="Generate new meeting ID"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meeting Name
                    </label>
                    <input
                      type="text"
                      value={meetingForm.meetingName}
                      onChange={(e) => setMeetingForm({...meetingForm, meetingName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Team Standup"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name (Moderator)
                    </label>
                    <input
                      type="text"
                      value={meetingForm.moderatorName}
                      onChange={(e) => setMeetingForm({...meetingForm, moderatorName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Type
                    </label>
                    <select
                      value={meetingForm.roomType}
                      onChange={(e) => setMeetingForm({...meetingForm, roomType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="classroom">Classroom</option>
                      <option value="webinar">Webinar</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create & Join Meeting'}
                </button>
              </form>
            </div>
          )}

          {/* Join Meeting Tab */}
          {activeTab === 'join' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Join Existing Meeting</h2>
              <form onSubmit={joinMeeting} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meeting ID
                    </label>
                    <input
                      type="text"
                      value={joinForm.meetingID}
                      onChange={(e) => setJoinForm({...joinForm, meetingID: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter meeting ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={joinForm.fullName}
                      onChange={(e) => setJoinForm({...joinForm, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Join as
                    </label>
                    <select
                      value={joinForm.role}
                      onChange={(e) => setJoinForm({...joinForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="attendee">Attendee</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : 'Join Meeting'}
                </button>
              </form>
            </div>
          )}

          {/* Manage Meetings Tab */}
          {activeTab === 'manage' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Meetings</h2>
                <button
                  onClick={loadMeetings}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Refresh
                </button>
              </div>
              
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No active meetings</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new meeting.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {meeting.meetingName || meeting.meetingID}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Meeting ID: {meeting.meetingID}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Participants: {meeting.participantCount || 0}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setJoinForm({...joinForm, meetingID: meeting.meetingID})}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Join
                          </button>
                          <button
                            onClick={() => endMeeting(meeting.meetingID)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            End
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p>Powered by BigBlueButton Virtual Classroom Software</p>
          <a 
            href="https://bigbluebutton.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Learn more about BigBlueButton
          </a>
        </footer>
      </div>
    </div>
  );
}
