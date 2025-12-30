import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Minimize2, Headphones } from "lucide-react";
import ReactMarkdown from "react-markdown";
import BusinessResultCard from "./BusinessResultCard";

export default function ChatWindow({ 
  onClose, 
  isMinimized, 
  onToggleMinimize,
  isMobile,
  pageContext 
}) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
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
        // Fetch businesses for context
        const bizList = await base44.entities.Business.list();
        setBusinesses(bizList.filter(b => b.status === "approved"));

        // Create conversation
        const conv = await base44.agents.createConversation({
          agent_name: "DirectoryAssistant",
          metadata: {
            name: "Directory Search",
            description: "Help finding local businesses",
            page_context: pageContext
          }
        });
        
        setConversation(conv);

        // Send initial context message
        if (pageContext) {
          let contextMessage = "Context: ";
          if (pageContext.page === "Home") {
            contextMessage += "User is on the homepage browsing the directory.";
          } else if (pageContext.page === "CategoryListing" && pageContext.categoryName) {
            contextMessage += `User is browsing the ${pageContext.categoryName} category.`;
          } else if (pageContext.page === "BusinessListing" && pageContext.businessName) {
            contextMessage += `User is viewing ${pageContext.businessName}.`;
          }

          await base44.agents.addMessage(conv, {
            role: "user",
            content: contextMessage
          });
        }

        // Set initial messages
        if (conv.messages && conv.messages.length > 0) {
          setMessages(conv.messages);
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };

    initConversation();
  }, [pageContext]);

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

  const extractBusinessesFromMessage = (content) => {
    // Try to extract business IDs or names from the message
    const businessIds = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      // Look for patterns that might indicate a business reference
      businesses.forEach(business => {
        if (line.includes(business.business_name) || line.includes(business.id)) {
          businessIds.push(business.id);
        }
      });
    });

    return businessIds;
  };

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

  const containerClasses = isMobile
    ? "fixed inset-0 bg-white z-50 flex flex-col"
    : "fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-4 flex items-center justify-between" style={{ borderTopLeftRadius: isMobile ? 0 : '0.5rem', borderTopRightRadius: isMobile ? 0 : '0.5rem' }}>
        <div>
          <h3 className="font-semibold">LBA Directory Assistant</h3>
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
          <div className="text-center text-gray-500 mt-8">
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center">
                <Headphones className="w-10 h-10 text-cyan-600" strokeWidth={2} />
              </div>
            </div>
            <p className="text-lg font-semibold mb-2">Hi, I'm your LBA Directory Assistant</p>
            <p className="text-sm mb-4 text-gray-600">I am here to help with anything from business information to general inquiries, for a quick and direct response.</p>
          </div>
        )}

        {messages.map((message, idx) => {
          // Skip system/context messages
          if (message.content?.startsWith("Context:")) {
            return null;
          }

          return (
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
                  <>
                    <ReactMarkdown
                      className="text-sm prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600 prose-strong:text-gray-900"
                      components={{
                        a: ({ children, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-700">
                            {children}
                          </a>
                        ),
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="mb-0.5">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>

                    {/* Extract and show business cards if businesses are mentioned */}
                    {(() => {
                      const businessIds = extractBusinessesFromMessage(message.content);
                      if (businessIds.length > 0) {
                        return (
                          <div className="mt-3 space-y-2">
                            {businessIds.slice(0, 3).map(id => {
                              const business = businesses.find(b => b.id === id);
                              if (!business) return null;
                              return <BusinessResultCard key={id} business={business} />;
                            })}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </>
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
          );
        })}

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
      <div className="p-4 border-t border-gray-200 bg-white" style={{ borderBottomLeftRadius: isMobile ? 0 : '0.5rem', borderBottomRightRadius: isMobile ? 0 : '0.5rem' }}>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type what you're looking for"
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