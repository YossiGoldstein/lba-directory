import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, Heart, MessageSquare, Search, Sparkles, Edit, Star, Bell,
  Building2, Plus, Eye, CheckCircle, Clock, XCircle
} from "lucide-react";
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
  const [stats, setStats] = useState({ favorites: 0, reviews: 0, searches: 0, notifications: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const customerData = localStorage.getItem("lba_customer");
        let userData;

        if (customerData) {
          const customer = JSON.parse(customerData);
          userData = {
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone,
            role: customer.role || "user"
          };
        } else {
          userData = await base44.auth.me();
        }

        setUser(userData);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "pending":  return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return null;
    }
  };

  const tabs = [
    { id: "profile",       label: "Profile",         icon: User },
    { id: "notifications", label: "Notifications",   icon: Bell, badge: stats.notifications > 0 ? stats.notifications : null },
    { id: "favorites",     label: "Favorites",        icon: Heart },
    { id: "reviews",       label: "My Reviews",       icon: MessageSquare },
    { id: "searches",      label: "Recent Searches",  icon: Search },
    { id: "activity",      label: "AI Activity",      icon: Sparkles },
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your profile, businesses, and activity</p>
        </div>

        {/* ── SECTION 1: Personal Info ── */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-24"></div>
          <CardContent className="relative pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1 mt-8 md:mt-4">
                <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                <p className="text-gray-600">{user.email}</p>
                {user.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
              </div>
              <Button onClick={() => setActiveTab("profile")} variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <button onClick={() => setActiveTab("favorites")} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.favorites}</span>
                </div>
                <span className="text-sm text-gray-600">Favorites</span>
              </button>
              <button onClick={() => setActiveTab("reviews")} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.reviews}</span>
                </div>
                <span className="text-sm text-gray-600">Reviews</span>
              </button>
              <button onClick={() => setActiveTab("searches")} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-5 h-5 text-purple-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.searches}</span>
                </div>
                <span className="text-sm text-gray-600">Searches</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* ── SECTION 2: My Businesses ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-cyan-600" />
              My Businesses
            </h2>
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
              <Link to={createPageUrl("AddBusiness")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Business
              </Link>
            </Button>
          </div>

          {myBusinesses.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Building2 className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No businesses listed yet</h3>
                <p className="text-gray-500 mb-6">Add your first business to appear in the Lakewood directory.</p>
                <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                  <Link to={createPageUrl("AddBusiness")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Business
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myBusinesses.map(business => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {business.logo_url ? (
                          <img src={business.logo_url} alt={business.business_name} className="w-14 h-14 rounded-lg object-cover" />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-7 h-7 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{business.business_name}</p>
                          {business.city && <p className="text-xs text-gray-500">{business.city}</p>}
                        </div>
                      </div>
                      {getStatusBadge(business.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-center bg-gray-50 rounded-lg p-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{business.views_count || 0}</p>
                        <p className="text-xs text-gray-500">Views</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{business.clicks_to_phone || 0}</p>
                        <p className="text-xs text-gray-500">Calls</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{business.reviews_count || 0}</p>
                        <p className="text-xs text-gray-500">Reviews</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => navigate(createPageUrl("BusinessDashboard") + `?edit=${business.id}`)}
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Business
                      </Button>
                      {business.status === "approved" && (
                        <Button asChild variant="outline" className="w-full" size="sm">
                          <Link to={createPageUrl("BusinessListing") + `?id=${business.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Public Page
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 3: Activity Tabs ── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 font-medium transition-colors whitespace-nowrap relative ${
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

        <div className="min-h-[400px]">
          {activeTab === "profile"       && <ProfileTab user={user} onUserUpdate={refreshStats} />}
          {activeTab === "notifications" && <NotificationsTab user={user} />}
          {activeTab === "favorites"     && <FavoritesTab user={user} />}
          {activeTab === "reviews"       && <MyReviewsTab user={user} />}
          {activeTab === "searches"      && <RecentSearchesTab user={user} />}
          {activeTab === "activity"      && <AiActivityTab user={user} />}
        </div>

      </div>
    </div>
  );
}