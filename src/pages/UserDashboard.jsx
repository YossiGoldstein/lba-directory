import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Heart, MessageSquare, Search, Sparkles, Edit, Star, Bell, Building2, Plus } from "lucide-react";
import ProfileTab from "../components/dashboard/ProfileTab";
import FavoritesTab from "../components/dashboard/FavoritesTab";
import MyReviewsTab from "../components/dashboard/MyReviewsTab";
import RecentSearchesTab from "../components/dashboard/RecentSearchesTab";
import AiActivityTab from "../components/dashboard/AiActivityTab";
import NotificationsTab from "../components/dashboard/NotificationsTab";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [stats, setStats] = useState({
    favorites: 0,
    reviews: 0,
    searches: 0,
    notifications: 0,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for customer session first
        const customerData = localStorage.getItem("lba_customer");
        let userData;
        
        if (customerData) {
          const customer = JSON.parse(customerData);
          userData = {
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone,
            role: "user"
          };
        } else {
          // Fallback to base44 auth
          userData = await base44.auth.me();
        }
        
        setUser(userData);
        
        // Load stats + businesses
        const [favorites, reviews, searches, notifications, allBusinesses] = await Promise.all([
          base44.entities.Favorite.list(),
          base44.entities.Review.list(),
          base44.entities.SearchHistory.list(),
          base44.entities.Notification.list(),
          base44.entities.Business.list(),
        ]);

        const userBusinesses = allBusinesses.filter(b => 
          b.owner_id === userData.id || 
          b.email === userData.email || 
          b.created_by === userData.email
        );
        setMyBusinesses(userBusinesses);

        setStats({
          favorites: favorites.filter(f => f.user_id === userData.id).length,
          reviews: reviews.filter(r => r.user_id === userData.id).length,
          searches: searches.filter(s => s.user_id === userData.id).length,
          notifications: notifications.filter(n => n.customer_id === userData.id && !n.is_read).length,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load user:", error);
        // Redirect to login if not authenticated
        window.location.href = createPageUrl("SignIn");
      }
    };

    loadUser();
  }, []);

  const refreshStats = async () => {
    if (!user) return;
    
    const [favorites, reviews, searches, notifications] = await Promise.all([
      base44.entities.Favorite.list(),
      base44.entities.Review.list(),
      base44.entities.SearchHistory.list(),
      base44.entities.Notification.list(),
    ]);

    setStats({
      favorites: favorites.filter(f => f.user_id === user.id).length,
      reviews: reviews.filter(r => r.user_id === user.id).length,
      searches: searches.filter(s => s.user_id === user.id).length,
      notifications: notifications.filter(n => n.customer_id === user.id && !n.is_read).length,
    });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "businesses", label: "My Businesses", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell, badge: stats.notifications > 0 ? stats.notifications : null },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "reviews", label: "My Reviews", icon: MessageSquare },
    { id: "searches", label: "Recent Searches", icon: Search },
    { id: "activity", label: "AI Activity", icon: Sparkles },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your profile, favorites, and activity</p>
        </div>

        {/* User Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-24"></div>
          <CardContent className="relative pt-6 pb-6">
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
              <div className="flex-1 mt-8 md:mt-4">
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
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? "text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
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
          {activeTab === "businesses" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Businesses</h2>
                <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                  <Link to={createPageUrl("AddBusiness")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Link>
                </Button>
              </div>
              {myBusinesses.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You haven't listed any businesses yet.</p>
                    <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                      <Link to={createPageUrl("AddBusiness")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your Business
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myBusinesses.map(business => (
                    <Card key={business.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {business.logo_url ? (
                            <img src={business.logo_url} alt={business.business_name} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{business.business_name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              business.status === 'approved' ? 'bg-green-100 text-green-700' :
                              business.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {business.status}
                            </span>
                          </div>
                        </div>
                        <Button
                          asChild
                          className="w-full bg-cyan-600 hover:bg-cyan-700"
                          size="sm"
                        >
                          <Link to={createPageUrl("BusinessDashboard") + `?edit=${business.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Manage
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "notifications" && (
            <NotificationsTab user={user} />
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