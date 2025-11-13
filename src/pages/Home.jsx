import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Search, MapPin, TrendingUp, Users, Star, UtensilsCrossed, Shirt, Briefcase, Home as HomeIcon, Car, Book, Sparkles, PartyPopper, GraduationCap, HandHeart, ArrowRight } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [location, setLocation] = React.useState("all");

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = createPageUrl(`CategoryListing?q=${searchQuery}&location=${location}`);
  };

  const categories = [
    { id: 1, name: "Food", slug: "food", icon: UtensilsCrossed },
    { id: 2, name: "Apparel", slug: "apparel", icon: Shirt },
    { id: 3, name: "Services", slug: "services", icon: Briefcase },
    { id: 4, name: "Home", slug: "home", icon: HomeIcon },
    { id: 5, name: "Auto", slug: "auto", icon: Car },
    { id: 6, name: "Judaica", slug: "judaica", icon: Book },
    { id: 7, name: "Beauty", slug: "beauty", icon: Sparkles },
    { id: 8, name: "Fun", slug: "fun", icon: PartyPopper },
    { id: 9, name: "Education", slug: "education", icon: GraduationCap },
    { id: 10, name: "Org/Gmach", slug: "org-gmach", icon: HandHeart },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Local Businesses in Lakewood
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Your comprehensive directory for the best shops, services, and deals in our community
          </p>

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search businesses, services, or products..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl md:w-48">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <select
                  className="flex-1 bg-transparent border-none outline-none text-gray-900"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="all">All Lakewood</option>
                  <option value="downtown">Downtown</option>
                  <option value="west">West Side</option>
                  <option value="east">East Side</option>
                </select>
              </div>
              <Button 
                type="submit"
                size="lg" 
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 rounded-xl font-semibold"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-lg"><strong className="text-white">500+</strong> Local Businesses</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <span className="text-lg"><strong className="text-white">50+</strong> Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              <span className="text-lg"><strong className="text-white">98%</strong> Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find local businesses organized by what you need
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={createPageUrl(`CategoryListing?slug=${category.slug}`)}
                  className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shopper Benefits */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                For Shoppers
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Discover the best local businesses, save your favorites, and never miss a deal
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Save Your Favorites</h3>
                    <p className="text-purple-100">Keep track of businesses you love</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Post Reviews</h3>
                    <p className="text-purple-100">Share your experiences with the community</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Get Exclusive Deals</h3>
                    <p className="text-purple-100">Access special promotions and discounts</p>
                  </div>
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link to={createPageUrl("Register")}>
                  Create Shopper Account
                </Link>
              </Button>
            </div>
            <div className="hidden lg:block">
              <div className="bg-purple-500 bg-opacity-30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Search className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Easy Search</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Local Focus</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Save Favorites</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Star className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Read Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Benefits */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="hidden lg:block">
              <div className="bg-blue-500 bg-opacity-30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Grow Sales</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Reach Customers</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Feature Deals</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Star className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Build Trust</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                For Business Owners
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Grow your business and reach more customers in the Lakewood community
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Increase Visibility</h3>
                    <p className="text-blue-100">Get discovered by thousands of local shoppers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Connect with Customers</h3>
                    <p className="text-blue-100">Build relationships and grow your customer base</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Promote Your Deals</h3>
                    <p className="text-blue-100">Feature special offers and promotions</p>
                  </div>
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link to={createPageUrl("AddBusiness")}>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Add Your Business
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with LBA Directory is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-lg">
                <Search className="w-12 h-12" />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                Step 1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Search the Directory
              </h3>
              <p className="text-gray-600">
                Find local businesses by category, keyword, or location.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-12 h-12" />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                Step 2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Discover Deals
              </h3>
              <p className="text-gray-600">
                See the latest sales and promotions from local shops.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-lg">
                <Heart className="w-12 h-12" />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                Step 3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Save & Review
              </h3>
              <p className="text-gray-600">
                Create an account to save favorites and leave reviews.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-12 h-12" />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                Step 4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Grow Your Business
              </h3>
              <p className="text-gray-600">
                Business owners can list and promote their services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join the Lakewood Business Alliance Directory today
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link to={createPageUrl("AddBusiness")}>
                <ArrowRight className="w-5 h-5 mr-2" />
                Add Your Business
              </Link>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-6 text-lg font-semibold"
              asChild
            >
              <Link to={createPageUrl("Register")}>
                Create Account
              </Link>
            </Button>
          </div>

          <div className="mt-16 pt-8 border-t border-blue-700">
            <p className="text-blue-200 mb-4">Trusted by the Lakewood community</p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-300">
              <div>✓ Free Basic Listings</div>
              <div>✓ Verified Reviews</div>
              <div>✓ Local Community</div>
              <div>✓ Easy to Use</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}