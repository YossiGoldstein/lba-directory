import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Minimize2, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatWindow({ onClose, isMinimized, onToggleMinimize }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: "DirectoryAssistant",
          metadata: {
            name: "Directory Search",
            description: "Help finding local businesses"
          }
        });
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };

    initConversation();
  }, []);

  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = base44.agents.subscribeToConversation(
      conversation.id,
      (data) => {
        setMessages(data.messages || []);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversation]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversation || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: userMessage
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Directory Assistant</h3>
          <p className="text-xs text-cyan-100">Ask me anything about local businesses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleMinimize}
            className="hover:bg-white/20 rounded p-1 transition-colors"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
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
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-2">👋 Hello! I'm here to help you find local businesses.</p>
            <p className="text-sm">Try asking me things like:</p>
            <div className="mt-3 text-left bg-white rounded-lg p-3 space-y-2 text-xs">
              <p>• "Find me a kosher restaurant in Lakewood"</p>
              <p>• "תמצא לי חנות יודאיקה טובה"</p>
              <p>• "Show me plumbers with good reviews"</p>
              <p>• "Which grocery stores have deals?"</p>
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
                  className="text-sm prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600 prose-strong:text-gray-900"
                  components={{
                    a: ({ children, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-700">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}

              {/* Tool calls indicator */}
              {message.tool_calls && message.tool_calls.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  {message.tool_calls.map((tool, toolIdx) => (
                    <div key={toolIdx} className="text-xs text-gray-500 flex items-center gap-1">
                      {tool.status === "running" || tool.status === "in_progress" ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Searching database...</span>
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about local businesses..."
            disabled={isLoading || !conversation}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !conversation || !inputValue.trim()}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}