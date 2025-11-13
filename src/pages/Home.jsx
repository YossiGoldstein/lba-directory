import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Search, MapPin, TrendingUp, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Home() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("all");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await base44.entities.Category.filter({ is_active: true }, "sort_order", 10);
      } catch (error) {
        return [];
      }
    },
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['featured-businesses'],
    queryFn: async () => {
      try {
        return await base44.entities.Business.filter({ status: "approved", is_featured: true }, "-created_date", 6);
      } catch (error) {
        return [];
      }
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location !== 'all') params.set('location', location);
    window.location.href = createPageUrl(`CategoryListing?${params.toString()}`);
  };

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
            {categories.map((category) => (
              <Link
                key={category.id}
                to={createPageUrl(`CategoryListing?slug=${category.slug}`)}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {category.icon_name || '📁'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      {businesses.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Businesses
              </h2>
              <p className="text-lg text-gray-600">
                Discover highly rated businesses in your community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  to={createPageUrl(`BusinessListing?id=${business.id}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                    {business.is_lba_sponsor && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                        LBA Sponsor
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {business.business_name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {business.short_description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">
                          {business.average_rating || 0}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({business.reviews_count || 0})
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {business.city}, {business.state}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold"
              asChild
            >
              <Link to={createPageUrl("AddBusiness")}>
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
        </div>
      </section>
    </div>
  );
}