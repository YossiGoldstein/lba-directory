import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, MessageCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import BusinessResultCard from "../chat/BusinessResultCard";

export default function AiActivityTab({ user }) {
  const [activeInteraction, setActiveInteraction] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const [newResponse, setNewResponse] = useState("");
  const [results, setResults] = useState([]);

  // Fetch user's AI interactions
  const { data: aiInteractions = [], isLoading } = useQuery({
    queryKey: ["aiInteractions", user?.id],
    queryFn: async () => {
      const allInteractions = await base44.entities.AiInteraction.list();
      return allInteractions
        .filter(i => i.user_id === user.id)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 20); // Last 20 interactions
    },
    enabled: !!user?.id,
  });

  // Fetch all businesses
  const { data: allBusinesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const biz = await base44.entities.Business.list();
      return biz.filter(b => b.status === "approved");
    },
  });

  const extractBusinessesFromResponse = (responseText) => {
    const businesses = [];
    const responseLines = responseText.toLowerCase();

    allBusinesses.forEach(business => {
      const businessName = (business.business_name || "").toLowerCase();
      if (businessName && responseLines.includes(businessName)) {
        businesses.push(business);
      }
    });

    return businesses.slice(0, 6);
  };

  const handleAskAgain = async (interaction) => {
    setActiveInteraction(interaction.id);
    setIsAsking(true);
    setNewResponse("");
    setResults([]);

    try {
      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: `Repeat Question`,
          description: "From AI activity history",
          context: "ai_activity_repeat"
        }
      });

      await base44.agents.addMessage(conv, {
        role: "user",
        content: interaction.question
      });

      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant") {
            setNewResponse(lastMessage.content);
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content);
            setResults(extractedBusinesses);
            setIsAsking(false);
          }
        }
      );

      setTimeout(() => {
        unsubscribe();
      }, 30000);

    } catch (error) {
      console.error("Ask failed:", error);
      setIsAsking(false);
      setNewResponse("Sorry, I encountered an error. Please try again.");
    }
  };

  const handleContinueInChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const handleStartConversation = () => {
    handleContinueInChat();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Loading AI activity...</p>
      </div>
    );
  }

  if (aiInteractions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-cyan-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No AI Conversations Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start chatting with our AI assistant to get personalized recommendations and answers about local businesses.
          </p>
          <Button
            onClick={handleStartConversation}
            className="bg-cyan-600 hover:bg-cyan-700 gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Start a Conversation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        AI Conversation History ({aiInteractions.length})
      </h3>

      {/* AI Interactions List */}
      <div className="space-y-3">
        {aiInteractions.map((interaction) => (
          <Card key={interaction.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">You asked:</p>
                    <p className="text-gray-900 font-medium">{interaction.question}</p>
                  </div>
                </div>

                {/* Original Response (collapsed by default) */}
                {interaction.agent_response && (
                  <div className="ml-11 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-3 border border-cyan-200">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {interaction.agent_response}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata & Actions */}
                <div className="flex items-center justify-between ml-11 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(interaction.created_date), { addSuffix: true })}
                    </span>
                    {interaction.page_context && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {interaction.page_context}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAskAgain(interaction)}
                      size="sm"
                      variant="outline"
                      disabled={isAsking && activeInteraction === interaction.id}
                    >
                      {isAsking && activeInteraction === interaction.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Asking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Ask again
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleContinueInChat}
                      size="sm"
                      variant="ghost"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>

                {/* New Response Section */}
                {activeInteraction === interaction.id && !isAsking && newResponse && (
                  <div className="ml-11 mt-4 pt-4 border-t border-gray-200">
                    {/* AI Response */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 mb-4 border border-cyan-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Updated Response:</h4>
                          <ReactMarkdown
                            className="prose prose-sm max-w-none prose-p:text-gray-700"
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            }}
                          >
                            {newResponse}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* Business Results */}
                    {results.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {results.map((business) => (
                          <BusinessResultCard key={business.id} business={business} />
                        ))}
                      </div>
                    )}

                    {/* Continue in Chat */}
                    <Button
                      onClick={handleContinueInChat}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Continue this conversation in chat
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}