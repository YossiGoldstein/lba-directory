import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Copy, Check, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function AiAssistantTab({ business, category, deals, onApplyToDescription, onApplyToTags }) {
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [parsedVersions, setParsedVersions] = useState(null);
  const [copied, setCopied] = useState(false);

  const quickCommands = [
    "Improve my business description",
    "Suggest better tags for my listing",
    "Rewrite my description professionally",
    "Help me create deals for this week",
    "Make my description more specific",
    "Suggest search keywords",
    "Optimize for clarity",
  ];

  const extractVersions = (responseText) => {
    const versions = {
      short: null,
      medium: null,
      long: null,
      tags: null,
      deals: null
    };

    // Try to extract structured sections
    const shortMatch = responseText.match(/(?:Short Version|Short Description)[:\s]*\n([^\n]+(?:\n[^\n]+)?)/i);
    const mediumMatch = responseText.match(/(?:Medium Version|Medium Description)[:\s]*\n([^\n]+(?:\n[^\n]+){0,3})/i);
    const longMatch = responseText.match(/(?:Long Version|Long Description)[:\s]*\n((?:[^\n]+\n?){1,7})/i);
    const tagsMatch = responseText.match(/(?:Suggested Tags|Tags)[:\s]*\n([^\n]+(?:\n[^\n]+)?)/i);
    const dealsMatch = responseText.match(/(?:Suggested Deals|Deals)[:\s]*\n((?:[^\n]+\n?){1,5})/i);

    if (shortMatch) versions.short = shortMatch[1].trim();
    if (mediumMatch) versions.medium = mediumMatch[1].trim();
    if (longMatch) versions.long = longMatch[1].trim();
    if (tagsMatch) {
      const tagText = tagsMatch[1].trim();
      versions.tags = tagText.split(/[,\n]/).map(t => t.trim()).filter(t => t.length > 0);
    }
    if (dealsMatch) versions.deals = dealsMatch[1].trim();

    return versions;
  };

  const askAI = async (questionText) => {
    if (!questionText.trim()) return;

    setIsAsking(true);
    setAiResponse("");
    setParsedVersions(null);

    try {
      // Gather comprehensive business context
      const dealsInfo = deals && deals.length > 0 
        ? deals.map(d => `${d.title} (${d.badge_text || 'Deal'})`).join(', ')
        : 'No active deals';

      const businessContext = `You are helping a Business Owner improve their business listing on the LBA Directory.

IMPORTANT:
Your job is to generate UNIQUE, business-specific text — NOT generic marketing language.
Do NOT reuse the same sentences or templates across businesses.

Business Details:
- Name: ${business.business_name}
- Business Type: ${category?.name || 'Not specified'}
- Services Offered: ${business.short_description || 'Not specified'}
- Unique Points: ${business.ai_unique_points || business.tags?.join(', ') || 'Not specified'}
- Category: ${category?.name || 'Uncategorized'}
- Tags: ${business.tags && business.tags.length > 0 ? business.tags.join(', ') : 'None'}
- Location / City: ${business.city || 'Lakewood'}, ${business.state || 'NJ'}
- Target Audience: ${business.ai_target_audience || 'General community'}
- Existing Description: ${business.long_description || business.short_description || 'None'}
- Deals: ${dealsInfo}
- Hours Summary: ${business.opening_hours_text || 'Not specified'}

Tasks the owner may request:
- Improve my description
- Rewrite professionally
- Suggest better tags
- Suggest deals
- Optimize text for clarity
- Make it more specific
- Suggest search keywords
- Suggest SEO enhancements

REQUIREMENTS:
- Always use the unique facts of THIS business.
- NEVER write cookie-cutter marketing lines (e.g., "Your #1 choice", "We pride ourselves", "top quality service", "exceptional excellence").
- Tone must be modest, professional, and appropriate for the Lakewood Haredi community.
- Avoid comparing the business to competitors.
- No non-kosher, inappropriate, or irrelevant suggestions.
- When improving descriptions, provide 2–3 distinct versions:
    (1) Short Version: 1–2 sentences.
    (2) Medium Version: 3–4 sentences.
    (3) Long Version: 5–7 sentences.
- Each version MUST have different sentence structure and different wording.
- When suggesting tags, give 5–10 specific tags that match THIS business.
- When suggesting deals, ensure they are realistic and fit the community (e.g., Yom Tov rush, back-to-school, weekday specials).
- When improving the long description, strengthen clarity, focus, and local relevance.

Format your response with clear sections:
**Short Version**
[1-2 sentence version]

**Medium Version**
[3-4 sentence version]

**Long Version**
[5-7 sentence version]

**Suggested Tags** (if relevant)
[list of 5-10 tags]

**Suggested Deals** (if relevant)
[realistic deal suggestions]

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
            const response = lastMessage.content;
            setAiResponse(response);
            
            // Try to extract versions
            const versions = extractVersions(response);
            if (versions.short || versions.medium || versions.long || versions.tags) {
              setParsedVersions(versions);
            }
            
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

  const handleApplyShort = () => {
    if (parsedVersions?.short && onApplyToDescription) {
      onApplyToDescription(parsedVersions.short, 'short');
      toast.success("Applied to short description!");
    }
  };

  const handleApplyMedium = () => {
    if (parsedVersions?.medium && onApplyToDescription) {
      onApplyToDescription(parsedVersions.medium, 'long');
      toast.success("Applied to full description!");
    }
  };

  const handleApplyLong = () => {
    if (parsedVersions?.long && onApplyToDescription) {
      onApplyToDescription(parsedVersions.long, 'long');
      toast.success("Applied to full description!");
    }
  };

  const handleApplyTags = () => {
    if (parsedVersions?.tags && onApplyToTags) {
      onApplyToTags(parsedVersions.tags);
      toast.success("Applied tags!");
    }
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
            Get personalized, unique advice to improve your business listing, attract more customers, and optimize your presence in the directory.
          </p>
          <div className="bg-white border border-cyan-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              💡 <strong>Pro Tip:</strong> Ask for specific improvements like "Improve my description", "Suggest better tags", or "Help with deals" for best results.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Question Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Ask the AI to improve your listing... Try: 'Improve my description' or 'Suggest better tags'"
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
                  Generating unique recommendations...
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
              <p className="text-gray-600 font-medium">AI is creating unique recommendations...</p>
              <p className="text-sm text-gray-500 mt-2">Tailoring specifically for your business</p>
            </div>
          )}

          {/* AI Response with Parsed Versions */}
          {aiResponse && !isAsking && (
            <div className="space-y-4">
              {/* Parsed Versions */}
              {parsedVersions && (
                <div className="space-y-4">
                  {/* Short Version */}
                  {parsedVersions.short && (
                    <Card className="border-2 border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <Badge className="bg-green-600">Short Version (1-2 sentences)</Badge>
                          <Button
                            size="sm"
                            onClick={handleApplyShort}
                            className="bg-green-600 hover:bg-green-700 gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Apply
                          </Button>
                        </div>
                        <p className="text-gray-900">{parsedVersions.short}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Medium Version */}
                  {parsedVersions.medium && (
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <Badge className="bg-blue-600">Medium Version (3-4 sentences)</Badge>
                          <Button
                            size="sm"
                            onClick={handleApplyMedium}
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Apply
                          </Button>
                        </div>
                        <p className="text-gray-900">{parsedVersions.medium}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Long Version */}
                  {parsedVersions.long && (
                    <Card className="border-2 border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <Badge className="bg-purple-600">Long Version (5-7 sentences)</Badge>
                          <Button
                            size="sm"
                            onClick={handleApplyLong}
                            className="bg-purple-600 hover:bg-purple-700 gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Apply
                          </Button>
                        </div>
                        <p className="text-gray-900">{parsedVersions.long}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Suggested Tags */}
                  {parsedVersions.tags && parsedVersions.tags.length > 0 && (
                    <Card className="border-2 border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <Badge className="bg-orange-600">Suggested Tags</Badge>
                          <Button
                            size="sm"
                            onClick={handleApplyTags}
                            className="bg-orange-600 hover:bg-orange-700 gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Apply
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {parsedVersions.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="bg-white">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Suggested Deals */}
                  {parsedVersions.deals && (
                    <Card className="border-2 border-cyan-200 bg-cyan-50">
                      <CardContent className="p-4">
                        <Badge className="bg-cyan-600 mb-2">Suggested Deals</Badge>
                        <p className="text-gray-900 whitespace-pre-line">{parsedVersions.deals}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Full Response (Markdown) */}
              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Complete AI Response:</h3>
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
                          Copy All
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
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}