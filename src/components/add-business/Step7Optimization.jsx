import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function Step7Optimization({ data, onChange }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState(null);

  const handleOptimize = async () => {
    setIsOptimizing(true);

    try {
      const tagsArray = data.tags ? data.tags.split(",").map(t => t.trim()) : [];
      
      const prompt = `Please review this business listing and suggest improvements.

Business:
Name: ${data.business_name || "[Not set]"}
Category: ${data.category_name || "[Not selected]"}
Tags: ${tagsArray.join(", ") || "[None]"}
Short Description: ${data.short_description || "[None]"}
Long Description: ${data.long_description || "[None]"}
Address: ${data.address_line1 || ""}, ${data.city || ""}, ${data.state || ""}
Hours: ${data.opening_hours_text || "[Not set]"}

Guidelines:
- Tone must fit Lakewood Haredi community.
- Avoid non-kosher concepts.
- Focus on clarity and value.
- No slang or immodest language.
- Keep it professional and modest.

Please provide:
1. Improved short description
2. Improved long description
3. Better tags (comma-separated)
4. Any additional suggestions

Format as JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            improved_short_description: { type: "string" },
            improved_long_description: { type: "string" },
            improved_tags: { type: "string" },
            suggestions: { type: "string" }
          }
        }
      });

      setOptimization(response);
      toast.success("AI optimization complete!");
    } catch (error) {
      console.error("Optimization failed:", error);
      toast.error("Failed to optimize listing. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyField = (field, value) => {
    onChange({ ...data, [field]: value });
    toast.success("Applied!");
  };

  const handleApplyAll = () => {
    if (!optimization) return;

    onChange({
      ...data,
      short_description: optimization.improved_short_description || data.short_description,
      long_description: optimization.improved_long_description || data.long_description,
      tags: optimization.improved_tags || data.tags,
    });

    toast.success("All improvements applied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-600" />
          AI Optimization (Final Polishing)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-700 mb-4">
            Let AI examine your listing and suggest improvements to make it more attractive and effective for the Lakewood community.
          </p>
          <Button
            onClick={handleOptimize}
            className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Optimization
              </>
            )}
          </Button>
        </div>

        {/* Optimization Results */}
        {optimization && (
          <div className="space-y-4">
            {/* Improved Short Description */}
            {optimization.improved_short_description && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Improved Short Description</h4>
                  <Button
                    onClick={() => handleApplyField("short_description", optimization.improved_short_description)}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Apply
                  </Button>
                </div>
                <p className="text-gray-700 text-sm">{optimization.improved_short_description}</p>
              </div>
            )}

            {/* Improved Long Description */}
            {optimization.improved_long_description && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Improved Long Description</h4>
                  <Button
                    onClick={() => handleApplyField("long_description", optimization.improved_long_description)}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Apply
                  </Button>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-line">{optimization.improved_long_description}</p>
              </div>
            )}

            {/* Improved Tags */}
            {optimization.improved_tags && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Improved Tags</h4>
                  <Button
                    onClick={() => handleApplyField("tags", optimization.improved_tags)}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Apply
                  </Button>
                </div>
                <p className="text-gray-700 text-sm">{optimization.improved_tags}</p>
              </div>
            )}

            {/* Additional Suggestions */}
            {optimization.suggestions && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">Additional Suggestions</h4>
                <ReactMarkdown className="prose prose-sm max-w-none text-gray-700">
                  {optimization.suggestions}
                </ReactMarkdown>
              </div>
            )}

            {/* Apply All Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleApplyAll}
                className="bg-cyan-600 hover:bg-cyan-700 gap-2 px-8"
              >
                <Check className="w-4 h-4" />
                Apply All Improvements
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}