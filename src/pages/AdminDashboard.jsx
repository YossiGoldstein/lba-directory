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
import CustomersTab from "../components/admin/CustomersTab";
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
    totalCustomers: 0,
    totalReviews: 0,
    activeDeals: 0,
    reports: 0
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for customer/business session in localStorage
        const customerData = localStorage.getItem("lba_customer");
        if (customerData) {
          const customer = JSON.parse(customerData);
          
          // Check if admin
          if (customer.role === "admin") {
            setUser(customer);
            await loadStats();
            setLoading(false);
            return;
          }
        }
        
        // Not admin, redirect to home
        navigate(createPageUrl("Home"));
      } catch (error) {
        navigate(createPageUrl("Home"));
      }
    };

    loadUser();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [businesses, customers, reviews, deals] = await Promise.all([
        base44.entities.Business.list(),
        base44.entities.Customer.list(),
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
        totalUsers: 0,
        totalCustomers: customers.length,
        totalReviews: reviews.length,
        activeDeals: activeDealsCount,
        reports: 0
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
                onClick={() => {
                  localStorage.removeItem("lba_customer");
                  window.location.href = createPageUrl("Home");
                }}
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
              <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="text-sm text-gray-600">Registered Customers</p>
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
          <div className="flex flex-wrap gap-2 mb-2">
            {[
              { value: "businesses", label: "Businesses" },
              { value: "pending", label: "Pending Approvals", badge: stats.pendingBusinesses },
              { value: "customers", label: "Customers" },
              { value: "users", label: "System Users" },
              { value: "reviews", label: "Reviews & Reports" },
              { value: "deals", label: "Deals" },
              { value: "categories", label: "Categories" },
              { value: "ai", label: "AI Moderation" },
              { value: "geocode", label: "Geocode" },
              { value: "password-setup", label: "Password Setup" },
              { value: "migrate-images", label: "Migrate Images" },
            ].map(tab => (
              <TabsList key={tab.value} className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value={tab.value}
                  className="border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm font-medium shadow-sm data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:border-cyan-600 hover:bg-gray-50 flex items-center gap-1"
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <Badge className="ml-1 bg-orange-500 text-white text-xs">{tab.badge}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            ))}
          </div>

          <TabsContent value="businesses">
            <BusinessesTab onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="pending">
            <PendingApprovalsTab onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab />
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

          <TabsContent value="geocode">
            <Card>
              <CardHeader>
                <CardTitle>Geocode Business Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <GeocodeTab onUpdate={loadStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password-setup">
            <Card>
              <CardHeader>
                <CardTitle>Send Password Setup Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordSetupTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="migrate-images">
            <Card>
              <CardHeader>
                <CardTitle>Migrate WordPress Images</CardTitle>
              </CardHeader>
              <CardContent>
                <MigrateImagesTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PasswordSetupTab() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendEmails = async () => {
    if (!confirm("This will send password setup emails to all approved businesses without passwords. Continue?")) {
      return;
    }

    setIsSending(true);
    setResult(null);
    
    try {
      const response = await base44.functions.invoke('sendPasswordSetupEmails', {});
      setResult(response.data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          Send password setup emails to all approved business owners who haven't set their password yet.
          The email includes a secure link to set their password and access their business dashboard.
        </p>
      </div>

      <Button 
        onClick={handleSendEmails} 
        disabled={isSending}
        className="bg-cyan-600 hover:bg-cyan-700"
      >
        {isSending ? 'Sending Emails...' : 'Send Password Setup Emails'}
      </Button>

      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Results:</h3>
          {result.error ? (
            <p className="text-red-600">Error: {result.error}</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Sent Successfully</p>
                  <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{result.failCount}</p>
                </div>
              </div>

              {result.results && result.results.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-gray-900 mb-2">Email Status:</h4>
                  <div className="space-y-2">
                    {result.results.map((item, idx) => (
                      <div key={idx} className="text-sm border-b border-gray-100 pb-2">
                        <p className="font-medium">{item.business}</p>
                        <p className="text-gray-600">{item.email}</p>
                        <p className={item.status === 'sent' ? 'text-green-600' : 'text-red-600'}>
                          {item.status === 'sent' ? '✓ Email Sent' : '✗ Failed: ' + item.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MigrateImagesTab() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async (dryRun) => {
    if (!dryRun && !confirm("This will download all WordPress images and re-upload them to storage, updating all database URLs. Continue?")) return;
    setIsRunning(true);
    setResult(null);
    try {
      const response = await base44.functions.invoke('migrateWordPressImages', { dry_run: dryRun });
      setResult(response.data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const report = result?.report;

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-gray-700 font-medium mb-1">⚠️ What this does:</p>
        <p className="text-sm text-gray-600">Downloads broken WordPress image URLs from the old server, uploads them to Supabase Storage, and updates all business records automatically. No manual re-upload needed.</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => handleRun(true)} disabled={isRunning}>
          {isRunning ? 'Running...' : '🔍 Dry Run (Preview Only)'}
        </Button>
        <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => handleRun(false)} disabled={isRunning}>
          {isRunning ? 'Migrating...' : '🚀 Run Migration'}
        </Button>
      </div>

      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          {result.error ? (
            <p className="text-red-600">Error: {result.error}</p>
          ) : report ? (
            <>
              {report.dry_run && <p className="text-amber-600 font-medium">⚠️ DRY RUN — no changes were made</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold">{report.total_businesses}</p>
                  <p className="text-xs text-gray-500">Total Businesses</p>
                </div>
                <div className="bg-amber-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-amber-600">{report.businesses_with_wp_images}</p>
                  <p className="text-xs text-gray-500">With WP Images</p>
                </div>
                <div className="bg-green-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-green-600">{report.images_migrated}</p>
                  <p className="text-xs text-gray-500">Images Migrated</p>
                </div>
                <div className="bg-red-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-red-600">{report.images_failed}</p>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
                <div className="bg-blue-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-blue-600">{report.images_skipped_already_migrated}</p>
                  <p className="text-xs text-gray-500">Already Migrated</p>
                </div>
                <div className="bg-purple-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-purple-600">{report.businesses_updated}</p>
                  <p className="text-xs text-gray-500">Businesses Updated</p>
                </div>
              </div>

              {report.details?.length > 0 && (
                <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-semibold">Business</th>
                        <th className="text-left p-2 font-semibold">Type</th>
                        <th className="text-left p-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.details.flatMap((biz) => {
                        const rows = [];
                        if (biz.logo) rows.push({ name: biz.name, type: 'Logo', ...biz.logo });
                        biz.gallery.forEach((g, i) => rows.push({ name: biz.name, type: `Gallery ${i+1}`, ...g }));
                        return rows;
                      }).map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="p-2 font-medium">{row.name}</td>
                          <td className="p-2 text-gray-500">{row.type}</td>
                          <td className={`p-2 font-medium ${row.status === 'migrated' ? 'text-green-600' : row.status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
                            {row.status === 'migrated' ? '✅ Migrated' : row.status === 'failed' ? `❌ ${row.reason}` : '🔍 Would migrate'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {report.errors?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm font-semibold text-red-700 mb-2">DB Update Errors:</p>
                  {report.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">{e.business}: {e.error}</p>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function GeocodeTab({ onUpdate }) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleGeocode = async () => {
    setIsRunning(true);
    setResult(null);
    
    try {
      const response = await base44.functions.invoke('geocodeBusinesses', {});
      setResult(response.data);
      if (onUpdate) onUpdate();
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          This tool converts business addresses to GPS coordinates and saves them to the database. 
          This is required for businesses to appear on the map in category pages.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          The process takes about 1 second per business (due to OpenStreetMap rate limits).
        </p>
      </div>

      <Button 
        onClick={handleGeocode} 
        disabled={isRunning}
        className="bg-cyan-600 hover:bg-cyan-700"
      >
        {isRunning ? 'Processing...' : 'Convert Addresses to Coordinates'}
      </Button>

      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Results:</h3>
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Total Businesses</p>
                  <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Needed Geocoding</p>
                  <p className="text-2xl font-bold text-blue-600">{result.needGeocoding}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Successfully Updated</p>
                  <p className="text-2xl font-bold text-green-600">{result.updated}</p>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                </div>
              </div>

              {result.details && result.details.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-gray-900 mb-2">Details:</h4>
                  <div className="space-y-2">
                    {result.details.map((item, idx) => (
                      <div key={idx} className="text-sm border-b border-gray-100 pb-2">
                        <p className="font-medium">{item.business}</p>
                        <p className={item.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                          {item.status === 'success' ? '✓ Success' : '✗ ' + item.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}