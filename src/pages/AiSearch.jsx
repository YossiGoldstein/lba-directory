import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Send, ArrowLeft, User } from "lucide-react";

export default function AiSearch() {
  const [messages, setMessages] = useState([]); // { role, content }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // On load, read ?query= from URL and fire initial search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (query) {
      sendMessage(query);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const response = await base44.functions.invoke("claudeChat", {
      messages: updatedMessages,
    });

    const aiContent = response.data?.content || "Sorry, I couldn't find an answer.";
    setMessages([...updatedMessages, { role: "assistant", content: aiContent }]);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={createPageUrl("Home")} className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">LBA Directory Assistant</div>
              <div className="text-xs text-gray-500">AI-powered business search</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-20">
            <Bot className="w-12 h-12 mx-auto mb-3 text-blue-200" />
            <p className="text-lg font-medium text-gray-500">Ask me anything about local businesses</p>
            <p className="text-sm text-gray-400 mt-1">e.g. "kosher restaurants", "plumbers open Sunday", "pizza delivery"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-white shadow-sm border border-gray-100 text-gray-800"
            }`}>
              {msg.role === "user" ? (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-800 [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul>li]:mb-1 [&>strong]:font-semibold [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mt-3 [&>h3]:mb-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching the directory...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any business, service, or category..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 h-auto"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}