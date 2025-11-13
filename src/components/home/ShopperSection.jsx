import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Heart, Star, Tag, Gift, Check } from "lucide-react";

export default function ShopperSection({ user }) {
  const benefits = [
    {
      icon: Heart,
      text: "Save your favorite shops for quick access"
    },
    {
      icon: Star,
      text: "Post reviews and share your experience"
    },
    {
      icon: Tag,
      text: "Get access to special deals and promotions"
    },
    {
      icon: Gift,
      text: "Join giveaways and rewards (coming soon)"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
              FOR SHOPPERS
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              I AM A SHOPPER
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Discover local businesses, save your favorites, and never miss a deal.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-gray-700 font-medium">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            {user ? (
              <Button 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                asChild
              >
                <Link to={createPageUrl("UserDashboard")}>
                  Go to My Dashboard
                </Link>
              </Button>
            ) : (
              <Button 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                asChild
              >
                <Link to={createPageUrl("Register")}>
                  Create Shopper Account
                </Link>
              </Button>
            )}
          </div>

          {/* Right Side - Illustration */}
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-100 to-purple-200 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <Heart className="w-16 h-16 text-purple-600" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}