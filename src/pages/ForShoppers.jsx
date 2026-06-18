import React from "react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  Heart, 
  MessageSquare, 
  Gift, 
  Languages,
  CheckCircle,
  ShoppingBag
} from "lucide-react";

export default function ForShoppers() {
  const handleSignup = () => {
    window.location.href = createPageUrl("UserRegister");
  };

  const benefits = [
    {
      icon: Search,
      title: "AI-Powered Search",
      text: "Ask anything in English or Hebrew and instantly get accurate, community-appropriate results.",
      color: "bg-cyan-100 text-cyan-600"
    },
    {
      icon: MapPin,
      title: "Verified Local Information",
      text: "Hours, deals, directions, reviews, and more — all in one place.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Heart,
      title: "Save Your Favorites",
      text: "Create a free account and save your go-to stores and services.",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: MessageSquare,
      title: "Leave Reviews",
      text: "Share your experience and help the Lakewood community shop smarter.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Gift,
      title: "Personalized Deals",
      text: "Get exclusive discounts, giveaways, and special offers.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Languages,
      title: "Multi-Language Support",
      text: "We understand English and Hebrew — ask in whichever language you prefer.",
      color: "bg-green-100 text-green-600"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Search",
      description: "Type or ask anything using the AI-powered smart search bar."
    },
    {
      number: 2,
      title: "Explore",
      description: "View business cards, deals, reviews, and categories."
    },
    {
      number: 3,
      title: "Save",
      description: "Save favorites and build your personal list."
    },
    {
      number: 4,
      title: "Benefit",
      description: "Get better results and personalized deals over time."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-blue-700 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Discover a Smarter Way to Shop in Lakewood
              </h1>
              <p className="text-xl md:text-2xl text-cyan-50 mb-8">
                AI-powered search, verified business info, personalized deals, all in one place.
              </p>
              <Button
                onClick={handleSignup}
                size="lg"
                className="bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-6 text-lg font-semibold shadow-xl"
              >
                Sign Up Free
              </Button>
            </div>
            
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <ShoppingBag className="w-32 h-32 mx-auto text-white mb-6" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                      <CheckCircle className="w-6 h-6 text-green-300" />
                      <span className="text-sm">AI-Powered Smart Search</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                      <CheckCircle className="w-6 h-6 text-green-300" />
                      <span className="text-sm">Verified Local Businesses</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                      <CheckCircle className="w-6 h-6 text-green-300" />
                      <span className="text-sm">Exclusive Member Deals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Use LBA Directory?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to shop smarter in the Lakewood community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow border-2 border-gray-100">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {benefit.text}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Start shopping smarter in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-bold">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-300 to-blue-300 -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-cyan-600 via-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Join?
          </h2>
          <p className="text-xl md:text-2xl text-cyan-50 mb-10 max-w-2xl mx-auto">
            Create your free account and start discovering everything Lakewood has to offer.
          </p>
          <Button
            onClick={handleSignup}
            size="lg"
            className="bg-white text-cyan-700 hover:bg-cyan-50 px-10 py-7 text-xl font-semibold shadow-2xl"
          >
            Get Started Now! It's Free
          </Button>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex flex-wrap justify-center gap-6 text-cyan-100 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Join Thousands of Members</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}