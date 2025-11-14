import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import WizardProgress from "../components/add-business/WizardProgress";
import Step1Basics from "../components/add-business/Step1Basics";
import Step2Category from "../components/add-business/Step2Category";
import Step3Location from "../components/add-business/Step3Location";
import Step4Hours from "../components/add-business/Step4Hours";
import Step5Gallery from "../components/add-business/Step5Gallery";
import Step6Deals from "../components/add-business/Step6Deals";
import Step7Optimization from "../components/add-business/Step7Optimization";
import Step8Review from "../components/add-business/Step8Review";
import { toast } from "sonner";

const TOTAL_STEPS = 8;

export default function AddBusiness() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
    gallery_images: [],
    deals: [],
  });

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
      if (!formData.business_name.trim()) {
        toast.error("Please enter a business name");
        return;
      }
    }

    if (currentStep === 1) {
      if (!formData.category_id) {
        toast.error("Please select a category");
        return;
      }
    }

    if (currentStep === 2) {
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
        toast.error("Please enter a valid US phone number");
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
        gallery_images: formData.gallery_images,
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

      // Clear saved data
      localStorage.removeItem("addBusinessFormData");

      // Show success message
      toast.success("Business submitted for approval!");

      // Redirect to business dashboard
      setTimeout(() => {
        navigate(createPageUrl("BusinessDashboard"));
      }, 1500);

    } catch (error) {
      console.error("Failed to submit business:", error);
      toast.error("Failed to submit business. Please try again.");
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
        return <Step1Basics data={formData} onChange={setFormData} />;
      case 1:
        return <Step2Category data={formData} onChange={setFormData} />;
      case 2:
        return <Step3Location data={formData} onChange={setFormData} />;
      case 3:
        return <Step4Hours data={formData} onChange={setFormData} />;
      case 4:
        return <Step5Gallery data={formData} onChange={setFormData} />;
      case 5:
        return <Step6Deals data={formData} onChange={setFormData} />;
      case 6:
        return <Step7Optimization data={formData} onChange={setFormData} />;
      case 7:
        return <Step8Review data={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
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

        {/* Helper Text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Your progress is automatically saved
        </p>
      </div>
    </div>
  );
}