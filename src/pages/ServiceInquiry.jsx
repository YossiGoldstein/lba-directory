import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

const SERVICES = [
  { id: "logo", label: "Logo Design" },
  { id: "landing_page", label: "Landing Page" },
  { id: "website", label: "Full Website" },
  { id: "crm", label: "CRM System" },
  { id: "video", label: "Promotional Video" },
  { id: "whatsapp_ai", label: "WhatsApp AI Chat" },
];

export default function ServiceInquiry() {
  const urlParams = new URLSearchParams(window.location.search);
  const [form, setForm] = useState({
    full_name: urlParams.get("name") || "",
    business_name: urlParams.get("business") || "",
    phone: urlParams.get("phone") || "",
    email: urlParams.get("email") || "",
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.full_name || !form.business_name || !form.phone || !form.email) {
      setError("Please fill in all required fields.");
      return;
    }
    if (selectedServices.length === 0) {
      setError("Please select at least one service.");
      return;
    }

    setIsLoading(true);
    const serviceLabels = selectedServices.map(
      (id) => SERVICES.find((s) => s.id === id)?.label
    );

    await base44.functions.invoke("submitServiceInquiry", {
      ...form,
      services: serviceLabels,
    });

    setIsLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h2>
          <p className="text-gray-600">
            Your inquiry has been received. Our team will contact you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png"
            alt="LBA Directory"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Grow Your Business</h1>
          <p className="text-gray-500 mt-1">Tell us what services you're interested in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                placeholder="My Business"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="732-555-0000"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <Label>Services Interested In *</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {SERVICES.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-50 text-cyan-800"
                        : "border-gray-200 bg-white text-gray-700 hover:border-cyan-300"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                      isSelected ? "border-cyan-500 bg-cyan-500" : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                        </svg>
                      )}
                    </div>
                    {service.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-11 text-base"
          >
            {isLoading ? "Submitting..." : "Submit Inquiry"}
          </Button>
        </form>
      </div>
    </div>
  );
}