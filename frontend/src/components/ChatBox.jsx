import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, AlertTriangle, Bug, CheckCircle2 } from 'lucide-react';

const QUICK_PROMPTS = [
  "🚨 I think checkout broke after the last change!",
  "🧪 Let's run tests again to verify.",
  "👀 Who modified the core logic?",
  "✅ Fixed the syntax bug, please check."
];

export default function ChatBox({
  messages = [],
  onSendMessage,
  player,
  isCompact = false,
  title = "MISSION CHAT & DEBATE"
}) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleQuickPrompt = (promptText) => {
    onSendMessage(promptText);
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl bg-[#0d121d] border border-slate-800 shadow-xl overflow-hidden ${isCompact ? 'max-h-[350px]' : ''}`}>
      {/* Header */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <h3 className="font-bold text-xs sm:text-sm text-white font-display tracking-wide uppercase">
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>REALTIME</span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-[160px]">
        {messages.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            <p>No messages in this channel yet.</p>
            <p className="text-[10px] text-slate-600 mt-1">Discuss theories, defend edits, or accuse suspects!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === player?.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0 shadow">
                  {msg.senderAvatar || "👨‍💻"}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[80%] rounded-2xl p-2.5 sm:p-3 text-xs shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <div className={`flex items-center space-x-1.5 mb-1 text-[10px] font-semibold ${
                    isMe ? 'text-sky-200 justify-end' : 'text-slate-400'
                  }`}>
                    <span>{msg.senderName}</span>
                    {isMe && <span className="text-[9px] opacity-80">(You)</span>}
                    {msg.isAlive === false && (
                      <span className="text-rose-400 text-[9px] font-mono px-1 py-0.2 rounded bg-rose-950/60 border border-rose-900">
                        👻 Ghost
                      </span>
                    )}
                    <span className="opacity-60 text-[9px] font-mono">{formatTime(msg.timestamp)}</span>
                  </div>

                  <p className="leading-relaxed break-words whitespace-pre-wrap font-sans">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Discussion Prompts (Optional Pills) */}
      {!isCompact && (
        <div className="px-3 py-1.5 bg-[#090d15] border-t border-slate-800/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[10px]">
          <span className="text-slate-500 font-mono shrink-0">Quick:</span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(prompt)}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={player?.isAlive ? "Type your message or theory..." : "👻 Ghosts can chat freely..."}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs transition"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
