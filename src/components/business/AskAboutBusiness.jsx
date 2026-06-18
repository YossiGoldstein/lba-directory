import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2, MapPin, Clock, Tag as TagIcon, TrendingUp, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import BusinessResultCard from "../chat/BusinessResultCard";

export default function AskAboutBusiness({ business, category, activeDeals }) {
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [relatedBusinesses, setRelatedBusinesses] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);

  // Lazy-load businesses only when a question is asked
  const ensureBusinessesLoaded = async () => {
    if (allBusinesses.length > 0) return allBusinesses;
    try {
      const bizList = await base44.entities.Business.filter({ status: "approved" });
      setAllBusinesses(bizList);
      return bizList;
    } catch (error) {
      console.error("Failed to load businesses:", error);
      return [];
    }
  };

  const extractBusinessesFromResponse = (responseText, bizList) => {
    const businesses = [];
    const responseLines = responseText.toLowerCase();

    (bizList || allBusinesses).forEach(biz => {
      if (biz.id === business.id) return; // Don't include current business
      const businessName = (biz.business_name || "").toLowerCase();
      if (businessName && responseLines.includes(businessName)) {
        businesses.push(biz);
      }
    });

    return businesses.slice(0, 6);
  };

  const askQuestion = async (questionText) => {
    if (!questionText.trim()) return;

    setIsAsking(true);
    setAiResponse("");
    setRelatedBusinesses([]);
    const loadedBusinesses = await ensureBusinessesLoaded();

    try {
      // Build business context
      const dealsText = activeDeals && activeDeals.length > 0
        ? activeDeals.map(d => `- ${d.title}${d.description ? ': ' + d.description : ''}`).join('\n')
        : "No active deals";

      const businessContext = `The user is currently viewing a business page.

Business Context:
- Name: ${business.business_name}
- Category: ${category?.name || 'Uncategorized'}
- Tags: ${business.tags && business.tags.length > 0 ? business.tags.join(', ') : 'None'}
- Address: ${business.address_line1 || ''}${business.address_line2 ? ' ' + business.address_line2 : ''}, ${business.city || ''}, ${business.state || ''} ${business.zip_code || ''}
- City: ${business.city || 'Lakewood'}
- Opening Hours: ${business.opening_hours_text || 'Contact for hours'}
- Active Deals: 
${dealsText}
- Rating: ${business.general_rating || 0} stars (${business.reviews_count || 0} reviews)
- Coordinates: ${business.latitude || 'N/A'}, ${business.longitude || 'N/A'}
- Business ID: ${business.id}

User Question:
"${questionText}"

This question comes directly from the Business Page UI.`;

      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: `Question about ${business.business_name}`,
          description: "Business page inquiry",
          context: "business_page_question",
          business_id: business.id,
          business_name: business.business_name
        }
      });

      setConversation(conv);

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
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content, loadedBusinesses);
            setRelatedBusinesses(extractedBusinesses);
            setIsAsking(false);
          }
        }
      );

      setTimeout(() => {
        unsubscribe();
        // If the assistant never responded, re-enable the input so it doesn't hang.
        setIsAsking((stillAsking) => {
          if (stillAsking) {
            toast.error("The assistant is taking too long to respond. Please try again.");
          }
          return false;
        });
      }, 30000);

    } catch (error) {
      console.error("Ask failed:", error);
      setIsAsking(false);
      setAiResponse("Sorry, I encountered an error while processing your question. Please try again.");
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askQuestion(question);
  };

  const handleQuickQuestion = (quickQuestion) => {
    setQuestion(quickQuestion);
    askQuestion(quickQuestion);
  };

  const handleContinueInChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const quickQuestions = [
    { text: "Is it open now?", icon: Clock },
    { text: "How do I get there?", icon: MapPin },
    { text: "Any current deals?", icon: TrendingUp },
    { text: "Similar places nearby", icon: TagIcon },
    { text: "What do people say?", icon: MessageCircle },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ask About This Business</h2>
        </div>
        <p className="text-gray-600 ml-13">
          You can ask about hours, deals, directions, similar businesses, and more.
        </p>
      </div>

      {/* Question Input */}
      <div className="p-6 border-b border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="text"
            placeholder="Ask anything about this business…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 h-12"
            disabled={isAsking}
          />
          <Button 
            type="submit" 
            className="bg-cyan-600 hover:bg-cyan-700 h-12 px-8"
            disabled={isAsking || !question.trim()}
          >
            {isAsking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Asking...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Ask
              </>
            )}
          </Button>
        </form>

        {/* Quick Question Buttons */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => {
              const IconComponent = q.icon;
              return (
                <Button
                  key={idx}
                  onClick={() => handleQuickQuestion(q.text)}
                  variant="outline"
                  size="sm"
                  disabled={isAsking}
                  className="text-xs"
                >
                  <IconComponent className="w-3 h-3 mr-1" />
                  {q.text}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isAsking && (
        <div className="p-8 text-center">
          <div className="inline-block w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 font-medium">Asking the Directory Assistant…</p>
          <p className="text-sm text-gray-500 mt-1">Getting you the best answer</p>
        </div>
      )}

      {/* AI Response */}
      {aiResponse && !isAsking && (
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">AI Assistant:</h3>
                <ReactMarkdown
                  className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600 prose-strong:text-gray-900"
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
            </div>
          </div>

          {/* Related Businesses from Response */}
          {relatedBusinesses.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Suggested Businesses:</h3>
              <div className="space-y-3">
                {relatedBusinesses.map((biz) => (
                  <BusinessResultCard key={biz.id} business={biz} />
                ))}
              </div>
            </div>
          )}

          {/* Continue in Chat Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleContinueInChat}
              variant="outline"
              className="w-full gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Continue this conversation in chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}