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
          <p className="text-xl text-cyan-50">Your comprehensive local business and shopping online directory</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Lakewood Shopping Today */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Lakewood Shopping Today</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="mb-4">
              Lakewood has experienced substantial growth in the past decade, expanding rapidly into Toms River, Jackson, Brick, Howell, and Manchester. Once, Lakewooders traveled out of town for certain stores and brands. Today, those stores and businesses have come here, and new businesses are opening every month.
            </p>
            <p className="mb-4">
              With thousands of businesses serving the Lakewood community, shoppers can find almost anything. However, finding the right store or business at the right time and within budget is not always simple.
            </p>
          </div>
        </section>

        {/* The Challenge */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Not all businesses have an online or social media presence</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Special or late store hours can be unknown or inaccurate</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Business sales are scattered across different platforms and are hard to find</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">No single place for local, reliable business recommendations</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Searching for specific services can be challenging</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Planning the order of stores during a shopping trip can be overwhelming</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Finding accurate business details (links, ads, channels) can be frustrating</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">There is no single place with complete information for all businesses</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">With so many stores, shoppers may miss sales at their favorite shops</p>
            </div>
          </div>
        </section>

        {/* That's Where the LBA Directory Comes In */}
        <section className="mb-16">
          <p className="text-xl font-semibold text-gray-900 mb-8">
            That's Where the LBA Directory Comes In
          </p>
          <p className="text-gray-700 leading-relaxed mb-8">
            The Lakewood Business Alliance Directory serves as a central hub for everything related to the Lakewood business and shopping world.
          </p>
        </section>

        {/* What LBA Directory Offers */}
        <section className="mb-16 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What LBA Directory Offers</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-cyan-200">
              <MapPin className="w-6 h-6 text-cyan-600 flex-shrink-0" />
              <span className="text-gray-700">Up-to-date store hours</span>
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
              <span className="text-gray-700">Full business details</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-cyan-300 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Advanced Smart Search
                </h3>
                <p className="text-gray-700 mb-4">
                  No need for keywords or tags. Users can type exactly what they are looking for, for example:
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-cyan-600">•</span>
                    <span className="italic">"A store with night hours that has a sale on kids shoes"</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-cyan-600">•</span>
                    <span className="italic">"A mobile tire shop that comes to you with a 5-star review"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* It's Rewarding */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">It's Rewarding</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-6">
            <p className="mb-6">
              Users can search freely without an account. By creating a free account, users become members and enjoy additional benefits.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Bookmark favorite businesses and shops</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Leave reviews to share experiences with the community</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Access exclusive member offers</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Participate in periodic giveaways</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0 mt-2"></div>
              <p className="text-gray-700">Stay tuned for more features coming soon</p>
            </div>
          </div>
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
              <Link to={createPageUrl("UserRegister")}>
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