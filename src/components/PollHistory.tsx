'use client';
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

interface HistoricalPoll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  createdAt: number;
  endedAt: number;
  totalStudents: number;
  totalVotes: number;
}

interface PollHistoryProps {
  onClose: () => void;
}

const PollHistory: React.FC<PollHistoryProps> = ({ onClose }) => {
  const { socket } = useSocket();
  const [polls, setPolls] = useState<HistoricalPoll[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('poll-history', (history) => {
      setPolls(history);
    });

    socket.emit('get-poll-history');

    return () => {
      socket.off('poll-history');
    };
  }, [socket]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Poll History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex-col overflow-y-auto bg-white p-10 max-w-full items-center">
          <h2 className="text-3xl font-semibold mb-8 text-black">
            View <span className="font-bold ">Poll History</span>
          </h2>

          {polls.length === 0 && (
            <div className="text-gray-500 text-center py-20">No poll history available</div>
          )}

          {polls.map((poll, pollIndex) => {
            const totalVotes = poll.totalVotes || 1;

            return (
              <div key={poll.id} className="mb-12">
                <h3 className="text-lg font-semibold mb-2 text-black">Question {pollIndex + 1}</h3>

                <div className="border border-purple-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white px-5 py-3 font-medium text-left">
                    {poll.question}
                  </div>

                  <div className="space-y-4 p-4">
                    {poll.options.map((option, index) => {
                      const percent = Math.round((option.votes / totalVotes) * 100);
                      return (
                        <div key={option.id} className="bg-gray-50 rounded-md overflow-hidden border">
                          <div className="flex items-center relative h-12">
                            {/* Progress Bar */}
                            <div
                              className="absolute top-0 left-0 h-full bg-purple-500 transition-all"
                              style={{ width: `${percent}%`, zIndex: 1 }}
                            />

                            {/* Content */}
                            <div className="relative z-10 flex items-center justify-between w-full px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <span className="font-medium text-gray-800">{option.text}</span>
                              </div>
                              <div className="text-sm font-semibold text-black">
                                {percent}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PollHistory;
