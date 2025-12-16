import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { 
  Eye, Search, Users, TrendingUp, BarChart3, 
  Star, Zap, CheckCircle, ArrowRight 
} from "lucide-react";

export default function BusinessJoin() {
  const handleGetStarted = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      window.location.href = createPageUrl("AddBusiness");
    } else {
      window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(createPageUrl("AddBusiness"));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Grow your local business with the LBA Directory
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-cyan-50">
            Join thousands of businesses in the greater Lakewood area and register your business for free!
          </p>
          <p className="text-lg mb-8 text-cyan-100">
            Premium listing packages available after registration
          </p>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-cyan-700 hover:bg-cyan-50 font-bold text-lg px-8 py-6 shadow-xl flex items-center justify-center"
          >
            Get Started Now! It's Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Why List With Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Why list your business with us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Boost Your Local Visibility
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get discovered by thousands of local consumers searching for what you offer. Your business appears not only in direct search results, but also as a relevant recommendation across the directory through our AI-powered system.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI-Powered Discovery
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI search helps customers find your business even when they don't know exactly what they need. When users search for a product or service, we intelligently match them with the right business, putting you in front of ready-to-buy customers.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Connect with Real Customers
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your content, updates, and promotions automatically reach customers who bookmark your business, leave a review, or show interest in your listing.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Targeted Marketing Tools
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Each business gets a dedicated page with full control over content and promotions. Promote special deals, new services, seasonal announcements, and exclusive offers for LBA Directory members and loyal customers.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Track Your Performance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in transparency. Access detailed insights from your business dashboard, including views, clicks, customer engagement, and review trends.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Build Trust & Credibility
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Collect verified reviews, showcase your services with photos and videos, and present complete business information. A strong profile builds trust and turns visitors into customers.
              </p>
            </div>

            {/* Benefit 7 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Advance Your Business Performance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Upgrade to premium listing packages for additional benefits such as featured placement, advertising options, discounted marketing tools, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Join */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Ready to join?
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Getting started is easy!
          </p>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Create an account and add your business
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Fill out a simple form with your business details. Use our AI assistant if you need help creating a professional listing. No need to complete everything at once – our team is happy to assist.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Get your listing approved
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We review each listing and help you complete it if needed. Once approved, your business goes live on the directory.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Start growing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Manage and update your listing from your dashboard, track performance stats, and upgrade to premium when you're ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Create an account or sign in and add your business
          </h2>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-cyan-700 hover:bg-cyan-50 font-bold text-lg px-10 py-6 shadow-xl flex items-center justify-center"
          >
            Get Started Now! It's Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}