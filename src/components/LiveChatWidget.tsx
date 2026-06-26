import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Mail, 
  ShieldAlert,
  Loader2
} from "lucide-react";
import { ChatMessage } from "../types";
import { listenToMessages, sendChatMessage, clearSessionUnread } from "../lib/db";

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Registration state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [sessionId, setSessionId] = useState("");

  // Messaging state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [unreadAlert, setUnreadAlert] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check localStorage for previous session
  useEffect(() => {
    const savedName = localStorage.getItem("chat_client_name");
    const savedEmail = localStorage.getItem("chat_client_email");
    const savedSessionId = localStorage.getItem("chat_session_id");

    if (savedName && savedSessionId) {
      setClientName(savedName);
      if (savedEmail) setClientEmail(savedEmail);
      setSessionId(savedSessionId);
      setIsRegistered(true);
    }
  }, []);

  // Listen to messages once session is active and widget is open
  useEffect(() => {
    if (!sessionId || !isRegistered) return;

    // Listen to firestore changes
    const unsubscribe = listenToMessages(sessionId, (msgs) => {
      setMessages(msgs);
      
      // If widget is closed, and we get a new message from admin, trigger unread alert
      if (!isOpen && msgs.length > 0 && msgs[msgs.length - 1].sender === "admin") {
        setUnreadAlert(true);
      }
    });

    return () => unsubscribe();
  }, [sessionId, isRegistered, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const newSessionId = `chat-${Date.now()}`;
    
    localStorage.setItem("chat_client_name", clientName);
    localStorage.setItem("chat_client_email", clientEmail || "");
    localStorage.setItem("chat_session_id", newSessionId);

    setSessionId(newSessionId);
    setIsRegistered(true);

    // Send initial greeting message from user to notify admins
    sendChatMessage(
      newSessionId,
      clientName,
      clientEmail || undefined,
      "client",
      `Hello! I just started a live support session. I'd like to ask a question.`
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !sessionId) return;

    setIsSending(true);
    const msgText = newMessageText;
    setNewMessageText("");

    try {
      await sendChatMessage(
        sessionId,
        clientName,
        clientEmail || undefined,
        "client",
        msgText
      );
    } catch (err) {
      console.error("Error sending chat message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const toggleWidget = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setUnreadAlert(false);
      if (sessionId) {
        clearSessionUnread(sessionId);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="live-chat-widget">
      
      {/* 1. CHAT BALLOON BUTTON */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="relative h-14 w-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border border-slate-200"
          id="chat-floating-balloon"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadAlert && (
            <span className="absolute top-0 right-0 h-4.5 w-4.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce border-2 border-white">
              1
            </span>
          )}
        </button>
      )}

      {/* 2. CHAT PANEL CONSOLE */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden" id="chat-expanded-console">
          
          {/* Header */}
          <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="h-9 w-9 bg-white border border-slate-200 rounded-xl text-white font-bold flex items-center justify-center overflow-hidden p-0.5">
                  <img 
                    src="/TSDC.png" 
                    alt="Logo" 
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h4 className="text-[10px] font-black tracking-wider text-slate-950 uppercase">TSDC Support Terminal</h4>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Engineers Active</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={toggleWidget}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col justify-between">
            
            {!isRegistered ? (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4 my-auto" id="chat-registration-form">
                <div className="text-center space-y-2 mb-4">
                  <h5 className="text-sm font-bold text-slate-900">Start Direct Consultation</h5>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Secure real-time tunnel directly into our admin dashboards. Provide contact specs to start chat.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., Alex Carter"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-800 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 font-mono">Your Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="client@company.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-800 shadow-2xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white font-semibold hover:bg-slate-800 rounded-lg text-xs tracking-wider uppercase shadow-xs transition-all cursor-pointer"
                >
                  Establish Secure Connection
                </button>
              </form>
            ) : (
              /* ACTIVE MESSAGES CONSOLE */
              <div className="flex-1 flex flex-col justify-between h-full space-y-4" id="chat-messages-container">
                
                {/* Messages Lists Scroll */}
                <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[350px] pr-1">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 flex items-start gap-1.5 leading-normal">
                    <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Secure End-to-End Handshake initialized. Your chat is active in TSDC's Real-time Firestore.</span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left space-y-1">
                        <p className="font-bold text-slate-800">Welcome to TSDC Live Support!</p>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Our engineering support pipeline is fully operational. Type a message below to consult with our team instantly!
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender === "client";
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                              isMe 
                                ? "bg-blue-600 text-white rounded-br-none font-medium" 
                                : "bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none"
                            }`}
                          >
                            <p className="leading-relaxed break-words">{msg.text}</p>
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono mt-1 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Footer Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 pt-3 bg-white">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-2 text-xs text-slate-800 shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessageText.trim()}
                    className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-850 disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
