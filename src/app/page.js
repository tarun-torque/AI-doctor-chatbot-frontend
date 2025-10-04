'use client'
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Stethoscope, User } from "lucide-react";

export default function DoctorBotChat() {
  const [messages, setMessages] = useState([
    { role: "bot", content: {
        greeting: "Hello 👋 I’m Doctor Bot. How can I assist with your health today?",
        possible_causes: "",
        self_care: "",
        when_to_see_doctor: "",
        closing: "Regards, AI Doctor Assistant"
      }
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();
      let botContent = data.answer || {
        greeting: "Hello!",
        possible_causes: "",
        self_care: "",
        when_to_see_doctor: "⚠️ No response from doctor assistant.",
        closing: "Regards, AI Doctor Assistant"
      };

      // Helper to clean JSON code block
      const cleanString = (str) => str.replace(/^```json\s*|```$/g, "").trim();

      // Parse if botContent is string
      if (typeof botContent === "string") {
        try {
          botContent = JSON.parse(cleanString(botContent));
        } catch {
          botContent = {
            greeting: "Hello!",
            possible_causes: botContent,
            self_care: "",
            when_to_see_doctor: "",
            closing: "Regards, AI Doctor Assistant"
          };
        }
      } else {
        // Check each field for JSON code block
        ["greeting", "possible_causes", "self_care", "when_to_see_doctor", "closing"].forEach(key => {
          if (typeof botContent[key] === "string" && botContent[key].startsWith("```json")) {
            try {
              const parsed = JSON.parse(cleanString(botContent[key]));
              botContent = { ...botContent, ...parsed };
            } catch {}
          }
        });
      }

      setMessages((prev) => [...prev, { role: "bot", content: botContent }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: {
            greeting: "Hello!",
            possible_causes: "",
            self_care: "",
            when_to_see_doctor: "⚠️ Something went wrong. Please try again.",
            closing: "Regards, AI Doctor Assistant"
          }
        }
      ]);
    }

    setLoading(false);
  };

  const renderBotMessage = (content) => (
    <div className="space-y-2">
      {content.greeting && <div className="font-semibold whitespace-pre-line">{content.greeting}</div>}
      {content.possible_causes && <div className="whitespace-pre-line"><strong>Possible Causes:</strong> {content.possible_causes}</div>}
      {content.self_care && <div className="whitespace-pre-line"><strong>Self-care / Advice:</strong> {content.self_care}</div>}
      {content.when_to_see_doctor && <div className="text-red-600 whitespace-pre-line"><strong>When to See a Doctor:</strong> {content.when_to_see_doctor}</div>}
      {content.closing && <div className="italic whitespace-pre-line">{content.closing}</div>}
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-blue-100 via-cyan-100 to-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
            <Stethoscope className="text-blue-600" size={26} />
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Doctor Bot</h1>
          <p className="text-xs opacity-80">Your AI health companion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-scroll flex-1 p-6 overflow-y-auto space-y-6 backdrop-blur-sm scroll-smooth">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "bot" && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow">
                <Stethoscope size={16} className="text-blue-600" />
              </div>
            )}
            <div
              className={`relative px-4 py-3 rounded-2xl text-sm shadow-lg backdrop-blur-md border
                ${msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none"
                  : "bg-white/80 text-gray-900 border-gray-200 rounded-bl-none"
                }`}
            >
              {msg.role === "user" ? msg.content : renderBotMessage(msg.content)}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow">
                <User size={16} className="text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow">
              <Stethoscope size={16} className="text-blue-600" />
            </div>
            <div className="bg-white/80 border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-md flex items-center gap-1">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:200ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:400ms]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 p-4 border-t bg-white/80 backdrop-blur-sm shadow-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your health question..."
          className="flex-1 p-3 border rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          disabled={!input.trim()}
          className={`p-3 rounded-full shadow-md transition 
            ${input.trim()
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          <Send size={20} />
        </motion.button>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-center md:gap-8 flex-col md:flex-row text-center text-xs text-gray-700 border-t bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner">
        <p className="font-medium">Developed by <span className="text-blue-600">Tarun</span></p>
        <p>📞 +91-8755024232</p>
        <p>📧 taruntejashwisharma3@gmail.com</p>
      </div>
    </div>
  );
}
