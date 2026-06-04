import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Building2, CheckCircle, Clock, XCircle, Home, Edit3, ImageIcon, Tag, Star, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import BusinessHeader from "../components/business-dashboard/BusinessHeader";
import OverviewTab from "../components/business-dashboard/OverviewTab";
import EditBusinessTab from "../components/business-dashboard/EditBusinessTab";
import GalleryTab from "../components/business-dashboard/GalleryTab";
import OpeningHoursTab from "../components/business-dashboard/OpeningHoursTab";
import DealsTab from "../components/business-dashboard/DealsTab";
import ReviewsTab from "../components/business-dashboard/ReviewsTab";
import AiAssistantTab from "../components/business-dashboard/AiAssistantTab";
import UpgradeTab from "../components/business-dashboard/UpgradeTab";

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const justSubmitted = urlParams.get("submitted") === "true";
  const editBusinessId = urlParams.get("edit");

  useEffect(() => {
    const loadUser = () => {
      try {
        // Check for customer/business session in localStorage
        const customerData = localStorage.getItem("lba_customer");
        if (customerData) {
          const customer = JSON.parse(customerData);
          setUser({
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            role: customer.role || "user"
          });
        } else {
          // No session found, redirect to login
          window.location.href = createPageUrl("SignIn");
        }
      } catch (error) {
        window.location.href = createPageUrl("SignIn");
      } finally {
        setUserLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: businesses = [], isLoading: businessesLoading, refetch: refetchBusinesses } = useQuery({
    queryKey: ["my-businesses", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      // Server-side filter by owner: combine matches across owner_id, email,
      // and created_by (legacy flows) without listing every business.
      const [byOwnerId, byEmail, byCreatedBy] = await Promise.all([
        user.id ? base44.entities.Business.filter({ owner_id: user.id }) : Promise.resolve([]),
        base44.entities.Business.filter({ email: user.email }),
        base44.entities.Business.filter({ created_by: user.email }),
      ]);
      // Deduplicate by id (a business may match more than one predicate).
      const byId = new Map();
      [...byOwnerId, ...byEmail, ...byCreatedBy].forEach(b => byId.set(b.id, b));
      return Array.from(byId.values());
    },
    enabled: !!user?.email,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return await base44.entities.Category.list();
    },
  });

  const selectedBusiness = editBusinessId 
    ? businesses.find(b => b.id === editBusinessId) 
    : null;

  const { data: category } = useQuery({
    queryKey: ["category", selectedBusiness?.category_id],
    queryFn: async () => {
      if (!selectedBusiness?.category_id) return null;
      return categories.find(c => c.id === selectedBusiness.category_id);
    },
    enabled: !!selectedBusiness?.category_id,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["business-deals", selectedBusiness?.id],
    queryFn: async () => {
      if (!selectedBusiness?.id) return [];
      return await base44.entities.Deal.filter({ business_id: selectedBusiness.id });
    },
    enabled: !!selectedBusiness?.id,
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "edit", label: "Edit Details", icon: Edit3 },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "hours", label: "Hours", icon: Clock },
    { id: "deals", label: "Deals", icon: Tag },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "ai", label: "AI Assistant", icon: Sparkles },
    { id: "upgrade", label: "Upgrade", icon: Building2 },
  ];

  const handleApplyToDescription = async (newDescription) => {
    await base44.entities.Business.update(selectedBusiness.id, {
      long_description: newDescription,
    });
    refetchBusinesses();
    setActiveTab("edit");
    toast.success("Description updated successfully!");
  };

  const handleApplyToTags = async (newTags) => {
    await base44.entities.Business.update(selectedBusiness.id, {
      tags: newTags,
    });
    refetchBusinesses();
    setActiveTab("edit");
    toast.success("Tags updated successfully!");
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (userLoading || businessesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (justSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="shadow-2xl border-2 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your Business Has Been Submitted Successfully! 🎉
              </h1>
              
              <div className="bg-cyan-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-xl font-semibold text-cyan-900 mb-3">What happens next?</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Our team reviews your details</p>
                      <p className="text-sm text-gray-600">The approval process takes 1-2 business days</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">You'll receive an approval email</p>
                      <p className="text-sm text-gray-600">We'll notify you when your business is approved</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Your business will be live!</p>
                      <p className="text-sm text-gray-600">Customers will be able to find you in search and categories</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> You can check your business status in the dashboard.
                </p>
              </div>

              <Button
                onClick={() => { window.location.href = createPageUrl("UserDashboard"); }}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Go to My Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Edit mode - show single business management
  if (editBusinessId && selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Button
            onClick={() => navigate(createPageUrl("UserDashboard"))}
            variant="ghost"
            className="mb-4"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <BusinessHeader business={selectedBusiness} category={category} />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
            <div className="flex flex-wrap">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex-1 min-w-[33.333%] sm:min-w-0 ${
                      activeTab === tab.id
                        ? "border-cyan-600 text-cyan-600 bg-cyan-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            {activeTab === "overview" && <OverviewTab business={selectedBusiness} deals={deals} />}
            {activeTab === "edit" && <EditBusinessTab business={selectedBusiness} onUpdate={refetchBusinesses} />}
            {activeTab === "gallery" && <GalleryTab business={selectedBusiness} onUpdate={refetchBusinesses} />}
            {activeTab === "hours" && <OpeningHoursTab business={selectedBusiness} onUpdate={refetchBusinesses} />}
            {activeTab === "deals" && <DealsTab business={selectedBusiness} deals={deals} />}
            {activeTab === "reviews" && <ReviewsTab business={selectedBusiness} />}
            {activeTab === "ai" && (
              <AiAssistantTab
                business={selectedBusiness}
                onApplyToDescription={handleApplyToDescription}
                onApplyToTags={handleApplyToTags}
              />
            )}
            {activeTab === "upgrade" && <UpgradeTab business={selectedBusiness} />}
          </div>
        </div>
      </div>
    );
  }

  // List mode - show all businesses
  if (businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You Haven't Added a Business Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Add your business to Lakewood's directory and increase your visibility
            </p>
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
              <Link to={createPageUrl("AddBusiness")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Business
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Businesses</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage all of your business listings from one place</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-600">Total Businesses</p>
              <p className="text-2xl sm:text-3xl font-bold text-cyan-600">{businesses.length}</p>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <Button asChild className="bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto">
            <Link to={createPageUrl("AddBusiness")}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Business
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  {business.logo_url ? (
                    <img 
                      src={business.logo_url} 
                      alt={business.business_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {getStatusBadge(business.status)}
                </div>
                <CardTitle className="text-xl">{business.business_name}</CardTitle>
                <div className="text-sm text-gray-600">
                  <p>{getCategoryName(business.category_id)}</p>
                  <p>{business.city}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{business.views_count || 0}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{business.clicks_to_phone || 0}</p>
                    <p className="text-xs text-gray-600">Calls</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{business.reviews_count || 0}</p>
                    <p className="text-xs text-gray-600">Reviews</p>
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
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Link to={`/businesslisting/${business.slug || business.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Public Page
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex items-center justify-between">
                  <span>Created: {new Date(business.created_date).toLocaleDateString()}</span>
                  <span className="font-semibold text-gray-700">
                    {business.listing_tier === 'premium' ? '👑 Premium' : 
                     business.listing_tier === 'pro' ? '⭐ Pro' : '🆓 Free'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}