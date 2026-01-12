import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { sendMessage, getQuickSuggestions, ChatMessage } from '../services/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestedArticles?: {
    title: string;
    slug: string;
    excerpt: string;
  }[];
}

export const ChatInterface: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isAiModalOpen, toggleAiModal, isDarkMode } = useStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: t('chat.welcome'),
      timestamp: new Date()
    }
  ]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => prev.map(msg =>
      msg.id === 'welcome' ? { ...msg, text: t('chat.welcome') } : msg
    ));
  }, [i18n.language, t]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickSuggestions = getQuickSuggestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiModalOpen]);

  useEffect(() => {
    if (isAiModalOpen) {
      inputRef.current?.focus();
    }
  }, [isAiModalOpen]);

  // Convert messages to API format
  const getMessageHistory = (): ChatMessage[] => {
    return messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
  };

  const handleSend = async (e?: React.FormEvent, customMessage?: string) => {
    e?.preventDefault();
    const messageText = customMessage || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await sendMessage(getMessageHistory(), messageText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.message,
        timestamp: new Date(),
        suggestedArticles: response.suggestedArticles
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: t('chat.error'),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(undefined, suggestion);
  };

  const handleArticleClick = (slug: string) => {
    toggleAiModal();
    navigate(`/article/${slug}`);
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      text: t('chat.welcome'),
      timestamp: new Date()
    }]);
    setShowSuggestions(true);
  };

  // Parse markdown-like formatting
  const formatMessage = (text: string) => {
    // Bold text
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    // Bullet points
    formatted = formatted.replace(/^• /gm, '<span class="text-primary mr-1">•</span>');
    // Line breaks
    formatted = formatted.split('\n').join('<br/>');
    return formatted;
  };

  if (!isAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end sm:px-6 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={toggleAiModal}
      />

      {/* Chat Window */}
      <div className={`relative w-full sm:w-[420px] h-[85vh] sm:h-[650px] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden ${isDarkMode
          ? 'bg-slate-900 border border-slate-700/50'
          : 'bg-white border border-slate-200'
        }`}
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white/90'
          } backdrop-blur-md sticky top-0 z-10`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-secondary to-purple-500 text-white shadow-lg shadow-primary/25">
                <span className="material-symbols-outlined text-[22px]">smart_toy</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>
            <div>
              <h3 className={`font-bold font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('chat.header')}
              </h3>
              <p className="text-xs text-emerald-500 font-medium">{t('chat.status')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className={`p-2 rounded-xl transition-colors ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                }`}
              title="Clear chat"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <button
              onClick={toggleAiModal}
              className={`p-2 rounded-xl transition-colors ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50'
          }`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Avatar for AI messages */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[14px]">smart_toy</span>
                    </div>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t('chat.aiAssistant')}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-md shadow-lg shadow-primary/20'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-md'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm'
                  }`}>
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />

                  {/* Suggested Articles */}
                  {msg.suggestedArticles && msg.suggestedArticles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600/30 space-y-2">
                      {msg.suggestedArticles.map((article, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleArticleClick(article.slug)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all ${isDarkMode
                              ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50'
                              : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-primary text-lg mt-0.5">article</span>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {article.title}
                              </p>
                              <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {t('chat.clickToRead')}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'} ${isDarkMode ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${isDarkMode
                  ? 'bg-slate-800 border border-slate-700'
                  : 'bg-white border border-slate-200 shadow-sm'
                }`}>
                <div className="flex gap-1.5 items-center">
                  <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${isDarkMode ? 'bg-primary' : 'bg-primary'}`}></span>
                  <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${isDarkMode ? 'bg-secondary' : 'bg-secondary'}`}></span>
                  <span className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-purple-500' : 'bg-purple-500'}`}></span>
                  <span className={`text-xs ml-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('chat.thinking')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {showSuggestions && messages.length <= 1 && (
          <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white/50'
            }`}>
            <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('chat.tryAsking')}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.slice(0, 3).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                    }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
          }`}>
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder')}
                className={`w-full h-12 rounded-xl border-2 pl-4 pr-12 text-sm transition-all ${isDarkMode
                    ? 'bg-slate-800 border-slate-700 focus:border-primary focus:bg-slate-800 text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white text-slate-900 placeholder:text-slate-400'
                  } focus:ring-2 focus:ring-primary/20 focus:outline-none`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] flex">
                  {isLoading ? 'hourglass_empty' : 'send'}
                </span>
              </button>
            </div>
          </form>
          <p className={`text-[10px] text-center mt-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            {t('chat.disclaimer')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
