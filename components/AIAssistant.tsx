import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { Project, User as UserType } from '../types';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  user: UserType;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, projects, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 1, 
      text: `Hi ${user.name.split(' ')[0]}! I'm your Bonniface Assistant. I can check your project status, analyze budgets, or answer questions about our services. How can I help?`, 
      sender: 'ai' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  // Initialize Gemini Client
  useEffect(() => {
    if (!isOpen || chatSessionRef.current) return;

    try {
      // Safely access env var
      const getEnvVar = (key: string) => {
        let val = '';
        try { if ((import.meta as any)?.env?.[key]) val = (import.meta as any).env[key]; } catch {}
        if (!val) try { if (process?.env?.[key]) val = process.env[key] || ''; } catch {}
        if (!val && typeof window !== 'undefined') val = (window as any).process?.env?.[key] || '';
        return val ? val.trim() : '';
      };
      
      let apiKey = getEnvVar('VITE_GOOGLE_API_KEY');
      
      // Basic cleanup if the key has accidental text appended (common in copy-paste)
      if (apiKey.includes('placeholder')) {
         apiKey = apiKey.split('placeholder')[0].trim();
      }

      if (!apiKey) {
        console.error("VITE_GOOGLE_API_KEY is missing in .env.local");
        setMessages(prev => [...prev, { 
            id: Date.now(), 
            text: "System Error: API Key is missing. Please configure VITE_GOOGLE_API_KEY in your environment variables.", 
            sender: 'ai' 
        }]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      // Define Tools
      const listProjectsTool: FunctionDeclaration = {
        name: 'listProjects',
        description: 'List all projects associated with the current user, including their status, budget, and deadlines.',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      };

      const tools: Tool[] = [{ functionDeclarations: [listProjectsTool] }];

      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: `You are the Bonniface Assistant for the Bonniface Portal. 
          Your goal is to help clients manage their AI & Data Science projects.
          You are professional, concise, and helpful.
          Always use the 'listProjects' tool if the user asks about "my projects", "status", "budget", or "progress".
          Format currency in USD.
          Current User: ${user.name} (${user.role}).`,
          tools: tools,
        },
      });
    } catch (error) {
      console.error("Failed to initialize AI", error);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setIsThinking(true);

    try {
      if (!chatSessionRef.current) throw new Error("AI not initialized");

      // Send message to Gemini
      let result = await chatSessionRef.current.sendMessage({ message: userText });
      
      // Handle Function Calls (Agent Loop)
      // We loop in case the model wants to call multiple tools or the same tool multiple times
      while (result.functionCalls && result.functionCalls.length > 0) {
        const responseParts = result.functionCalls.map(call => {
          if (call.name === 'listProjects') {
            // Execute the tool logic
            return {
              functionResponse: {
                name: call.name,
                response: { 
                  result: projects.map(p => ({
                    title: p.title,
                    status: p.status,
                    budget: p.budget,
                    deadline: p.deadline
                  })) 
                },
                id: call.id
              }
            };
          }
          return { 
            functionResponse: {
              name: call.name,
              response: { error: 'Unknown function' },
              id: call.id
            }
          };
        });

        // Send tool results back to the model
        result = await chatSessionRef.current.sendMessage({
          message: responseParts
        });
      }

      // Display final response
      const responseText = result.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { id: Date.now(), text: responseText, sender: 'ai' }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: Date.now(), text: "I encountered an error connecting to the intelligence core. Please try again later.", sender: 'ai' }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      
      {/* Header */}
      <div className="p-4 bg-blue-600 dark:bg-cobalt-600 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Bonniface AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] opacity-90">Gemini 3 Pro</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-navy-950/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-slate-200 dark:bg-navy-700' : 'bg-blue-100 dark:bg-cobalt-500/20 text-blue-600 dark:text-cobalt-400'
              }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Sparkles size={14} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
             <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-cobalt-500/20 text-blue-600 dark:text-cobalt-400 flex items-center justify-center shrink-0">
                  <Loader2 size={14} className="animate-spin" />
                </div>
                <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 p-3 rounded-2xl rounded-bl-none shadow-sm">
                   <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                </div>
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shrink-0">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-navy-950 p-2 rounded-xl border border-transparent focus-within:border-blue-500 dark:focus-within:border-cobalt-500 transition-colors">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about projects, budgets..."
            disabled={isThinking}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isThinking}
            className="p-2 bg-blue-600 dark:bg-cobalt-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;