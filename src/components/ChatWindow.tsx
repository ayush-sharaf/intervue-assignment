import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { X, Send, MessageCircle, User } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  isTeacher: boolean;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isTeacher: boolean;
  userName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, isTeacher, userName }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Handle new chat messages
    const handleChatMessage = (message: Message) => {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(msg => msg.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    // Handle chat history
    const handleChatHistory = (history: Message[]) => {
      setMessages(history);
    };

    socket.on('chat-message', handleChatMessage);
    socket.on('chat-history', handleChatHistory);

    // Request chat history when socket connects or component mounts
    if (socket.connected) {
      socket.emit('get-chat-history');
    }

    return () => {
      socket.off('chat-message', handleChatMessage);
      socket.off('chat-history', handleChatHistory);
    };
  }, [socket]);

  // Request chat history when chat window opens
  useEffect(() => {
    if (isOpen && socket && socket.connected) {
      socket.emit('get-chat-history');
    }
  }, [isOpen, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim()) return;

    const messageData = {
      sender: userName,
      message: newMessage.trim(),
      isTeacher
    };

    socket.emit('send-chat-message', messageData);
    setNewMessage('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-50 rounded-t-lg">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 text-[#8F64E1] mr-2" />
          <h3 className="font-semibold text-gray-900">Chat</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === userName ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === userName
                    ? 'bg-[#8F64E1] text-white'
                    : 'bg-[#3A3A3B] text-white'
                }`}
              >
                <div className="flex items-center mb-1">
                  <User className="h-3 w-3 mr-1" />
                  <span className={`text-xs font-medium ${
                    message.isTeacher ? 'text-white' : 
                    message.sender === userName ? 'text-white' : 'text-gray-600'
                  }`}>
                    {message.sender} {message.isTeacher && '(Teacher)'}
                  </span>
                </div>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === userName ? 'text-white' : 'text-white'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg  focus:ring-[#8F64E1] focus:border-transparent text-sm"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-3 py-2 bg-[#8F64E1] text-white rounded-lg hover:bg-[#8F64E1] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;