import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  Star, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Shield,
  LogOut
} from "lucide-react";
import BusinessesTab from "../components/admin/BusinessesTab";
import PendingApprovalsTab from "../components/admin/PendingApprovalsTab";
import UsersTab from "../components/admin/UsersTab";
import ReviewsReportsTab from "../components/admin/ReviewsReportsTab";
import DealsOverviewTab from "../components/admin/DealsOverviewTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import AiModerationTab from "../components/admin/AiModerationTab";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingBusinesses: 0,
    totalUsers: 0,
    totalReviews: 0,
    activeDeals: 0,
    reports: 0
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        
        // Check if user is admin
        if (!userData || userData.role !== 'admin') {
          navigate(createPageUrl("Home"));
          return;
        }
        
        setUser(userData);
        await loadStats();
      } catch (error) {
        navigate(createPageUrl("Home"));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [businesses, users, reviews, deals] = await Promise.all([
        base44.entities.Business.list(),
        base44.entities.User.list(),
        base44.entities.Review.list(),
        base44.entities.Deal.list()
      ]);

      const now = new Date();
      const activeDealsCount = deals.filter(deal => {
        if (!deal.is_active) return false;
        const start = new Date(deal.start_date);
        const end = new Date(deal.end_date);
        return start <= now && end >= now;
      }).length;

      setStats({
        totalBusinesses: businesses.length,
        pendingBusinesses: businesses.filter(b => b.status === 'pending').length,
        totalUsers: users.length,
        totalReviews: reviews.length,
        activeDeals: activeDealsCount,
        reports: 0 // Will implement reports entity
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You do not have permission to view this page.
            </p>
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
              <Link to={createPageUrl("Home")}>Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-cyan-600" />
                Admin Dashboard – LBA Directory
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage businesses, users, and content
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                <Badge className="bg-cyan-600 text-white">Admin</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => base44.auth.logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-cyan-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBusinesses}</p>
              <p className="text-sm text-gray-600">Total Businesses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingBusinesses}</p>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeDeals}</p>
              <p className="text-sm text-gray-600">Active Deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.reports}</p>
              <p className="text-sm text-gray-600">Reports / Issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="businesses" className="space-y-4">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approvals
              {stats.pendingBusinesses > 0 && (
                <Badge className="ml-2 bg-orange-500">{stats.pendingBusinesses}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reviews">Reviews & Reports</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="ai">AI Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses">
            <BusinessesTab onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="pending">
            <PendingApprovalsTab onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsReportsTab />
          </TabsContent>

          <TabsContent value="deals">
            <DealsOverviewTab />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>

          <TabsContent value="ai">
            <AiModerationTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}