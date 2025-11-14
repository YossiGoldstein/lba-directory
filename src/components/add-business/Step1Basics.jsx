import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Step1Basics({ data, onChange }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIHelp = async () => {
    setIsGenerating(true);

    try {
      const prompt = `AI, please help write or improve the business description for:
${data.business_name || "[New Business]"}

Target audience: Lakewood Haredi community.
Tone: modest, professional, and appropriate.
Keep it kosher and culturally sensitive.

Please provide:
1. A short description (1-2 sentences) suitable for search results
2. A longer, detailed description (2-3 paragraphs) for the business page

Format as:
SHORT: [short description]
LONG: [long description]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            short_description: { type: "string" },
            long_description: { type: "string" }
          }
        }
      });

      onChange({
        ...data,
        short_description: response.short_description || data.short_description,
        long_description: response.long_description || data.long_description,
      });

      toast.success("AI generated descriptions!");
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("Failed to generate description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Basics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="business_name">Business Name *</Label>
          <Input
            id="business_name"
            value={data.business_name || ""}
            onChange={(e) => onChange({ ...data, business_name: e.target.value })}
            placeholder="Enter your business name"
            required
          />
        </div>

        {/* AI Help Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleAIHelp}
            variant="outline"
            className="gap-2"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Let AI help write my description
              </>
            )}
          </Button>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="short_description">Short Description</Label>
          <Textarea
            id="short_description"
            value={data.short_description || ""}
            onChange={(e) => onChange({ ...data, short_description: e.target.value })}
            placeholder="Brief description that appears in search results (1-2 sentences)"
            rows={2}
          />
          <p className="text-xs text-gray-500">
            This will appear in search results and category listings
          </p>
        </div>

        {/* Long Description */}
        <div className="space-y-2">
          <Label htmlFor="long_description">Full Description</Label>
          <Textarea
            id="long_description"
            value={data.long_description || ""}
            onChange={(e) => onChange({ ...data, long_description: e.target.value })}
            placeholder="Detailed business description for your public page (2-3 paragraphs)"
            rows={8}
          />
          <p className="text-xs text-gray-500">
            Tell customers what makes your business special
          </p>
        </div>
      </CardContent>
    </Card>
  );
}