import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ReviewForm({ businessId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!body.trim()) {
      toast.error("Please write your review");
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        business_id: businessId,
        rating,
        title: title.trim() || null,
        body: body.trim(),
        visit_date: visitDate || null,
        is_approved: false,
      });

      toast.success("Review submitted successfully! It will appear after moderation.");
      
      // Send email notification to business owner
      try {
        await base44.functions.invoke('sendBusinessEmail', {
          type: 'new_review',
          businessId: businessId,
          data: {
            stars: '⭐'.repeat(rating),
            reviewText: body.trim()
          }
        });
      } catch (emailError) {
        console.error("Failed to send review notification email:", emailError);
      }
      
      // Reset form
      setRating(0);
      setTitle("");
      setBody("");
      setVisitDate("");
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title (Optional)</Label>
            <Input
              id="review-title"
              placeholder="Sum up your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="review-body">Your Review *</Label>
            <Textarea
              id="review-body"
              placeholder="Share your experience with this business..."
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          {/* Visit Date */}
          <div className="space-y-2">
            <Label htmlFor="visit-date">When did you visit? (Optional)</Label>
            <Input
              id="visit-date"
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-cyan-600 hover:bg-cyan-700"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your review will be published after moderation
          </p>
        </form>
      </CardContent>
    </Card>
  );
}