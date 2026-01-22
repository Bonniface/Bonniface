import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User } from '../types';
import { Send, Paperclip, Search, MoreVertical, FileText, Image, Phone, Video, ChevronLeft, Loader2, X, Download } from 'lucide-react';
import * as api from '../lib/api';
import { supabase } from '../lib/supabaseClient';

interface ChatInterfaceProps {
  sessions: ChatSession[];
  currentUser: User;
  onRefresh?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessions, currentUser, onRefresh }) => {
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Auto-scroll to bottom
  useEffect(() => {
     if (activeSessionId) {
         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
     }
  }, [activeSession, activeSessionId, attachedFile]); // Also scroll when file attached to see preview

  // Mark as Read when opening session
  useEffect(() => {
      if (activeSessionId) {
          api.markRoomAsRead(activeSessionId, currentUser.id).then(() => {
              // Trigger refresh to update unread counts in sidebar
              if (onRefresh) onRefresh();
          });
      }
  }, [activeSessionId, currentUser.id]);

  // Realtime Subscription
  useEffect(() => {
      // Listen to ALL messages to update sidebar counts even if not active
      const channel = supabase
        .channel(`public:messages`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
        }, (payload) => {
            // If the message is relevant to us (we are not sender)
            if (payload.new.user_id !== currentUser.id) {
                // If it's for the ACTIVE room, mark as read immediately
                if (payload.new.room_id === activeSessionId) {
                    api.markRoomAsRead(activeSessionId, currentUser.id);
                }
                // Refresh to show new message or update counts
                if (onRefresh) onRefresh();
            } else {
                // Sent by me (maybe from another device), refresh to see it
                if (onRefresh) onRefresh();
            }
        })
        .subscribe();

      return () => {
          supabase.removeChannel(channel);
      };
  }, [activeSessionId, currentUser.id, onRefresh]);

  const handleSessionClick = (id: string) => {
    setActiveSessionId(id);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setAttachedFile(e.target.files[0]);
      }
  };

  const handleSendMessage = async () => {
      if ((!newMessage.trim() && !attachedFile) || !activeSessionId || isSending) return;

      setIsSending(true);
      try {
          await api.sendMessage(activeSessionId, currentUser.id, newMessage, attachedFile || undefined);
          setNewMessage('');
          setAttachedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          if (onRefresh) onRefresh();
      } catch (error) {
          console.error('Failed to send message:', error);
          alert('Failed to send message. Please try again.');
      } finally {
          setIsSending(false);
      }
  };

  if (!activeSession && sessions.length === 0) {
      return (
          <div className="h-screen flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-navy-950">
              <div className="text-center">
                  <p className="mb-4">No active conversations.</p>
                  {currentUser.role !== 'ADMIN' && (
                      <p className="text-sm">Start a project to chat with our team.</p>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-navy-950 pt-16 lg:pt-4 pb-4 pr-4 pl-4 lg:pl-0 transition-colors duration-300">
      
      {/* Sidebar List */}
      <div className={`${showMobileChat ? 'hidden' : 'flex'} lg:flex w-full lg:w-80 border-r lg:border-r border-slate-200 dark:border-navy-800 flex-col bg-white dark:bg-navy-900/50 rounded-2xl lg:rounded-r-none lg:rounded-l-2xl shadow-sm dark:shadow-none h-full`}>
        <div className="p-4 border-b border-slate-200 dark:border-navy-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pl-8 lg:pl-0">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-slate-300 pl-10 pr-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-blue-500 dark:focus:border-cobalt-500 text-sm outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => handleSessionClick(session.id)}
              className={`p-4 border-b border-slate-100 dark:border-navy-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors ${
                activeSessionId === session.id 
                  ? 'bg-blue-50 dark:bg-navy-800 border-l-2 border-l-blue-600 dark:border-l-cobalt-500' 
                  : 'border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex gap-3">
                <img src={session.participantAvatar} alt="" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-navy-700 object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session.participantName}</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{session.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <p className={`text-xs truncate flex-1 ${session.unreadCount > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                        {session.lastMessage}
                      </p>
                      {session.unreadCount > 0 && (
                          <span className="ml-2 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full">
                              {session.unreadCount}
                          </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {activeSession ? (
        <div className={`${!showMobileChat ? 'hidden' : 'flex'} lg:flex flex-1 flex-col bg-white dark:bg-navy-900 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl border border-l-0 border-slate-200 dark:border-navy-800 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300 h-full`}>
            {/* Header */}
            <div className="h-16 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-navy-900 z-10">
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleBackToList}
                    className="lg:hidden p-1 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <ChevronLeft size={24} />
                </button>

                <img src={activeSession.participantAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeSession.participantName}</h3>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Online</span>
                </div>
                </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4 text-slate-400 dark:text-slate-400">
                <button className="hover:text-blue-600 dark:hover:text-white p-2"><Phone size={20} /></button>
                <button className="hover:text-blue-600 dark:hover:text-white p-2"><Video size={20} /></button>
                <button className="hover:text-blue-600 dark:hover:text-white p-2"><MoreVertical size={20} /></button>
            </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-slate-50 dark:bg-navy-900/50">
            {activeSession.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] lg:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                        isMe 
                        ? 'bg-blue-600 dark:bg-cobalt-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700 rounded-tl-sm'
                    }`}>
                        {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                        
                        {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`space-y-2 ${msg.content ? 'mt-3' : ''}`}>
                            {msg.attachments.map((file, idx) => (
                                <div key={idx}>
                                    {file.type === 'img' ? (
                                        <div className="rounded-lg overflow-hidden border border-white/20">
                                            <img src={file.url} alt="attachment" className="max-w-full h-auto max-h-64 object-cover" />
                                        </div>
                                    ) : (
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-2 rounded-lg ${isMe ? 'bg-blue-700 dark:bg-cobalt-700' : 'bg-slate-100 dark:bg-navy-900'} bg-opacity-50 hover:bg-opacity-80 transition-all cursor-pointer`}>
                                            <div className="p-2 rounded bg-white/10 dark:bg-white/10 text-current">
                                                <FileText size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">Document</p>
                                                <p className="text-[10px] opacity-70 uppercase">PDF</p>
                                            </div>
                                            <Download size={14} className="opacity-70" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.timestamp}</span>
                        {isMe && msg.isRead && (
                            <span className="text-[10px] text-blue-400 font-medium">Read</span>
                        )}
                    </div>
                    </div>
                </div>
                );
            })}
            <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview Area */}
            {attachedFile && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-navy-800 rounded-lg text-blue-600 dark:text-blue-400">
                            {attachedFile.type.startsWith('image/') ? <Image size={18} /> : <FileText size={18} />}
                        </div>
                        <div className="text-xs">
                            <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{attachedFile.name}</p>
                            <p className="text-slate-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-navy-800 rounded-full text-slate-500 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800">
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-navy-950 p-2 rounded-xl border border-transparent focus-within:border-blue-500 dark:focus-within:border-cobalt-500 transition-colors">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-white dark:hover:bg-navy-800 rounded-lg transition-colors"
                >
                    <Paperclip size={20} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
                
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isSending}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && !attachedFile) || isSending}
                    className={`p-2 rounded-lg transition-all ${
                        (newMessage.trim() || attachedFile)
                        ? 'bg-blue-600 dark:bg-cobalt-600 text-white shadow-lg shadow-blue-600/20 dark:shadow-cobalt-600/20' 
                        : 'bg-slate-200 dark:bg-navy-800 text-slate-400 dark:text-slate-500'
                    }`}
                >
                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>
            </div>
        </div>
      ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-slate-400 bg-slate-50 dark:bg-navy-900/30 rounded-r-2xl">
              Select a conversation to start messaging
          </div>
      )}
    </div>
  );
};

export default ChatInterface;