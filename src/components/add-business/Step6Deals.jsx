import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Step6Deals({ data, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDeal, setCurrentDeal] = useState({
    title: "",
    description: "",
    badge_text: "",
    start_date: "",
    end_date: "",
  });

  const deals = data.deals || [];

  const handleAISuggest = async () => {
    setIsGenerating(true);

    try {
      const prompt = `Suggest 1-2 reasonable promotions for a business in the category "${data.category_name || "General"}" based in Lakewood NJ.

Keep suggestions modest, kosher, and culturally appropriate for the Orthodox Jewish community.

Format as JSON with array of deals, each having:
- title (e.g., "10% off")
- description (brief explanation)
- badge_text (e.g., "Limited Time")`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            deals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  badge_text: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response.deals && response.deals.length > 0) {
        const suggestedDeal = response.deals[0];
        setCurrentDeal({
          ...currentDeal,
          title: suggestedDeal.title,
          description: suggestedDeal.description,
          badge_text: suggestedDeal.badge_text,
        });
        setShowForm(true);
        toast.success("AI suggested a deal!");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error("Failed to suggest deal. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddDeal = () => {
    if (!currentDeal.title.trim()) {
      toast.error("Please enter a deal title");
      return;
    }

    if (!currentDeal.start_date || !currentDeal.end_date) {
      toast.error("Please set start and end dates");
      return;
    }

    onChange({
      ...data,
      deals: [...deals, currentDeal],
    });

    setCurrentDeal({
      title: "",
      description: "",
      badge_text: "",
      start_date: "",
      end_date: "",
    });
    setShowForm(false);
    toast.success("Deal added!");
  };

  const handleRemoveDeal = (index) => {
    onChange({
      ...data,
      deals: deals.filter((_, i) => i !== index),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Deals & Promotions (Optional)</CardTitle>
          {!showForm && (
            <div className="flex gap-2">
              <Button
                onClick={handleAISuggest}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suggesting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI Suggest
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Deal
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deal Form */}
        {showForm && (
          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200 space-y-4">
            <h3 className="font-semibold text-gray-900">New Deal</h3>

            <div className="space-y-2">
              <Label htmlFor="deal_title">Title *</Label>
              <Input
                id="deal_title"
                value={currentDeal.title}
                onChange={(e) => setCurrentDeal({ ...currentDeal, title: e.target.value })}
                placeholder="10% off all items"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal_description">Description</Label>
              <Textarea
                id="deal_description"
                value={currentDeal.description}
                onChange={(e) => setCurrentDeal({ ...currentDeal, description: e.target.value })}
                placeholder="Additional details..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal_badge">Badge Text</Label>
              <Input
                id="deal_badge"
                value={currentDeal.badge_text}
                onChange={(e) => setCurrentDeal({ ...currentDeal, badge_text: e.target.value })}
                placeholder="Limited Time, New, Sale"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deal_start">Start Date *</Label>
                <Input
                  id="deal_start"
                  type="date"
                  value={currentDeal.start_date}
                  onChange={(e) => setCurrentDeal({ ...currentDeal, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deal_end">End Date *</Label>
                <Input
                  id="deal_end"
                  type="date"
                  value={currentDeal.end_date}
                  onChange={(e) => setCurrentDeal({ ...currentDeal, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddDeal} className="bg-cyan-600 hover:bg-cyan-700">
                Add Deal
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Deals List */}
        {deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map((deal, index) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{deal.title}</h4>
                      {deal.badge_text && (
                        <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full">
                          {deal.badge_text}
                        </span>
                      )}
                    </div>
                    {deal.description && (
                      <p className="text-sm text-gray-600 mb-2">{deal.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {deal.start_date} to {deal.end_date}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRemoveDeal(index)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>No deals added yet</p>
            <p className="text-sm mt-1">You can add deals to attract more customers</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}