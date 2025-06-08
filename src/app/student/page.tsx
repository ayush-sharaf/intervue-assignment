'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSocket } from '@/context/SocketContext';
import { Home, Clock, User, CheckCircle, BarChart3 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from '../../components/ChatWindow';
import ChatButton from '../../components/ChatButton';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
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

const StudentInterface: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [studentName, setStudentName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isKicked, setIsKicked] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const getStudentId = () => {
    let studentId = sessionStorage.getItem('studentId');
    if (!studentId) {
      studentId = uuidv4();
      sessionStorage.setItem('studentId', studentId);
    }
    return studentId;
  };

  useEffect(() => {
    const savedName = sessionStorage.getItem('studentName');
    if (savedName) {
      setStudentName(savedName);
      setIsRegistered(true);
    }
  }, []);

  useEffect(() => {
    if (!socket || !isRegistered) return;

    const studentId = getStudentId();
    socket.emit('join-as-student', { studentId, name: studentName });

    socket.on('current-poll', (poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedOption('');
      setResults(null);
      
      if (poll && poll.isActive) {
        const elapsed = (Date.now() - poll.createdAt) / 1000;
        setTimeRemaining(Math.max(0, poll.timeLimit - elapsed));
      }
    });

    socket.on('new-poll', (poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedOption('');
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

    socket.on('kicked', () => {
      setIsKicked(true);
      sessionStorage.removeItem('studentName');
      sessionStorage.removeItem('studentId');
    });

    // Handle chat message notifications
    const handleChatMessage = (message: any) => {
      if (!isChatOpen && message.sender !== studentName) {
        setHasUnreadMessages(true);
      }
    };

    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('current-poll');
      socket.off('new-poll');
      socket.off('poll-ended');
      socket.off('poll-results');
      socket.off('kicked');
      socket.off('chat-message', handleChatMessage);
    };
  }, [socket, isRegistered, studentName, isChatOpen]);

  useEffect(() => {
    if (timeRemaining > 0 && currentPoll?.isActive && !hasAnswered) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, currentPoll?.isActive, hasAnswered]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      sessionStorage.setItem('studentName', studentName.trim());
      setIsRegistered(true);
    }
  };

  const handleSubmitAnswer = () => {
    if (socket && selectedOption && currentPoll) {
      socket.emit('submit-answer', { optionId: selectedOption });
      setHasAnswered(true);
    }
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setHasUnreadMessages(false);
    }
  };

  if (isKicked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Image src="/intervue.svg" alt="Intervue Logo" width={130} height={40} />
        </div>
        <h1 className="text-3xl font-semibold text-black mb-2">You’ve been Kicked out !</h1>
        <p className="text-gray-500 mb-8">
          Looks like the teacher had removed you from the poll system. Please try again sometime.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          Go Home
        </Link>
      </div>
    </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
          <Image src="/intervue.svg" alt="Intervue Logo" width={130} height={40} />
        </div>

        <h1 className="text-3xl font-semibold text-black mb-2">
          Let’s <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-600 mb-10 max-w-lg mx-auto">
          If you’re a student, you’ll be able to <strong>submit your answers</strong>, participate in live
          polls, and see how your responses compare with your classmates
        </p>

        <form onSubmit={handleRegister} className="max-w-md mx-auto">
          <label htmlFor="name" className="block text-left text-sm font-medium text-black mb-1">
            Enter your Name
          </label>
          <input
            type="text"
            id="name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-md text-left text-black mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your name"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold hover:opacity-90 transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Image src="/intervue.svg" alt="Intervue Logo" width={100} height={100} className="mr-3" />
            <div className="flex items-center">
              
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {studentName}!</h1>
              <div className="ml-4 px-3 py-1 bg-[#8F64E1] text-green-800 rounded-full text-sm">
                {isConnected ? 'Connected' : 'Connecting...'}
              </div>
            </div>
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

      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentPoll ? (
          <div className="space-y-6">
            {/* Current Poll */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Poll</h2>
                {currentPoll.isActive && !hasAnswered && timeRemaining > 0 && (
                  <div className="flex items-center text-orange-600 font-semibold">
                    <Clock className="h-5 w-5 mr-2" />
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {currentPoll.question}
                </h3>

                {currentPoll.isActive && !hasAnswered && timeRemaining > 0 ? (
                  <div className="space-y-3">
  {currentPoll.options.map((option, index) => (
    <label
      key={option.id}
      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selectedOption === option.id
          ? 'border-purple-500 bg-purple-100'
          : 'border-gray-300 bg-gray-200 hover:border-purple-300'
      }`}
    >
      <input
        type="radio"
        name="poll-option"
        value={option.id}
        checked={selectedOption === option.id}
        onChange={(e) => setSelectedOption(e.target.value)}
        className="sr-only"
      />
      <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center text-sm font-bold ${
        selectedOption === option.id
          ? 'border-purple-500 bg-purple-500 text-white'
          : 'border-gray-400 bg-white text-gray-600'
      }`}>
        {index + 1}
      </div>
      <span className="text-gray-900 font-medium text-lg">{option.text}</span>
    </label>
  ))}

  <button
    onClick={handleSubmitAnswer}
    disabled={!selectedOption}
    className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
  >
    Submit
  </button>
</div>
                ) : (
                  <div className="text-center py-8">
                    {hasAnswered ? (
                      <div>
                        <CheckCircle className="h-16 w-16 text-[#8F64E1] mx-auto mb-4" />
                        <p className="text-[#8F64E1] font-semibold text-lg">Answer submitted!</p>
                        <p className="text-gray-600">View results below</p>
                      </div>
                    ) : timeRemaining === 0 ? (
                      <div>
                        <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                        <p className="text-orange-600 font-semibold text-lg">Time's up!</p>
                        <p className="text-gray-600">View results below</p>
                      </div>
                    ) : (
                      <div>
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Poll has ended</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {(hasAnswered || timeRemaining === 0 || !currentPoll.isActive) && results && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Results</h3>
                <div className="space-y-4">
                  {results.results.map((option: any, index: number) => {
                    const percentage = results.totalVotes > 0 ? (option.votes / results.totalVotes) * 100 : 0;
                    const maxVotes = Math.max(...results.results.map((opt: any) => opt.votes));
                    const isWinning = option.votes === maxVotes && maxVotes > 0;
                    
                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${isWinning ? 'text-[#8F64E1]' : 'text-gray-700'}`}>
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
                              isWinning ? 'bg-[#8F64E1]' : getColorClass(index)
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
        ) : (
          <div className="min-h-1/2 flex flex-col items-center justify-center  text-center px-4 mt-20">
   
      

      {/* Loading Spinner */}
      <Loader2 className="h-14 w-14 text-purple-600 animate-spin mb-6" />

      {/* Message */}
      <h2 className="text-xl sm:text-2xl font-semibold text-black">
        Wait for the teacher to ask questions..
      </h2>
    </div>
        )}
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
        isTeacher={false}
        userName={studentName}
      />
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

export default StudentInterface;