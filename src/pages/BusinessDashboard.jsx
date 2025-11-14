
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Added
import { useToast } from "@/components/ui/use-toast"; // Added
import { Home, Edit3, ImageIcon, Clock, Tag, Star, Plus, CheckCircle, Sparkles, Building2 } from "lucide-react"; // Updated Lucide icons
import BusinessHeader from "../components/business-dashboard/BusinessHeader";
import OverviewTab from "../components/business-dashboard/OverviewTab";
import EditBusinessTab from "../components/business-dashboard/EditBusinessTab";
import GalleryTab from "../components/business-dashboard/GalleryTab";
import OpeningHoursTab from "../components/business-dashboard/OpeningHoursTab";
import DealsTab from "../components/business-dashboard/DealsTab";
import ReviewsTab from "../components/business-dashboard/ReviewsTab";
import AiAssistantTab from "../components/business-dashboard/AiAssistantTab";

export default function BusinessDashboard() {
  const { toast } = useToast(); // Added toast

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true); // Renamed from isLoading
  const [activeTab, setActiveTab] = useState("overview");

  // Check if just submitted a business
  const urlParams = new URLSearchParams(window.location.search);
  const justSubmitted = urlParams.get("submitted") === "true";

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
        base44.auth.redirectToLogin(createPageUrl("BusinessDashboard"));
      } finally {
        setUserLoading(false); // Renamed
      }
    };
    loadUser();
  }, []);

  // Fetch user's business
  const { data: businesses = [], isLoading: businessesLoading, refetch: refetchBusinesses } = useQuery({ // Changed to businesses array, businessesLoading, refetchBusinesses
    queryKey: ["my-business", user?.email], // Updated queryKey
    queryFn: async () => {
      // Filter by created_by instead of listing all and finding
      return await base44.entities.Business.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const business = businesses[0]; // Get the first business if it exists

  // Fetch category
  const { data: category } = useQuery({
    queryKey: ["category", business?.category_id],
    queryFn: async () => {
      if (!business?.category_id) return null; // Handle case where no category_id
      const categories = await base44.entities.Category.list();
      return categories.find(c => c.id === business.category_id);
    },
    enabled: !!business?.category_id,
  });

  // Fetch deals for this business
  const { data: deals = [] } = useQuery({
    queryKey: ["business-deals", business?.id], // Updated queryKey
    queryFn: async () => {
      if (!business?.id) return []; // Handle case where no business ID
      return await base44.entities.Deal.filter({ business_id: business.id }); // Filter by business_id
    },
    enabled: !!business?.id,
  });

  const tabs = [
    { id: "overview", label: "סקירה כללית", icon: Home },
    { id: "edit", label: "עריכת פרטים", icon: Edit3 },
    { id: "gallery", label: "גלריה", icon: ImageIcon },
    { id: "hours", label: "שעות פתיחה", icon: Clock },
    { id: "deals", label: "מבצעים", icon: Tag },
    { id: "reviews", label: "ביקורות", icon: Star },
    { id: "ai", label: "עוזר AI", icon: Sparkles }, // Changed id to 'ai'
  ];

  const handleApplyToDescription = async (text, field) => { // Modified function signature
    try {
      const updateData = field === 'short' 
        ? { short_description: text }
        : { long_description: text };
      
      await base44.entities.Business.update(business.id, updateData);
      await refetchBusinesses(); // Updated refetch function
      setActiveTab("edit");
      toast.success("התיאור עודכן בהצלחה!"); // Added toast
    } catch (error) {
      console.error("Failed to apply description:", error);
      toast.error("שגיאה בעדכון התיאור."); // Added toast
    }
  };

  const handleApplyToTags = async (tags) => { // Modified function signature
    try {
      await base44.entities.Business.update(business.id, { tags });
      await refetchBusinesses(); // Updated refetch function
      setActiveTab("edit");
      toast.success("התגיות עודכנו בהצלחה!"); // Added toast
    } catch (error) {
      console.error("Failed to apply tags:", error);
      toast.error("שגיאה בעדכון התגיות."); // Added toast
    }
  };

  if (userLoading || businessesLoading) { // Updated loading variables
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">טוען...</p> {/* Updated loading text */}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Show submission success message
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
                העסק שלך נשלח בהצלחה! 🎉
              </h1>
              
              <div className="bg-cyan-50 rounded-lg p-6 mb-6 text-right">
                <h2 className="text-xl font-semibold text-cyan-900 mb-3">מה קורה עכשיו?</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-medium">הצוות שלנו בודק את הפרטים</p>
                      <p className="text-sm text-gray-600">תהליך האישור לוקח 1-2 ימי עסקים</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-medium">נשלח לך מייל אישור</p>
                      <p className="text-sm text-gray-600">תקבל הודעה כשהעסק יאושר</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-medium">העסק שלך יהיה חי באתר!</p>
                      <p className="text-sm text-gray-600">לקוחות יוכלו למצוא אותך בחיפוש ובקטגוריות</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>💡 טיפ:</strong> בינתיים, תוכל לראות את סטטוס העסק שלך כאן בדשבורד.
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
                  עבור לדשבורד
                </Button>
                <Button
                  variant="outline"
                  asChild
                >
                  <Link to={createPageUrl("Home")}>
                    חזור לדף הבית
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No business - show message
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"> {/* Updated styling for centering */}
        <Card className="max-w-md w-full"> {/* Wrapped in Card */}
          <CardContent className="p-8 text-center"> {/* CardContent for padding and centering */}
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2"> {/* Updated heading size and text */}
              עדיין לא רשמת עסק
            </h2>
            <p className="text-gray-600 mb-6"> {/* Updated text */}
              הוסף את העסק שלך למדריך העסקי של Lakewood והגדל את החשיפה שלך
            </p>
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700"> {/* Updated button styling */}
              <Link to={createPageUrl("AddBusiness")}>
                <Plus className="w-4 h-4 mr-2" /> {/* Added Plus icon */}
                הוסף עסק
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
        {/* Business Header */}
        <BusinessHeader business={business} category={category} />

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"> {/* Removed overflow-x-auto, adjusted styling slightly */}
          <div className="flex overflow-x-auto"> {/* Added overflow-x-auto to inner div */}
            {tabs.map((tab) => {
              const Icon = tab.icon; // Changed from IconComponent to Icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${ // Adjusted text size, styling
                    activeTab === tab.id
                      ? "border-cyan-600 text-cyan-600" // Updated active style
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300" // Updated inactive style
                  }`}
                >
                  <Icon className="w-4 h-4" /> {/* Adjusted icon size */}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div> {/* Removed min-h-[500px] as it's not in the outline */}
          {activeTab === "overview" && (
            <OverviewTab business={business} deals={deals} onSwitchTab={setActiveTab} /> {/* Passed deals prop */}
          )}
          {activeTab === "edit" && (
            <EditBusinessTab business={business} onUpdate={refetchBusinesses} /> {/* Changed onBusinessUpdate to onUpdate, refetchBusinesses */}
          )}
          {activeTab === "gallery" && (
            <GalleryTab business={business} onUpdate={refetchBusinesses} /> {/* Changed onBusinessUpdate to onUpdate, refetchBusinesses */}
          )}
          {activeTab === "hours" && (
            <OpeningHoursTab business={business} onUpdate={refetchBusinesses} /> {/* Changed onBusinessUpdate to onUpdate, refetchBusinesses */}
          )}
          {activeTab === "deals" && (
            <DealsTab business={business} deals={deals} /> {/* Passed deals prop */}
          )}
          {activeTab === "reviews" && (
            <ReviewsTab business={business} />
          )}
          {activeTab === "ai" && ( {/* Changed activeTab to 'ai' */}
            <AiAssistantTab
              business={business}
              category={category} // Category prop is kept for now, though it's not strictly in the outline update
              deals={deals}
              onApplyToDescription={handleApplyToDescription}
              onApplyToTags={handleApplyToTags}
            />
          )}
        </div>
      </div>
    </div>
  );
}
