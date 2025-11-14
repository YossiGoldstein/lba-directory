import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function AiAssistantTab({ business, category, onApplyToDescription, onApplyToDeals }) {
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [copied, setCopied] = useState(false);

  const quickCommands = [
    "Improve my business description",
    "Help me add deals for this week",
    "Rewrite my listing in a more attractive way",
    "Suggest better tags",
    "Optimize my hours",
    "What are people searching for in this category?",
    "How can I attract more customers?",
  ];

  const askAI = async (questionText) => {
    if (!questionText.trim()) return;

    setIsAsking(true);
    setAiResponse("");

    try {
      const businessContext = `The user is a Business Owner.
They are managing the business:

Business Name: ${business.business_name}
Category: ${category?.name || 'Uncategorized'}
Address: ${business.address_line1 || ''}, ${business.city || ''}, ${business.state || ''}
Tags: ${business.tags && business.tags.length > 0 ? business.tags.join(', ') : 'None'}
Short Description: ${business.short_description || 'None'}
Long Description: ${business.long_description || 'None'}
Current Status: ${business.status}

Provide optimization suggestions specifically for improving their business listing.
Maintain cultural and modest norms for the Lakewood Haredi community.
Be practical, actionable, and respectful.

Business Owner's Question:
"${questionText}"`;

      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: "Business Owner AI Assistant",
          description: "Business optimization help",
          context: "business_owner_dashboard",
          business_id: business.id
        }
      });

      await base44.agents.addMessage(conv, {
        role: "user",
        content: businessContext
      });

      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant") {
            setAiResponse(lastMessage.content);
            setIsAsking(false);
          }
        }
      );

      setTimeout(() => {
        unsubscribe();
      }, 30000);

    } catch (error) {
      console.error("AI request failed:", error);
      setIsAsking(false);
      setAiResponse("Sorry, I encountered an error. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askAI(question);
  };

  const handleQuickCommand = (command) => {
    setQuestion(command);
    askAI(command);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            AI Assistant for Business Owners
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Get personalized advice to improve your business listing, attract more customers, and optimize your presence in the directory.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Question Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Ask the AI anything to improve your business listing..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              disabled={isAsking}
            />
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 w-full gap-2"
              disabled={isAsking || !question.trim()}
            >
              {isAsking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Asking AI...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ask AI
                </>
              )}
            </Button>
          </form>

          {/* Quick Commands */}
          <div>
            <p className="text-sm text-gray-600 mb-3">Quick commands:</p>
            <div className="flex flex-wrap gap-2">
              {quickCommands.map((command, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleQuickCommand(command)}
                  variant="outline"
                  size="sm"
                  disabled={isAsking}
                  className="text-xs"
                >
                  {command}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isAsking && (
            <div className="p-8 text-center">
              <div className="inline-block w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">AI is analyzing your business...</p>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && !isAsking && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">AI Recommendations:</h3>
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <ReactMarkdown
                  className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                  components={{
                    a: ({ children, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" className="underline">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  }}
                >
                  {aiResponse}
                </ReactMarkdown>
              </div>

              {/* Action Buttons */}
              {(question.toLowerCase().includes("description") || question.toLowerCase().includes("listing")) && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => onApplyToDescription && onApplyToDescription(aiResponse)}
                    variant="outline"
                    className="gap-2"
                  >
                    Apply to Description
                  </Button>
                </div>
              )}

              {question.toLowerCase().includes("deal") && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => onApplyToDeals && onApplyToDeals(aiResponse)}
                    variant="outline"
                    className="gap-2"
                  >
                    Apply to Deals
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}