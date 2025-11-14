import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

export default function Step1Basics({ data, onChange }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiQuestions, setAiQuestions] = useState({
    businessType: data.ai_business_type || "",
    services: data.ai_services || "",
    uniquePoints: data.ai_unique_points || "",
    targetAudience: data.ai_target_audience || "general_community"
  });

  const handleAIHelp = async () => {
    // Validation
    if (!data.business_name?.trim()) {
      toast.error("Please enter a business name first");
      return;
    }

    if (!aiQuestions.businessType.trim()) {
      toast.error("Please specify your business type");
      return;
    }

    if (!aiQuestions.services.trim()) {
      toast.error("Please describe your services/products");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Please generate a UNIQUE, professional business description.

Business Name: ${data.business_name}
Business Type: ${aiQuestions.businessType}
Services Offered: ${aiQuestions.services}
Unique Points: ${aiQuestions.uniquePoints || "Not specified"}
Target Audience: ${aiQuestions.targetAudience.replace("_", " ")}
City / Area: ${data.city || "Lakewood"}

Guidelines:
- The description MUST be clearly tailored to THIS specific business. Do NOT reuse the same generic sentences across businesses.
- Use the specific details about services, uniqueness, location, and audience.
- Avoid generic marketing clichés like 'we pride ourselves', 'we are your #1 choice', 'top quality service' unless truly necessary.
- Write in a modest, professional tone, appropriate for the Lakewood Haredi community.
- No non-kosher suggestions, no inappropriate content.
- Produce 2–3 different versions:
  1) Short version: 1–2 sentences.
  2) Medium version: 3–4 sentences.
  3) Long version: 5–7 sentences.

Each version must be phrased differently, not just slightly edited.

Return the response as JSON with these keys:
- short_version: the short version (1-2 sentences)
- medium_version: the medium version (3-4 sentences)
- long_version: the long version (5-7 sentences)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            short_version: { type: "string" },
            medium_version: { type: "string" },
            long_version: { type: "string" }
          }
        }
      });

      // Map short version to short_description
      // Map long version to long_description (you can change to medium if preferred)
      onChange({
        ...data,
        short_description: response.short_version || data.short_description,
        long_description: response.long_version || data.long_description,
        ai_business_type: aiQuestions.businessType,
        ai_services: aiQuestions.services,
        ai_unique_points: aiQuestions.uniquePoints,
        ai_target_audience: aiQuestions.targetAudience,
        ai_medium_version: response.medium_version // Store medium version for reference
      });

      toast.success("AI generated unique descriptions successfully!");
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

        {/* AI Questionnaire Section */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-start gap-2 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <Info className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-cyan-900 mb-1">
                Help AI Write Your Description
              </p>
              <p className="text-xs text-cyan-700">
                Answer these quick questions to get a professional, tailored business description
              </p>
            </div>
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="businessType">
              What type of business is this? *
            </Label>
            <Input
              id="businessType"
              value={aiQuestions.businessType}
              onChange={(e) => setAiQuestions({ ...aiQuestions, businessType: e.target.value })}
              placeholder="e.g., Restaurant, Phone Repair, Judaica Store, Sheitel Stylist, Cleaning Services..."
            />
          </div>

          {/* Services/Products */}
          <div className="space-y-2">
            <Label htmlFor="services">
              What services/products do you offer? *
            </Label>
            <Textarea
              id="services"
              value={aiQuestions.services}
              onChange={(e) => setAiQuestions({ ...aiQuestions, services: e.target.value })}
              placeholder="e.g., iPhone & Samsung repairs, cases, accessories"
              rows={3}
            />
          </div>

          {/* Unique Points */}
          <div className="space-y-2">
            <Label htmlFor="uniquePoints">
              What makes your business unique? (Optional)
            </Label>
            <Textarea
              id="uniquePoints"
              value={aiQuestions.uniquePoints}
              onChange={(e) => setAiQuestions({ ...aiQuestions, uniquePoints: e.target.value })}
              placeholder="e.g., Family-owned, Same-day service, Kosher chalav yisroel only, Serving Lakewood & Jackson..."
              rows={2}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Select
              value={aiQuestions.targetAudience}
              onValueChange={(value) => setAiQuestions({ ...aiQuestions, targetAudience: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="families">Families</SelectItem>
                <SelectItem value="children">Children</SelectItem>
                <SelectItem value="general_community">General Community</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Generate Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleAIHelp}
              className="bg-cyan-600 hover:bg-cyan-700 gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating unique descriptions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Description with AI
                </>
              )}
            </Button>
          </div>
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
            This will appear in search results and category listings. You can edit the AI-generated text.
          </p>
        </div>

        {/* Long Description */}
        <div className="space-y-2">
          <Label htmlFor="long_description">Full Description</Label>
          <Textarea
            id="long_description"
            value={data.long_description || ""}
            onChange={(e) => onChange({ ...data, long_description: e.target.value })}
            placeholder="Detailed business description for your public page (5-7 sentences)"
            rows={8}
          />
          <p className="text-xs text-gray-500">
            Tell customers what makes your business special. You can manually edit the AI-generated description.
          </p>
        </div>

        {/* Show medium version if available */}
        {data.ai_medium_version && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              💡 Medium Version (Alternative)
            </p>
            <p className="text-sm text-blue-800 mb-3">
              {data.ai_medium_version}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange({ ...data, long_description: data.ai_medium_version })}
            >
              Use This Version Instead
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}