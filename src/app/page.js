'use client'
import { useState, useEffect, useRef } from "react";
import { Send, Stethoscope, User, AlertCircle, Sparkles, Heart, Clock, Activity, Pill, AlertTriangle, CheckCircle2, Trash2, Download, Menu, X } from "lucide-react";

export default function HealthCompanionChat() {
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      content: {
        greeting: "Hello 👋 I'm your AI Health Companion. I'm here to help answer your health questions and provide general guidance. How can I assist you today?",
        possible_causes: "",
        self_care: "",
        when_to_see_doctor: "",
        closing: ""
      },
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([
      { 
        role: "bot", 
        content: {
          greeting: "Hello 👋 I'm your AI Health Companion. I'm here to help answer your health questions and provide general guidance. How can I assist you today?",
          possible_causes: "",
          self_care: "",
          when_to_see_doctor: "",
          closing: ""
        },
        timestamp: new Date()
      },
    ]);
    setShowMenu(false);
  };

  const exportChat = () => {
    const chatText = messages.map(msg => {
      if (msg.role === "user") {
        return `You (${formatTime(msg.timestamp)}):\n${msg.content}\n`;
      } else {
        const content = msg.content;
        let text = `AI Health Companion (${formatTime(msg.timestamp)}):\n`;
        if (content.greeting) text += `${content.greeting}\n\n`;
        if (content.possible_causes) text += `Possible Causes:\n${content.possible_causes}\n\n`;
        if (content.self_care) text += `Self-care & Advice:\n${content.self_care}\n\n`;
        if (content.when_to_see_doctor) text += `When to See a Doctor:\n${content.when_to_see_doctor}\n\n`;
        return text;
      }
    }).join('\n---\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();
      let botContent = data.answer || {
        greeting: "I apologize, but I'm having trouble processing your request right now.",
        possible_causes: "",
        self_care: "",
        when_to_see_doctor: "If you have urgent health concerns, please contact a healthcare provider immediately.",
        closing: ""
      };

      const cleanString = (str) => str.replace(/^```json\s*|```$/g, "").trim();

      if (typeof botContent === "string") {
        try {
          botContent = JSON.parse(cleanString(botContent));
        } catch {
          botContent = {
            greeting: "",
            possible_causes: botContent,
            self_care: "",
            when_to_see_doctor: "",
            closing: ""
          };
        }
      } else {
        ["greeting", "possible_causes", "self_care", "when_to_see_doctor", "closing"].forEach(key => {
          if (typeof botContent[key] === "string" && botContent[key].startsWith("```json")) {
            try {
              const parsed = JSON.parse(cleanString(botContent[key]));
              botContent = { ...botContent, ...parsed };
            } catch {}
          }
        });
      }

      if (botContent.closing) {
        botContent.closing = "";
      }

      setMessages((prev) => [...prev, { role: "bot", content: botContent, timestamp: new Date() }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { 
          role: "bot", 
          content: {
            greeting: "",
            possible_causes: "",
            self_care: "",
            when_to_see_doctor: "⚠️ I'm experiencing technical difficulties. Please try again in a moment. If you have urgent health concerns, contact a healthcare provider immediately.",
            closing: ""
          },
          timestamp: new Date()
        }
      ]);
    }

    setLoading(false);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const quickPrompts = [
    { icon: Activity, text: "I have a headache", color: "blue" },
    { icon: Pill, text: "Common cold symptoms", color: "purple" },
    { icon: Heart, text: "Stress management", color: "pink" },
    { icon: AlertTriangle, text: "First aid advice", color: "orange" },
  ];

  const handleQuickPrompt = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const renderBotMessage = (content) => {
    const hasContent = content.greeting || content.possible_causes || content.self_care || content.when_to_see_doctor;
    
    if (!hasContent) return null;

    return (
      <div className="space-y-3">
        {content.greeting && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex-1 font-medium text-gray-800 text-sm sm:text-base whitespace-pre-line leading-relaxed">{content.greeting}</div>
          </div>
        )}
        
        {content.possible_causes && (
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-full filter blur-2xl opacity-20"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <strong className="text-blue-900 text-sm sm:text-base">Possible Causes</strong>
              </div>
              <div className="text-gray-700 text-xs sm:text-sm whitespace-pre-line leading-relaxed pl-9">{content.possible_causes}</div>
            </div>
          </div>
        )}
        
        {content.self_care && (
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-green-200/50 hover:border-green-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-full filter blur-2xl opacity-20"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-3.5 h-3.5 text-white" />
                </div>
                <strong className="text-green-900 text-sm sm:text-base">Self-care & Tips</strong>
              </div>
              <div className="text-gray-700 text-xs sm:text-sm whitespace-pre-line leading-relaxed pl-9">{content.self_care}</div>
            </div>
          </div>
        )}
        
        {content.when_to_see_doctor && (
          <div className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-red-200/50 hover:border-red-300 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-200 rounded-full filter blur-2xl opacity-20"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                </div>
                <strong className="text-red-900 text-sm sm:text-base">See a Doctor If</strong>
              </div>
              <div className="text-red-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-medium pl-9">{content.when_to_see_doctor}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const showQuickPrompts = messages.length === 1 && !loading;

  return (
    <div className="flex flex-col h-screen w-full max-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background - reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 sm:opacity-60">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header - Mobile Optimized - Fixed Position */}
      <div className="relative z-50 flex items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4 border-b bg-white shadow-md flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Stethoscope className="text-white" size={20} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full">
              <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-base sm:text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">AI Health Companion</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span className="truncate">Online • By Tarun</span>
            </p>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 sm:p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 transition-all active:scale-95 flex-shrink-0"
        >
          {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Dropdown Menu - Mobile Friendly */}
      {showMenu && (
        <div className="relative z-40 bg-white border-b shadow-lg animate-fadeIn flex-shrink-0">
          <div className="flex flex-col">
            <button
              onClick={exportChat}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Export Chat</span>
            </button>
            <button
              onClick={clearChat}
              className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 active:bg-red-100 transition-colors text-left border-t"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">Clear Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages - Mobile Optimized */}
      <div className="relative z-10 flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto scroll-smooth overscroll-contain min-h-0">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-4">
          {/* Quick Prompts - Mobile Grid */}
          {showQuickPrompts && (
            <div className="animate-fadeIn">
              <p className="text-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 px-2">Quick suggestions to get started:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 active:border-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 active:scale-98"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors flex-shrink-0">
                      <prompt.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 text-left">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              {msg.role === "bot" && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md sm:shadow-lg flex-shrink-0 mb-8 sm:mb-10">
                  <Stethoscope size={16} className="text-white" />
                </div>
              )}
              
              <div className="flex flex-col max-w-[85%] sm:max-w-xl md:max-w-2xl">
                <div
                  className={`relative px-3 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl text-sm shadow-lg transition-all
                    ${msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                    }`}
                >
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-line leading-relaxed text-sm sm:text-base">{msg.content}</div>
                  ) : (
                    renderBotMessage(msg.content)
                  )}
                </div>
                
                <div className={`flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 px-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-md sm:shadow-lg flex-shrink-0 mb-8 sm:mb-10">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator - Mobile Optimized */}
          {loading && (
            <div className="flex items-end gap-2 sm:gap-3 animate-fadeIn">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md sm:shadow-lg mb-2">
                <Stethoscope size={16} className="text-white animate-pulse" />
              </div>
              <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl rounded-bl-sm px-4 py-3 sm:px-6 sm:py-4 shadow-lg sm:shadow-xl flex items-center gap-2 sm:gap-3">
                <div className="flex gap-1 sm:gap-1.5">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium hidden xs:inline">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Mobile Optimized */}
      <div className="relative z-30 flex flex-col border-t bg-white shadow-2xl flex-shrink-0">
        <div className="flex items-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 max-w-4xl mx-auto w-full">
          <div className={`flex-1 relative transition-all duration-200 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Describe your symptoms..."
              rows={1}
              className="w-full p-3 sm:p-4 pr-12 sm:pr-16 border-2 border-gray-200 rounded-xl sm:rounded-2xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 shadow-lg transition-all resize-none min-h-[48px] max-h-[120px]"
              style={{ scrollbarWidth: 'thin' }}
            />
            {input.length > 0 && (
              <div className={`absolute right-3 sm:right-4 bottom-3 sm:bottom-4 text-xs font-medium transition-colors ${input.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                {input.length}
              </div>
            )}
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-200 transform active:scale-95 mb-0.5 flex-shrink-0
              ${input.trim() && !loading
                ? "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white hover:shadow-xl active:shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Send size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        </div>
        
        {/* Disclaimer - Mobile Optimized */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 text-center text-xs bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-t-2 border-amber-200 pb-safe">
          <div className="flex items-start sm:items-center justify-center gap-2 max-w-4xl mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse mt-0.5 sm:mt-0" />
            <span className="text-gray-700 text-left sm:text-center leading-relaxed">
              <strong className="text-amber-700">Important:</strong> This AI provides general health information only. Always consult a healthcare provider for medical advice.
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .pb-safe {
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
        }
        @media (max-width: 640px) {
          .active\:scale-98:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
}