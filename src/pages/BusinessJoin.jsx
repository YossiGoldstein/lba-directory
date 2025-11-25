import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Shield,
  Search,
  Award,
  MapPin,
  DollarSign,
  Laptop,
  Zap,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function BusinessJoin() {
  const benefits = [
    {
      icon: Sparkles,
      title: "AI-Powered Discovery",
      description: "Our intelligent search helps customers find your business even when they don't know your exact name. When someone searches 'phone repair near me' or 'kosher pizza,' our AI matches intent to businesses — putting you in front of ready-to-buy customers."
    },
    {
      icon: TrendingUp,
      title: "Boost Your Local Visibility",
      description: "Get discovered by thousands of local shoppers actively searching for what you offer. Your business appears in relevant category pages, search results, and AI-powered recommendations throughout the directory."
    },
    {
      icon: Users,
      title: "Connect with Your Community",
      description: "Reach the Lakewood Haredi community directly. Our platform is designed with local values, modest presentation standards, and kosher-appropriate suggestions — ensuring your business reaches the right audience."
    },
    {
      icon: Target,
      title: "Targeted Marketing Tools",
      description: "Promote special deals, announce new services, and engage customers through your business dashboard. Feature time-sensitive promotions, seasonal offers, and exclusive member deals to drive foot traffic."
    },
    {
      icon: BarChart3,
      title: "Track Your Performance",
      description: "Monitor how customers find and interact with your listing. See profile views, website clicks, phone calls, and review trends — all from your business dashboard. Use insights to optimize your listing."
    },
    {
      icon: Shield,
      title: "Build Trust & Credibility",
      description: "Collect verified customer reviews, showcase your services with photos, and display your business hours and contact information. A complete profile builds trust and converts browsers into customers."
    }
  ];

  const valueProps = [
    {
      icon: Sparkles,
      label: "AI-Powered Visibility"
    },
    {
      icon: Award,
      label: "Professional Profile"
    },
    {
      icon: MapPin,
      label: "Local Community Focus"
    },
    {
      icon: DollarSign,
      label: "Deals & Promotions"
    },
    {
      icon: Laptop,
      label: "Easy Dashboard"
    },
    {
      icon: Zap,
      label: "Free Forever"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
            ✨ Join the LBA Directory Today
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
            Grow Your Local Business<br />With LBA Directory
          </h1>
          
          <p className="text-2xl md:text-3xl text-white/95 mb-10 font-light">
            Join thousands of Lakewood-area businesses — free and in minutes.
          </p>

          <Button 
            asChild
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 px-12 py-8 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <Link to={createPageUrl("AddBusiness")}>
              Register Your Business – FREE
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
          </Button>

          <p className="text-white/80 text-sm mt-6">
            ✓ Free forever &nbsp;•&nbsp; ✓ Set up in minutes &nbsp;•&nbsp; ✓ No credit card required
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why List Your Business With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a modern, AI-powered directory built specifically for the Lakewood community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const IconComponent = benefit.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-8 border border-gray-200"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-5">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Proposition Icons */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {valueProps.map((prop, idx) => {
              const IconComponent = prop.icon;
              return (
                <div 
                  key={idx}
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="w-8 h-8 text-cyan-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 text-center">
                    {prop.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strong Call to Action */}
      <section className="py-24 bg-gradient-to-br from-blue-700 via-cyan-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto px-4">
            Start reaching more customers today. Registration is free and takes less than 5 minutes.
          </p>

          <Button 
            asChild
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 px-6 sm:px-12 py-6 sm:py-8 text-base sm:text-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <Link to={createPageUrl("AddBusiness")} className="flex items-center justify-center gap-2 sm:gap-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="whitespace-nowrap">Register Your Business – FREE</span>
            </Link>
          </Button>

          <div className="mt-8 flex flex-col items-center gap-2 px-4">
            <p className="text-white/80 text-sm text-center">
              No credit card required. Listing approval required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/90 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Free Forever
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Quick Setup
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Full Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Getting Started is Easy
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to start growing your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Register Your Business
              </h3>
              <p className="text-gray-600">
                Fill out our simple form with your business details. Our AI assistant helps you create a professional description.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Get Approved
              </h3>
              <p className="text-gray-600">
                Our team reviews your listing to ensure quality and community standards. Most businesses are approved within 24-48 hours.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Start Growing
              </h3>
              <p className="text-gray-600">
                Your business goes live! Manage your profile, post deals, track performance, and connect with customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200 p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-8 h-8 text-yellow-400 fill-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-900 font-medium mb-4">
              "LBA Directory has helped us reach so many new customers. The AI search is amazing — people find us even when they search for what we do, not our exact name!"
            </blockquote>
            <p className="text-gray-600 font-medium">
              — Local Lakewood Business Owner
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Before Footer */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Hundreds of Local Businesses
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Don't get left behind — list your business today!
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-10 py-6 text-lg font-semibold shadow-xl"
          >
            <Link to={createPageUrl("AddBusiness")}>
              Get Started Now – It's Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Note Section */}
      <section className="py-8 bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            LBA Directory is powered by <strong>LBA Leagues</strong> and <strong>TIG Solutions</strong>, serving the Lakewood Haredi community.
          </p>
        </div>
      </section>
    </div>
  );
}