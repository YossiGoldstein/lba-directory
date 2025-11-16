import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Heart, MessageSquare, Search, Sparkles, Edit, Star } from "lucide-react";
import ProfileTab from "../components/dashboard/ProfileTab";
import FavoritesTab from "../components/dashboard/FavoritesTab";
import MyReviewsTab from "../components/dashboard/MyReviewsTab";
import RecentSearchesTab from "../components/dashboard/RecentSearchesTab";
import AiActivityTab from "../components/dashboard/AiActivityTab";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState({
    favorites: 0,
    reviews: 0,
    searches: 0,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Load stats
        const [favorites, reviews, searches] = await Promise.all([
          base44.entities.Favorite.list(),
          base44.entities.Review.list(),
          base44.entities.SearchHistory.list(),
        ]);

        setStats({
          favorites: favorites.filter(f => f.user_id === userData.id).length,
          reviews: reviews.filter(r => r.user_id === userData.id).length,
          searches: searches.filter(s => s.user_id === userData.id).length,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load user:", error);
        // Redirect to login if not authenticated
        base44.auth.redirectToLogin("/");
      }
    };

    loadUser();
  }, []);

  const refreshStats = async () => {
    if (!user) return;
    
    const [favorites, reviews, searches] = await Promise.all([
      base44.entities.Favorite.list(),
      base44.entities.Review.list(),
      base44.entities.SearchHistory.list(),
    ]);

    setStats({
      favorites: favorites.filter(f => f.user_id === user.id).length,
      reviews: reviews.filter(r => r.user_id === user.id).length,
      searches: searches.filter(s => s.user_id === user.id).length,
    });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "reviews", label: "My Reviews", icon: MessageSquare },
    { id: "searches", label: "Recent Searches", icon: Search },
    { id: "activity", label: "AI Activity", icon: Sparkles },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your profile, favorites, and activity</p>
        </div>

        {/* User Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-24"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => setActiveTab("profile")}
                variant="outline"
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setActiveTab("favorites")}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.favorites}</span>
                </div>
                <span className="text-sm text-gray-600">Favorites</span>
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.reviews}</span>
                </div>
                <span className="text-sm text-gray-600">Reviews</span>
              </button>

              <button
                onClick={() => setActiveTab("searches")}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-5 h-5 text-purple-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.searches}</span>
                </div>
                <span className="text-sm text-gray-600">Searches</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "profile" && (
            <ProfileTab user={user} onUserUpdate={refreshStats} />
          )}
          {activeTab === "favorites" && (
            <FavoritesTab user={user} />
          )}
          {activeTab === "reviews" && (
            <MyReviewsTab user={user} />
          )}
          {activeTab === "searches" && (
            <RecentSearchesTab user={user} />
          )}
          {activeTab === "activity" && (
            <AiActivityTab user={user} />
          )}
        </div>
      </div>
    </div>
  );
}