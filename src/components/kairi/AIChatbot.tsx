import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, RefreshCw, PhoneCall, ShieldCheck, Zap } from "lucide-react";
import { sendChatMessage } from "@/lib/chat.server";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  cached?: boolean;
}

const QUICK_PROMPTS = [
  "What is Kairi?",
  "Recommend ceramic vases",
  "Shipping & Return policy",
  "Care instructions for linen",
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Namaste! ✦ Welcome to Kairi. I am your wabi-sabi design advisor. How may I help you curate your space today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    // Generate a unique session ID for rate limiting
    if (typeof window !== "undefined") {
      let storedId = sessionStorage.getItem("kairi.chatSessionId");
      if (!storedId) {
        storedId = `sess_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem("kairi.chatSessionId", storedId);
      }
      sessionIdRef.current = storedId;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, thinking]);

  // Subtle 3D audio sound box tone
  const playSoundEffect = (type: "open" | "receive") => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "open" ? 520 : 640, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === "open" ? 780 : 880, ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore audio context block policies
    }
  };

  const toggleChat = () => {
    if (!isOpen) playSoundEffect("open");
    setIsOpen(!isOpen);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || thinking) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setThinking(true);

    try {
      // Humanized 800ms typing delay as requested
      const [response] = await Promise.all([
        sendChatMessage({
          data: {
            message: query,
            sessionId: sessionIdRef.current,
          },
        }),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: response.answer,
        cached: response.cached,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      playSoundEffect("receive");
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: "I'm having a brief moment of reflection. Please reach out directly to our human care team at contact@kairihomedecor.in or call +91 98765 43210 and we'll assist you immediately. ✦",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  // 3D Hover tilt effect handler
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setTilt({ x: x * 12, y: y * -12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <>
      {/* 3D FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={toggleChat}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${isOpen ? 0.95 : 1})`,
            transition: "transform 0.2s ease-out",
          }}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-clay text-linen shadow-2xl ring-4 ring-linen/80 transition-all hover:bg-espresso focus:outline-none cursor-pointer"
          title="Kairi AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-clay via-amber-700/30 to-linen/20 opacity-80 blur-sm group-hover:opacity-100 transition-opacity" />
          {isOpen ? (
            <X size={22} className="relative z-10 text-linen transition-transform duration-200" />
          ) : (
            <div className="relative z-10 flex items-center justify-center">
              <Sparkles size={22} className="text-linen animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sage"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* INTERACTIVE CHAT MODAL WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] max-w-[400px] h-[520px] max-h-[80vh] flex flex-col rounded-3xl bg-linen border border-divider shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-divider bg-parchment/80 backdrop-blur px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="relative grid h-9 w-9 place-items-center rounded-full bg-clay text-linen shadow-warm-sm">
                <Bot size={18} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-sage ring-2 ring-linen" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-espresso leading-tight">
                  Kairi AI Assistant
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-taupe uppercase tracking-wider font-medium">
                  <ShieldCheck size={11} className="text-sage" />
                  Design Advisor · Groq Powered
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-espresso/60 hover:bg-parchment hover:text-espresso transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 leading-relaxed shadow-warm-sm ${
                    msg.sender === "user"
                      ? "bg-clay text-linen rounded-tr-xs"
                      : "bg-parchment/90 border border-divider text-espresso rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                <div className="mt-1 flex items-center gap-1.5 px-1 text-[9px] text-taupe">
                  <span>{msg.timestamp}</span>
                  {msg.cached && (
                    <span className="flex items-center gap-0.5 text-sage font-medium">
                      <Zap size={10} /> Fast Cache
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Bouncing 800ms Typing Indicator */}
            {thinking && (
              <div className="flex flex-col items-start">
                <div className="rounded-2xl rounded-tl-xs bg-parchment/90 border border-divider px-4 py-3 text-espresso shadow-warm-sm">
                  <div className="flex items-center gap-2 text-taupe text-xs">
                    <span className="font-medium text-espresso">Kairi is reflecting... ✦</span>
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-clay animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-clay animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-clay animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="border-t border-divider/60 bg-linen/50 px-3 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={thinking}
                  className="whitespace-nowrap rounded-full border border-divider bg-parchment/50 px-3 py-1 text-[10px] text-espresso/80 hover:bg-clay hover:text-linen transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-divider bg-parchment/40 p-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-divider bg-linen px-4 py-2 shadow-inner focus-within:border-clay">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about decor, care or shipping..."
                disabled={thinking}
                className="w-full bg-transparent text-xs text-espresso placeholder:text-taupe focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="grid h-7 w-7 place-items-center rounded-full bg-clay text-linen transition-colors hover:bg-espresso disabled:opacity-40 cursor-pointer"
              >
                <Send size={12} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
