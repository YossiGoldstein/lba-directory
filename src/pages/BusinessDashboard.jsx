import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Edit, Image, Clock, TrendingUp, MessageSquare, Sparkles } from "lucide-react";
import BusinessHeader from "../components/business-dashboard/BusinessHeader";
import OverviewTab from "../components/business-dashboard/OverviewTab";
import EditBusinessTab from "../components/business-dashboard/EditBusinessTab";
import GalleryTab from "../components/business-dashboard/GalleryTab";
import OpeningHoursTab from "../components/business-dashboard/OpeningHoursTab";
import DealsTab from "../components/business-dashboard/DealsTab";
import ReviewsTab from "../components/business-dashboard/ReviewsTab";
import AiAssistantTab from "../components/business-dashboard/AiAssistantTab";

export default function BusinessDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load user:", error);
        base44.auth.redirectToLogin(createPageUrl("BusinessDashboard"));
      }
    };
    loadUser();
  }, []);

  // Fetch user's business
  const { data: business, isLoading: businessLoading, refetch: refetchBusiness } = useQuery({
    queryKey: ["userBusiness", user?.email],
    queryFn: async () => {
      const allBusinesses = await base44.entities.Business.list();
      return allBusinesses.find(b => b.created_by === user.email);
    },
    enabled: !!user?.email,
  });

  // Fetch category
  const { data: category } = useQuery({
    queryKey: ["category", business?.category_id],
    queryFn: async () => {
      const categories = await base44.entities.Category.list();
      return categories.find(c => c.id === business.category_id);
    },
    enabled: !!business?.category_id,
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "edit", label: "Edit Business Info", icon: Edit },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "hours", label: "Opening Hours", icon: Clock },
    { id: "deals", label: "Deals", icon: TrendingUp },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "ai-assistant", label: "AI Assistant", icon: Sparkles },
  ];

  if (isLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // No business - show message
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-cyan-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              No Business Registered Yet
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You do not have a registered business yet. Add your business to start managing your listing and reaching more customers.
            </p>
            <Button
              asChild
              className="bg-cyan-600 hover:bg-cyan-700 px-8 py-6 text-lg"
            >
              <Link to={createPageUrl("AddBusiness")}>
                <Building2 className="w-5 h-5 mr-2" />
                Add Your Business
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your business listing and engage with customers</p>
        </div>

        {/* Business Header */}
        <BusinessHeader business={business} category={category} />

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
        <div className="min-h-[500px]">
          {activeTab === "overview" && (
            <OverviewTab business={business} onSwitchTab={setActiveTab} />
          )}
          {activeTab === "edit" && (
            <EditBusinessTab business={business} onBusinessUpdate={refetchBusiness} />
          )}
          {activeTab === "gallery" && (
            <GalleryTab business={business} onBusinessUpdate={refetchBusiness} />
          )}
          {activeTab === "hours" && (
            <OpeningHoursTab business={business} onBusinessUpdate={refetchBusiness} />
          )}
          {activeTab === "deals" && (
            <DealsTab business={business} />
          )}
          {activeTab === "reviews" && (
            <ReviewsTab business={business} />
          )}
          {activeTab === "ai-assistant" && (
            <AiAssistantTab
              business={business}
              category={category}
              onApplyToDescription={(text) => {
                setActiveTab("edit");
                // Could auto-fill description here if needed
              }}
              onApplyToDeals={(text) => {
                setActiveTab("deals");
                // Could auto-create deal here if needed
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}