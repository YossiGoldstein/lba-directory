import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Edit3, ImageIcon, Clock, Tag, Star, Plus, CheckCircle, Sparkles, Building2 } from "lucide-react";
import { toast } from "sonner";
import BusinessHeader from "../components/business-dashboard/BusinessHeader";
import OverviewTab from "../components/business-dashboard/OverviewTab";
import EditBusinessTab from "../components/business-dashboard/EditBusinessTab";
import GalleryTab from "../components/business-dashboard/GalleryTab";
import OpeningHoursTab from "../components/business-dashboard/OpeningHoursTab";
import DealsTab from "../components/business-dashboard/DealsTab";
import ReviewsTab from "../components/business-dashboard/ReviewsTab";
import AiAssistantTab from "../components/business-dashboard/AiAssistantTab";

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const justSubmitted = urlParams.get("submitted") === "true";

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl("BusinessDashboard"));
      } finally {
        setUserLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: businesses = [], isLoading: businessesLoading, refetch: refetchBusinesses } = useQuery({
    queryKey: ["my-business", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Business.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const business = businesses[0];

  const { data: category } = useQuery({
    queryKey: ["category", business?.category_id],
    queryFn: async () => {
      if (!business?.category_id) return null;
      const cats = await base44.entities.Category.list();
      return cats.find(c => c.id === business.category_id);
    },
    enabled: !!business?.category_id,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["business-deals", business?.id],
    queryFn: async () => {
      if (!business?.id) return [];
      return await base44.entities.Deal.filter({ business_id: business.id });
    },
    enabled: !!business?.id,
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "edit", label: "Edit Details", icon: Edit3 },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "hours", label: "Hours", icon: Clock },
    { id: "deals", label: "Deals", icon: Tag },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "ai", label: "AI Assistant", icon: Sparkles },
  ];

  const handleApplyToDescription = async (newDescription) => {
    await base44.entities.Business.update(business.id, {
      long_description: newDescription,
    });
    refetchBusinesses();
    setActiveTab("edit");
    toast.success("Description updated successfully!");
  };

  const handleApplyToTags = async (newTags) => {
    await base44.entities.Business.update(business.id, {
      tags: newTags,
    });
    refetchBusinesses();
    setActiveTab("edit");
    toast.success("Tags updated successfully!");
  };

  if (userLoading || businessesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  if (justSubmitted && (!business || business.status === "pending")) {
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
                  <strong>💡 Tip:</strong> In the meantime, you can check your business status here in the dashboard.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => {
                    window.history.replaceState({}, '', createPageUrl("BusinessDashboard"));
                    window.location.reload();
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  asChild
                >
                  <Link to={createPageUrl("Home")}>
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!business) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BusinessHeader business={business} category={category} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-cyan-600 text-cyan-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {activeTab === "overview" && <OverviewTab business={business} deals={deals} />}
          {activeTab === "edit" && <EditBusinessTab business={business} onUpdate={refetchBusinesses} />}
          {activeTab === "gallery" && <GalleryTab business={business} onUpdate={refetchBusinesses} />}
          {activeTab === "hours" && <OpeningHoursTab business={business} onUpdate={refetchBusinesses} />}
          {activeTab === "deals" && <DealsTab business={business} deals={deals} />}
          {activeTab === "reviews" && <ReviewsTab business={business} />}
          {activeTab === "ai" && (
            <AiAssistantTab
              business={business}
              onApplyToDescription={handleApplyToDescription}
              onApplyToTags={handleApplyToTags}
            />
          )}
        </div>
      </div>
    </div>
  );
}