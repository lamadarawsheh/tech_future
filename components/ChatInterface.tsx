import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
// import { GoogleGenAI } from "@google/genai";  // Temporarily disabled

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const ChatInterface: React.FC = () => {
  const { isAiModalOpen, toggleAiModal } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm the TechBlog AI. Ask me anything about our articles, coding, or tech trends.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiModalOpen]);

  // Handle Gemini API Call
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        // Safely access process.env to avoid ReferenceError in some browser environments
        const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
        
        if (!apiKey) {
            throw new Error("API Key not found");
        }
        
        // Temporarily disabled Google GenAI integration
        // const ai = new GoogleGenAI({ apiKey });
        
        // System context for the blog
        const systemInstruction = `You are a helpful and knowledgeable AI assistant for 'TechBlog Future'. 
        You specialize in software development, design systems, and emerging technology.
        Keep your answers concise, engaging, and relevant to a tech-savvy audience.
        If asked about the blog, describe it as a platform for decoding the future of tech.`;

        // Simulate a response since we've disabled the AI
        await new Promise(resolve => setTimeout(resolve, 1000));
        const aiText = "I'm sorry, the AI chat feature is currently unavailable. Please check back later.";

        const aiMessage: Message = {
            id: Date.now().toString(),
            role: 'model',
            text: aiText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
        console.error("AI Error:", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "Sorry, I'm having trouble connecting to my brain right now. Please check your API key configuration.",
            timestamp: new Date()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:px-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm sm:hidden pointer-events-auto" onClick={toggleAiModal}></div>
      <div className="bg-white dark:bg-slate-900 w-full sm:w-[400px] h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 pointer-events-auto overflow-hidden animate-[slideUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white font-display">TechBlog AI</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-medium text-slate-500">Online</span>
                    </div>
                </div>
            </div>
            <button onClick={toggleAiModal} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-primary text-white rounded-br-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm shadow-sm'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about tech..." 
                    className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:ring-0 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px] flex">send</span>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};