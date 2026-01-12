import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import WizardProgress from "../components/add-business/WizardProgress";
import Step0Pricing from "../components/add-business/Step0Pricing";
import Step1Basics from "../components/add-business/Step1Basics";
import Step2Category from "../components/add-business/Step2Category";
import Step3Location from "../components/add-business/Step3Location";
import Step4Hours from "../components/add-business/Step4Hours";
import Step5Gallery from "../components/add-business/Step5Gallery";
import Step6Deals from "../components/add-business/Step6Deals";
import Step7Optimization from "../components/add-business/Step7Optimization";
import Step8Review from "../components/add-business/Step8Review";
import Step9Upgrade from "../components/add-business/Step9Upgrade";
import { toast } from "sonner";

const TOTAL_STEPS = 10;

export default function AddBusiness() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    listing_tier: "free",
    business_name: "",
    category_id: "",
    category_name: "",
    short_description: "",
    long_description: "",
    tags: "",
    address_line1: "",
    address_line2: "",
    city: "Lakewood",
    state: "NJ",
    zip_code: "",
    phone: "",
    whatsapp_number: "",
    email: "",
    website_url: "",
    opening_hours_text: "",
    opening_hours_json: null,
    use_structured_hours: true,
    logo_url: "",
    cover_image_url: "",
    gallery_images: [],
    deals: [],
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl("AddBusiness"));
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl("AddBusiness"));
      }
    };
    checkAuth();
  }, []);

  // Fetch categories for display
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.filter(c => c.is_active);
    },
  });

  // Update category name when category_id changes
  useEffect(() => {
    if (formData.category_id && categories.length > 0) {
      const cat = categories.find(c => c.id === formData.category_id);
      if (cat && cat.name !== formData.category_name) {
        setFormData(prev => ({ ...prev, category_name: cat.name }));
      }
    }
  }, [formData.category_id, categories]);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("addBusinessFormData", JSON.stringify(formData));
  }, [formData]);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem("addBusinessFormData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    }
  }, []);

  const handleNext = () => {
    // Validation
    if (currentStep === 0) {
      if (!formData.listing_tier) {
        toast.error("Please select a listing plan");
        return;
      }
    }

    if (currentStep === 1) {
      if (!formData.business_name.trim()) {
        toast.error("Please enter a business name");
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.category_id) {
        toast.error("Please select a category");
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.city.trim()) {
        toast.error("City is required");
        return;
      }
      if (!formData.phone.trim()) {
        toast.error("Phone number is required");
        return;
      }
      // Validate phone format
      if (!/^[\d\s\-\(\)]+$/.test(formData.phone)) {
        toast.error("Please enter a valid phone number");
        return;
      }
    }

    if (currentStep === 5) {
      if (!formData.logo_url) {
        toast.error("צריך להעלות לוגו");
        return;
      }
      if (!formData.cover_image_url) {
        toast.error("צריך להעלות תמונת שער");
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Get current user for email
      const user = await base44.auth.me();

      // If paid tier, redirect to Stripe checkout
      if (formData.listing_tier === "pro" || formData.listing_tier === "premium") {
        // Check if running in iframe
        if (window.self !== window.top) {
          toast.error("Payment checkout must be completed from the published app, not in preview mode.");
          setIsSubmitting(false);
          return;
        }

        // Prepare business data for checkout
        const businessData = {
          business_name: formData.business_name,
          category_id: formData.category_id,
          short_description: formData.short_description,
          long_description: formData.long_description,
          tags: formData.tags.split(",").map(t => t.trim()).filter(t => t.length > 0),
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          phone: formData.phone,
          whatsapp_number: formData.whatsapp_number,
          email: formData.email,
          website_url: formData.website_url,
          opening_hours_text: formData.use_structured_hours 
            ? generateTextFromStructured(formData.opening_hours_json)
            : formData.opening_hours_text,
          opening_hours_json: formData.use_structured_hours ? formData.opening_hours_json : null,
          logo_url: formData.logo_url,
          gallery_images: formData.gallery_images,
        };

        // Create checkout session
        const response = await base44.functions.invoke('createCheckoutSession', {
          listing_tier: formData.listing_tier,
          business_data: businessData,
        listing_tier: formData.listing_tier
        });

        if (response.data?.url) {
          // Redirect to Stripe Checkout
          window.location.href = response.data.url;
          return;
        } else {
          throw new Error("Failed to create checkout session");
        }
      }

      // Free tier - create business immediately

      // Process tags
      const tagsArray = formData.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Prepare business data
      const businessData = {
        business_name: formData.business_name,
        category_id: formData.category_id,
        short_description: formData.short_description,
        long_description: formData.long_description,
        tags: tagsArray,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        phone: formData.phone,
        whatsapp_number: formData.whatsapp_number,
        email: formData.email,
        website_url: formData.website_url,
        opening_hours_text: formData.use_structured_hours 
          ? generateTextFromStructured(formData.opening_hours_json)
          : formData.opening_hours_text,
        opening_hours_json: formData.use_structured_hours ? formData.opening_hours_json : null,
        logo_url: formData.logo_url,
        gallery_images: formData.gallery_images,
        listing_tier: "free",
        listing_rank: 1,
        payment_status: "paid",
        status: "pending",
      };

      // Create business
      const createdBusiness = await base44.entities.Business.create(businessData);

      // Create deals if any
      if (formData.deals && formData.deals.length > 0) {
        const dealPromises = formData.deals.map(deal =>
          base44.entities.Deal.create({
            business_id: createdBusiness.id,
            title: deal.title,
            description: deal.description,
            badge_text: deal.badge_text,
            start_date: deal.start_date,
            end_date: deal.end_date,
            is_active: true,
          })
        );
        await Promise.all(dealPromises);
      }

      // Get the full dashboard URL
      const dashboardUrl = `${window.location.origin}${createPageUrl("BusinessDashboard")}`;

      // Send confirmation email
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "Your Business Has Been Submitted for Approval - LBA Directory",
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0891b2;">Hello ${user.full_name},</h2>
              
              <p>Thank you for joining LBA Directory!</p>
              
              <p>We have received your business details:</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0891b2;">📋 Submitted Business Details:</h3>
                <p><strong>Business Name:</strong> ${formData.business_name}</p>
                <p><strong>Category:</strong> ${formData.category_name}</p>
                <p><strong>Phone:</strong> ${formData.phone}</p>
                <p><strong>Address:</strong> ${formData.address_line1}, ${formData.city}</p>
              </div>
              
              <p><strong>What's Next:</strong></p>
              <p>Our team will review your business details within 1-2 business days. Once approved, your business will be live on the site and customers will be able to find you.</p>
              
              <p>We'll send you an email notification as soon as your business is approved.</p>
              
              <div style="background: #ecfccb; border: 2px solid #84cc16; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #365314;">✏️ Manage Your Business</h3>
                <p style="margin-bottom: 15px;">You can update, edit, and modify your business details anytime through the Business Dashboard.</p>
                
                <p style="margin-bottom: 10px;"><strong>What can you do in the dashboard?</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>✅ Update business details (address, phone, hours)</li>
                  <li>✅ Add and edit photos and gallery</li>
                  <li>✅ Create and update deals and promotions</li>
                  <li>✅ View reviews and respond to customers</li>
                  <li>✅ Use AI assistant to improve your description</li>
                </ul>
                
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${dashboardUrl}" 
                     style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Go to My Business Dashboard
                  </a>
                </div>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                💡 <strong>Tip:</strong> You can access the dashboard anytime from the website by logging in with your email.
              </p>
              
              <p>If you have any questions, feel free to contact us.</p>
              
              <p style="margin-top: 30px;">Best regards,<br>LBA Directory Team</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                LBA Directory - Lakewood's Business Directory
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      // Clear saved data
      localStorage.removeItem("addBusinessFormData");

      // Show success message
      toast.success("🎉 העסק שלכם נשמר בהצלחה!");

      // Redirect to success page
      setTimeout(() => {
        navigate(createPageUrl("SubmissionSuccess") + `?businessName=${encodeURIComponent(formData.business_name)}`);
      }, 1500);

    } catch (error) {
      console.error("Failed to submit business:", error);
      toast.error("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const generateTextFromStructured = (hours) => {
    if (!hours) return "";
    
    return Object.entries(hours)
      .map(([day, times]) => {
        const dayName = day.replace("_", " ");
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        
        if (times.closed) {
          return `${capitalizedDay}: Closed`;
        }
        return `${capitalizedDay}: ${times.open} - ${times.close}`;
      })
      .join("\n");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step0Pricing formData={formData} setFormData={setFormData} onNext={handleNext} />;
      case 1:
        return <Step1Basics data={formData} onChange={setFormData} />;
      case 2:
        return <Step2Category data={formData} onChange={setFormData} />;
      case 3:
        return <Step3Location data={formData} onChange={setFormData} />;
      case 4:
        return <Step4Hours data={formData} onChange={setFormData} />;
      case 5:
        return <Step5Gallery data={formData} onChange={setFormData} />;
      case 6:
        return <Step6Deals data={formData} onChange={setFormData} />;
      case 7:
        return <Step7Optimization data={formData} onChange={setFormData} />;
      case 8:
        return <Step8Review data={formData} />;
      case 9:
        return <Step9Upgrade data={formData} onChange={setFormData} />;
      default:
        return null;
    }
  };

  // Loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {renderStep()}
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              onClick={handleNext}
              className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit for Approval
                </>
              )}
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Progress is saved automatically
        </p>
      </div>
    </div>
  );
}