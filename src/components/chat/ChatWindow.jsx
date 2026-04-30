import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Convert plain-text URLs, phone numbers, and emails to markdown links
// so ReactMarkdown renders them as clickable elements.
function linkifyContent(text) {
  const tokens = [];

  // Protect existing markdown links [text](url) and inline code `...`
  // from being double-processed by replacing them with null-byte placeholders.
  let result = text.replace(/(\[([^\]]*)\]\(([^)]*)\)|`[^`]+`)/g, (match) => {
    const idx = tokens.length;
    tokens.push(match);
    return `\x00T${idx}\x00`;
  });

  // Plain https:// or http:// URLs → markdown link
  result = result.replace(/https?:\/\/[^\s<>"')\],\x00]+/g, (url) => {
    const cleaned = url.replace(/[.,;:!?)\]]+$/, "");
    return `[${cleaned}](${cleaned})`;
  });

  // Email addresses → mailto link
  result = result.replace(
    /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    (email) => `[${email}](mailto:${email})`
  );

  // US phone numbers: 732-600-1260 / (732) 600-1260 / 732.600.1260
  // Use digit lookarounds instead of \b so (732)... format is matched too.
  result = result.replace(
    /(?<!\d)(\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})(?!\d)/g,
    (match) => {
      const digits = match.replace(/\D/g, "");
      return digits.length === 10 ? `[${match}](tel:+1${digits})` : match;
    }
  );

  // Restore protected tokens
  return result.replace(/\x00T(\d+)\x00/g, (_, idx) => tokens[parseInt(idx)]);
}

export default function ChatWindow({
  onClose,
  isMinimized,
  onToggleMinimize,
  isMobile,
}) {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    const newHistory = [...chatHistory, { role: "user", content: userMessage }];
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await base44.functions.invoke("platformHelp", {
        messages: newHistory,
      });
      const reply = response.data?.content || "Sorry, I couldn't process that. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) return null;

  const containerClasses = isMobile
    ? "fixed inset-0 bg-white z-50 flex flex-col"
    : "fixed bottom-20 right-4 w-96 h-[560px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div
        className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-4 flex items-center justify-between"
        style={{
          borderTopLeftRadius: isMobile ? 0 : "0.5rem",
          borderTopRightRadius: isMobile ? 0 : "0.5rem",
        }}
      >
        <div>
          <h3 className="font-semibold">LBA Directory Help</h3>
          <p className="text-xs text-cyan-100">How can I help you?</p>
        </div>
        <div className="flex gap-2">
          {!isMobile && (
            <button
              onClick={onToggleMinimize}
              className="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-6">
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="45" r="18" fill="#0891b2" />
                <path d="M32 75c0-9.941 8.059-18 18-18s18 8.059 18 18v10H32V75z" fill="#0891b2" />
                <path d="M28 45c0-12.15 9.85-22 22-22s22 9.85 22 22" stroke="#0e7490" strokeWidth="4" strokeLinecap="round" fill="none" />
                <rect x="22" y="42" width="8" height="12" rx="2" fill="#0e7490" />
                <rect x="70" y="42" width="8" height="12" rx="2" fill="#0e7490" />
                <path d="M68 54v8" stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
                <circle cx="68" cy="64" r="2.5" fill="#0e7490" />
              </svg>
            </div>
            <p className="text-base font-semibold mb-2">Hi! I'm here to help.</p>
            <p className="text-sm text-gray-500 mb-4">
              Ask me how to add your business, claim a listing, or anything about how LBA Directory works.
            </p>
            <div className="text-left space-y-2 text-xs text-gray-400">
              <p className="bg-white border border-gray-200 rounded-lg px-3 py-2">How do I add my business?</p>
              <p className="bg-white border border-gray-200 rounded-lg px-3 py-2">How do I claim my listing?</p>
              <p className="bg-white border border-gray-200 rounded-lg px-3 py-2">What is LBA Directory?</p>
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-cyan-600 text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              {message.role === "user" ? (
                <p className="text-sm">{message.content}</p>
              ) : (
                <ReactMarkdown
                  className="text-sm prose prose-sm max-w-none prose-p:text-gray-700 prose-a:text-cyan-600 prose-strong:text-gray-900"
                  components={{
                    a: ({ href, children }) => {
                      if (!href) return <span>{children}</span>;
                      // tel: and mailto: — same window, no rel needed
                      if (href.startsWith("tel:") || href.startsWith("mailto:")) {
                        return (
                          <a href={href} className="text-cyan-600 underline hover:text-cyan-700 font-medium">
                            {children}
                          </a>
                        );
                      }
                      // Internal lbadirectory.com links — React Router (no page reload)
                      if (href.includes("lbadirectory.com") || href.startsWith("/")) {
                        const path = href.replace(/^https?:\/\/(www\.)?lbadirectory\.com/, "") || "/";
                        return (
                          <Link to={path} className="text-cyan-600 underline hover:text-cyan-700 font-medium">
                            {children}
                          </Link>
                        );
                      }
                      // External links — new tab
                      return (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline hover:text-cyan-700 font-medium">
                          {children}
                        </a>
                      );
                    },
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  }}
                >
                  {linkifyContent(message.content)}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="p-4 border-t border-gray-200 bg-white"
        style={{
          borderBottomLeftRadius: isMobile ? 0 : "0.5rem",
          borderBottomRightRadius: isMobile ? 0 : "0.5rem",
        }}
      >
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask how the site works..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
