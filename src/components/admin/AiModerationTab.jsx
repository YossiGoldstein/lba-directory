import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AiModerationTab() {
  const [content, setContent] = useState("");
  const [task, setTask] = useState("appropriateness");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const handleAskAI = async () => {
    if (!content.trim()) {
      toast.error("Please enter content to review");
      return;
    }

    setIsProcessing(true);
    setAiResponse("");

    try {
      const taskDescriptions = {
        appropriateness: `Check for community appropriateness:
- Flag any issues related to non-kosher, immodest, inappropriate, or irrelevant content.
- Suggest a corrected version if needed.`,
        category: `Suggest better category/tags:
- Propose the best category and 3–7 relevant tags for the business.`,
        rewrite: `Rewrite in a proper tone:
- Rewrite professionally in a clear, modest tone that fits the Lakewood Haredi community.`
      };

      const prompt = `You are now assisting an Admin reviewing content in LBA Directory for the Lakewood Haredi community.

Task: ${taskDescriptions[task]}

Content to review:
${content}

Important guidelines:
- Ensure all content is kosher-appropriate
- No treif categories or references
- No immodest concepts
- Be sensitive to Shabbos and Yom Tov
- Maintain community standards
- Professional and modest language only

Please provide your analysis and recommendations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAiResponse(response);
    } catch (error) {
      console.error("AI moderation failed:", error);
      toast.error("Failed to process content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiResponse);
    toast.success("Response copied to clipboard!");
  };

  const taskOptions = [
    { value: "appropriateness", label: "Check for Community Appropriateness" },
    { value: "category", label: "Suggest Better Category/Tags" },
    { value: "rewrite", label: "Rewrite in Proper Tone" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            AI Moderation Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-cyan-900 mb-1">
                  Admin Moderation Tool
                </p>
                <p className="text-xs text-cyan-700">
                  Use this AI assistant to review business listings, descriptions, and user-generated content 
                  to ensure they meet community standards and guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Task Selection */}
          <div className="space-y-2">
            <Label htmlFor="task">Select Moderation Task</Label>
            <Select value={task} onValueChange={setTask}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a task" />
              </SelectTrigger>
              <SelectContent>
                {taskOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content to Review
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste business description or user-generated content here..."
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              {content.length} characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleAskAI}
            className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Ask AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Response */}
      {(isProcessing || aiResponse) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Analysis</CardTitle>
              {aiResponse && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">AI is analyzing the content...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 text-gray-700">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3 text-gray-700">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 text-gray-700">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">{children}</h3>,
                      code: ({ inline, children }) => 
                        inline ? (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>
                        ) : (
                          <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
                            <code>{children}</code>
                          </pre>
                        )
                    }}
                  >
                    {aiResponse}
                  </ReactMarkdown>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    AI analysis completed. Review the recommendations above.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}