'use client'
import React, { useState, useEffect } from 'react';
import  Link  from 'next/link';
import { useSocket } from '@/context/SocketContext';
import { Home, Plus, Users, Clock, History, UserX, BarChart3 } from 'lucide-react';
import CreatePollModal from '../../components/CreatePollModal';
import PollHistory from '../../components/PollHistory';
import ChatWindow from '../../components/ChatWindow';
import ChatButton from '../../components/ChatButton';
import Image from 'next/image';


interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  timeLimit: number;
  createdAt: number;
  isActive: boolean;
}

const TeacherDashboard: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-as-teacher');

    socket.on('current-poll', (poll) => {
      setCurrentPoll(poll);
      if (poll && poll.isActive) {
        const elapsed = (Date.now() - poll.createdAt) / 1000;
        setTimeRemaining(Math.max(0, poll.timeLimit - elapsed));
      }
    });

    socket.on('students-update', (studentsList) => {
      setStudents(studentsList);
    });

    socket.on('new-poll', (poll) => {
      setCurrentPoll(poll);
      setTimeRemaining(poll.timeLimit);
      setResults(null);
    });

    socket.on('poll-ended', (poll) => {
      setCurrentPoll(poll);
      setTimeRemaining(0);
    });

    socket.on('poll-results', (data) => {
      setResults(data);
    });

    // Handle chat message notifications
    const handleChatMessage = (message: any) => {
      if (!isChatOpen && message.sender !== 'Teacher') {
        setHasUnreadMessages(true);
      }
    };

    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('current-poll');
      socket.off('students-update');
      socket.off('new-poll');
      socket.off('poll-ended');
      socket.off('poll-results');
      socket.off('chat-message', handleChatMessage);
    };
  }, [socket, isChatOpen]);

  useEffect(() => {
    if (timeRemaining > 0 && currentPoll?.isActive) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, currentPoll?.isActive]);

  const handleCreatePoll = (pollData: any) => {
    if (socket) {
      socket.emit('create-poll', pollData);
      setShowCreateModal(false);
    }
  };

  const handleEndPoll = () => {
    if (socket && currentPoll) {
      socket.emit('end-poll');
    }
  };

  const handleKickStudent = (studentId: string) => {
    if (socket) {
      socket.emit('kick-student', studentId);
    }
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setHasUnreadMessages(false);
    }
  };

  const canCreateNewPoll = !currentPoll || !currentPoll.isActive;
  const answeredStudents = students.filter(s => s.hasAnswered).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Image src="/intervue.svg" alt="Intervue Logo" width={100} height={100} className="mr-3" />
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <div className="ml-4 px-3 py-1 bg-[#8F64E1] text-white rounded-full text-sm">
                {isConnected ? 'Connected' : 'Connecting...'}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <History className="h-5 w-5 mr-2" />
                History
              </button>
              <Link
                href="/"
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Poll Control Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Poll</h2>
                {canCreateNewPoll && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 bg-[#8F64E1] text-white rounded-lg hover:bg-[#665586] transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Poll
                  </button>
                )}
              </div>

              {currentPoll ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {currentPoll.question}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {currentPoll.isActive ? (
                          <span>Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                        ) : (
                          <span>Poll ended</span>
                        )}
                      </div>
                      <div>
                        Responses: {answeredStudents}/{students.length}
                      </div>
                    </div>
                  </div>

                  {currentPoll.isActive && (
                    <button
                      onClick={handleEndPoll}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      End Poll
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No active poll</p>
                  <p className="text-gray-400">Create a new poll to get started</p>
                </div>
              )}
            </div>

            {/* Poll Results */}
            {currentPoll && results && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Live Results</h3>
                <div className="space-y-4">
                  {results.results.map((option: any, index: number) => {
                    const percentage = results.totalVotes > 0 ? (option.votes / results.totalVotes) * 100 : 0;
                    const maxVotes = Math.max(...results.results.map((opt: any) => opt.votes));
                    const isWinning = option.votes === maxVotes && maxVotes > 0;
                    
                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${isWinning ? 'text-[#6766D5]' : 'text-gray-700'}`}>
                            {option.text}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {option.votes} vote{option.votes !== 1 ? 's' : ''}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isWinning ? 'bg-[#6766D5]' : getColorClass(index)
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-600">Total votes: {results.totalVotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Students Sidebar */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Students</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {students.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      student.hasAnswered ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{student.name}</span>
                  </div>
                  <button
                    onClick={() => handleKickStudent(student.id)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                    title="Remove student"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {students.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No students connected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Components */}
      <ChatButton 
        isOpen={isChatOpen} 
        onClick={handleChatToggle}
        hasUnreadMessages={hasUnreadMessages}
      />
      <ChatWindow 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        isTeacher={true}
        userName="Teacher"
      />

      {/* Modals */}
      {showCreateModal && (
        <CreatePollModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePoll}
        />
      )}

      {showHistory && (
        <PollHistory onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};

const getColorClass = (index: number) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
  ];
  return colors[index % colors.length];
};

export default TeacherDashboard;