import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Step2Category({ data, onChange }) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.filter(c => c.is_active);
    },
  });

  const handleAISuggest = async () => {
    if (!data.business_name || !data.category_id) {
      toast.error("Please enter business name and select a category first");
      return;
    }

    setIsGenerating(true);

    try {
      const selectedCategory = categories.find(c => c.id === data.category_id);
      
      const prompt = `Based on the business name "${data.business_name}" and category "${selectedCategory?.name}", suggest 3-7 relevant tags.

The suggestions must be appropriate for the Lakewood Haredi community.
No treif tags, no irrelevant categories.
Tags should help with search and discovery.

Return only the tags as a comma-separated list.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      onChange({
        ...data,
        tags: response.trim(),
      });

      toast.success("AI suggested tags!");
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("Failed to suggest tags. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category & Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={data.category_id || ""}
            onValueChange={(value) => onChange({ ...data, category_id: value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Choose the category that best describes your business
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Button
              onClick={handleAISuggest}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isGenerating || !data.business_name || !data.category_id}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Suggesting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Suggest tags with AI
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="tags"
            value={data.tags || ""}
            onChange={(e) => onChange({ ...data, tags: e.target.value })}
            placeholder="kosher, delivery, parking, catering"
            rows={3}
          />
          <p className="text-xs text-gray-500">
            Add keywords to help customers find your business
          </p>
        </div>
      </CardContent>
    </Card>
  );
}