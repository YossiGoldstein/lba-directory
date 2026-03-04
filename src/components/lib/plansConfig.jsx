import { Zap, Sparkles, Crown } from "lucide-react";

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNumber: 0,
    period: "forever",
    icon: Zap,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    features: [
      "Basic business information",
      "Limited gallery showcase",
      "Business dashboard",
      "Customer reviews",
      "Listing stats"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "$50",
    priceNumber: 50,
    period: "per month",
    badge: "Popular",
    icon: Sparkles,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    features: [
      "Everything in Free",
      "Featured listing",
      "Unlimited gallery showcase",
      "Create ads and promotions",
      "3 ads a year on TIG Solutions social media"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "$100",
    priceNumber: 100,
    period: "per month",
    badge: "Best Value",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    features: [
      "Everything in Pro",
      "Verified badge",
      "AI powered insights",
      "Priority customer support",
      "Monthly performance report",
      "Monthly ad on TIG Solutions social media",
      "Discounted services from TIG Solutions"
    ]
  },
  {
    id: "lba-sponsor",
    name: "LBA Sponsor",
    price: "$50",
    priceNumber: 50,
    period: "per month",
    badge: "Sponsor",
    icon: Crown,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    features: [
      "Everything in Pro",
      "50% off premium membership",
      "Verified badge",
      "AI powered insights",
      "Priority customer support",
      "Monthly performance report",
      "Monthly ad on TIG Solutions social media",
      "Discounted services from TIG Solutions"
    ]
  }
];