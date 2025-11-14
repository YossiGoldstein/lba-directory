import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Heart, Gift, MapPin, TrendingUp, Star } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-cyan-50">Your AI-powered local shopping assistant</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Lakewood Shopping Today */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Lakewood Shopping Today</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              Lakewood has experienced substantial growth in the past decade, expanding rapidly into Toms River, Jackson, Brick, Howell, and Manchester. Once, residents traveled to Brooklyn for certain stores and brands — today those brands have come here, and new shops open every month.
            </p>
            <p>
              With several thousand businesses serving the Lakewood community, shoppers can find almost anything — but finding the right place at the right time is not always simple.
            </p>
          </div>
        </section>

        {/* The Challenge */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-6">
            <p className="mb-6">
              A thriving shopping community is a blessing, but it also creates challenges:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 font-bold">✗</span>
              </div>
              <p className="text-gray-700">Store hours online are often outdated or inaccurate</p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 font-bold">✗</span>
              </div>
              <p className="text-gray-700">Weekly sales are scattered across different platforms</p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 font-bold">✗</span>
              </div>
              <p className="text-gray-700">It's hard to find reliable recommendations</p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 font-bold">✗</span>
              </div>
              <p className="text-gray-700">Searching for specific services can take time and effort</p>
            </div>
          </div>

          <p className="text-lg font-semibold text-gray-900 mt-8">
            That's where LBA Directory comes in.
          </p>
        </section>

        {/* LBA Directory */}
        <section className="mb-16 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">LBA Directory – Your Local Shopping Assistant</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8">
            <p className="mb-6">
              LBA Directory is a project of the Lakewood Business Alliance (LBA) and serves as a central hub for everything you need:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-cyan-200">
              <MapPin className="w-6 h-6 text-cyan-600 flex-shrink-0" />
              <span className="text-gray-700">Store hours (including extended hours before Yom Tov)</span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-cyan-200">
              <TrendingUp className="w-6 h-6 text-cyan-600 flex-shrink-0" />
              <span className="text-gray-700">Current sales and promotions</span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-cyan-200">
              <Search className="w-6 h-6 text-cyan-600 flex-shrink-0" />
              <span className="text-gray-700">Social media links</span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-cyan-200">
              <Star className="w-6 h-6 text-cyan-600 flex-shrink-0" />
              <span className="text-gray-700">Reviews and ratings</span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-cyan-200 md:col-span-2">
              <MapPin className="w-6 h-6 text-cyan-600 flex-shrink-0" />
              <span className="text-gray-700">Business details and directions</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-cyan-300 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Advanced AI-Powered Smart Search
                </h3>
                <p className="text-gray-700 mb-4">
                  You don't need to know which filters to apply. Just type or speak naturally:
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-cyan-600">•</span>
                    <span className="italic">"Dairy restaurant open now in Lakewood"</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-cyan-600">•</span>
                    <span className="italic">"Phone repair in Jackson"</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-cyan-600">•</span>
                    <span className="italic">"Sheitel stylist with good reviews"</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-cyan-600">•</span>
                    <span className="italic">"Any deals today for kids' clothing?"</span>
                  </div>
                </div>
                <p className="text-gray-700">
                  Our AI assistant understands, interprets, and delivers the most relevant results — including business info, similar places, deals, hours, and more.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* It's Rewarding */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">It's Rewarding</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-6">
            <p className="mb-6">
              You can freely use the LBA Directory without an account.
            </p>
            <p className="mb-6">
              But becoming an LBA member gives you extra perks:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Heart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Bookmark favorite shops</h4>
                <p className="text-sm text-gray-600">Save and organize your go-to businesses</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Star className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Leave reviews</h4>
                <p className="text-sm text-gray-600">Share your experiences with the community</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Access exclusive monthly deals</h4>
                <p className="text-sm text-gray-600">Get special offers just for members</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Gift className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Participate in member giveaways</h4>
                <p className="text-sm text-gray-600">Win gift cards to your favorite shops</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300">
            <div className="flex items-start gap-4">
              <Gift className="w-10 h-10 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Double Your Winnings!</h3>
                <p className="text-gray-700">
                  Winners receive gift cards to their favorite shops — and if they posted a review or bookmarked a business that month, <strong>the gift card amount is doubled</strong>.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-lg text-gray-700 mt-8 font-medium">
            Stay tuned and look out for our emails!
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-cyan-50 mb-8 max-w-2xl mx-auto">
            Join LBA Directory today and discover a smarter way to shop in Lakewood
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-6 text-lg"
            >
              <Link to={createPageUrl("Register")}>
                Create Free Account
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-cyan-700 px-8 py-6 text-lg"
            >
              <Link to={createPageUrl("Home")}>
                Explore Directory
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}