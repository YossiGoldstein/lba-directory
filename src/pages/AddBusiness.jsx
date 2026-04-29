import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Upload, X, Image as ImageIcon, Building2, Sparkles, Loader2, Info, Check, Plus, Trash2, ExternalLink } from "lucide-react";
import CoverPhotoUpload from "@/components/business/CoverPhotoUpload";
import VideoManager from "@/components/business/VideoManager";
import { toast } from "sonner";
import { PLANS } from "@/components/lib/plansConfig";
import { geocodeBusinessAddress } from "@/components/lib/geocodeUtils";

// ── Helpers ────────────────────────────────────────────────────────────────
const formatPhone = (value) => {
  const c = value.replace(/\D/g, "");
  if (c.length <= 3) return c;
  if (c.length <= 6) return `(${c.slice(0,3)}) ${c.slice(3)}`;
  return `(${c.slice(0,3)}) ${c.slice(3,6)}-${c.slice(6,10)}`;
};

const generateTextFromStructured = (hours) => {
  if (!hours) return "";
  return Object.entries(hours).map(([day, times]) => {
    const label = day.replace("_", " ");
    const cap = label.charAt(0).toUpperCase() + label.slice(1);
    return times.closed ? `${cap}: Closed` : `${cap}: ${times.open} - ${times.close}`;
  }).join("\n");
};

// ── Default hours ──────────────────────────────────────────────────────────
const DEFAULT_HOURS = {
  sunday:       { open: "09:00", close: "17:00", closed: false },
  monday:       { open: "09:00", close: "17:00", closed: false },
  tuesday:      { open: "09:00", close: "17:00", closed: false },
  wednesday:    { open: "09:00", close: "17:00", closed: false },
  thursday:     { open: "09:00", close: "17:00", closed: false },
  friday:       { open: "09:00", close: "14:00", closed: false },
  saturday:     { open: "", close: "", closed: true },
  motzei_shabbos: { open: "21:00", close: "23:00", closed: false },
};

const DAYS = [
  { key: "sunday", label: "Sunday" },
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday (Shabbos)" },
  { key: "motzei_shabbos", label: "Motzei Shabbos" },
];

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ number, title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-cyan-600 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
            {number}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════
export default function AddBusiness() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingDealFlyer, setIsUploadingDealFlyer] = useState(false);
  const [hoursMode, setHoursMode] = useState("hours");
  const [deals, setDeals] = useState([]);
  const [showDealForm, setShowDealForm] = useState(false);
  const [currentDeal, setCurrentDeal] = useState({ title: "", description: "", badge_text: "", flyer_url: "", sale_link: "", start_date: "", end_date: "" });

  const [form, setForm] = useState({
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
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: "",
    x_url: "",
    opening_hours_json: DEFAULT_HOURS,
    by_appointment_only: false,
    logo_url: "",
    cover_photo_url: "",
    gallery_images: [],
    videos: [],
    // AI helpers
    ai_business_type: "",
    ai_services: "",
    ai_unique_points: "",
    ai_target_audience: "general_community",
    ai_medium_version: "",
  });

  const set = (patch) => setForm(prev => ({ ...prev, ...patch }));

  // Auth check
  useEffect(() => {
    const customerData = localStorage.getItem("lba_customer");
    if (!customerData) {
      window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(createPageUrl("AddBusiness"));
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await base44.entities.Category.list()).filter(c => c.is_active),
  });

  // Sync category name
  useEffect(() => {
    if (form.category_id && categories.length > 0) {
      const cat = categories.find(c => c.id === form.category_id);
      if (cat && cat.name !== form.category_name) set({ category_name: cat.name });
    }
  }, [form.category_id, categories]);

  // ── AI description ────────────────────────────────────────────────────
  const handleGenerateDesc = async () => {
    if (!form.business_name?.trim()) { toast.error("Please enter a business name first"); return; }
    if (!form.ai_business_type?.trim()) { toast.error("Please specify the business type"); return; }
    if (!form.ai_services?.trim()) { toast.error("Please describe your services/products"); return; }

    setIsGeneratingDesc(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional business description.
Business: ${form.business_name}
Type: ${form.ai_business_type}
Services: ${form.ai_services}
Unique: ${form.ai_unique_points || "Not specified"}
Audience: ${form.ai_target_audience.replace("_", " ")}
City: ${form.city || "Lakewood"}
Write in modest, professional tone for Lakewood Haredi community.
Return JSON: { short_version, medium_version, long_version }`,
        response_json_schema: {
          type: "object",
          properties: {
            short_version: { type: "string" },
            medium_version: { type: "string" },
            long_version: { type: "string" }
          }
        }
      });
      set({
        short_description: response.short_version || form.short_description,
        long_description: response.long_version || form.long_description,
        ai_medium_version: response.medium_version || "",
      });
      toast.success("AI descriptions generated!");
    } catch (e) {
      toast.error("Failed to generate description");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // ── AI tags ───────────────────────────────────────────────────────────
  const handleGenerateTags = async () => {
    if (!form.business_name || !form.category_id) {
      toast.error("Enter business name and category first");
      return;
    }
    setIsGeneratingTags(true);
    try {
      const selectedCat = categories.find(c => c.id === form.category_id);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest 3-7 comma-separated tags for "${form.business_name}" (${selectedCat?.name}). Appropriate for Lakewood Haredi community. Return only the tags.`
      });
      set({ tags: response.trim() });
      toast.success("Tags suggested!");
    } catch (e) {
      toast.error("Failed to suggest tags");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  // ── Image uploads ─────────────────────────────────────────────────────
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set({ logo_url: file_url });
      toast.success("Logo uploaded!");
    } catch { toast.error("Logo upload failed"); }
    finally { setIsUploadingLogo(false); e.target.value = ""; }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setIsUploadingGallery(true);
    try {
      const urls = await Promise.all(files.map(async f => (await base44.integrations.Core.UploadFile({ file: f })).file_url));
      set({ gallery_images: [...form.gallery_images, ...urls] });
      toast.success(`${urls.length} image(s) uploaded!`);
    } catch { toast.error("Gallery upload failed"); }
    finally { setIsUploadingGallery(false); e.target.value = ""; }
  };

  // ── Deal flyer upload ─────────────────────────────────────────────────
  const handleDealFlyerUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploadingDealFlyer(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCurrentDeal(prev => ({ ...prev, flyer_url: file_url }));
      toast.success("Flyer uploaded!");
    } catch { toast.error("Flyer upload failed"); }
    finally { setIsUploadingDealFlyer(false); e.target.value = ""; }
  };

  const handleAddDeal = () => {
    if (!currentDeal.title.trim()) { toast.error("Deal title is required"); return; }
    if (!currentDeal.start_date || !currentDeal.end_date) { toast.error("Start and end dates are required"); return; }
    setDeals(prev => [...prev, currentDeal]);
    setCurrentDeal({ title: "", description: "", badge_text: "", flyer_url: "", sale_link: "", start_date: "", end_date: "" });
    setShowDealForm(false);
    toast.success("Deal added!");
  };

  // ── Hours ─────────────────────────────────────────────────────────────
  const handleHourChange = (day, field, value) => {
    const updated = { ...form.opening_hours_json, [day]: { ...form.opening_hours_json[day], [field]: value } };
    set({ opening_hours_json: updated });
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.business_name.trim()) { toast.error("Business name is required"); return; }
    if (!form.category_id) { toast.error("Please select a category"); return; }
    if (!form.city.trim()) { toast.error("City is required"); return; }
    if (!form.phone.trim()) { toast.error("Phone number is required"); return; }

    setIsSubmitting(true);
    try {
      const customerData = localStorage.getItem("lba_customer");
      if (!customerData) { window.location.href = createPageUrl("SignIn"); return; }
      const customer = JSON.parse(customerData);

      const tagsArray = form.tags.split(",").map(t => t.trim()).filter(Boolean);

      const businessData = {
        owner_id: customer.id,
        business_name: form.business_name,
        category_id: form.category_id,
        short_description: form.short_description,
        long_description: form.long_description,
        tags: tagsArray,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        phone: form.phone,
        whatsapp_number: form.whatsapp_number,
        email: form.email,
        website_url: form.website_url,
        facebook_url: form.facebook_url,
        instagram_url: form.instagram_url,
        linkedin_url: form.linkedin_url,
        youtube_url: form.youtube_url,
        x_url: form.x_url,
        opening_hours_text: form.by_appointment_only ? "By Appointment Only" : generateTextFromStructured(form.opening_hours_json),
        opening_hours_json: form.by_appointment_only ? null : form.opening_hours_json,
        by_appointment_only: form.by_appointment_only,
        logo_url: form.logo_url,
        cover_photo_url: form.cover_photo_url,
        gallery_images: form.gallery_images,
        videos: form.videos || [],
        listing_tier: form.listing_tier === "lba-sponsor" ? "pro" : form.listing_tier,
        is_lba_sponsor: form.listing_tier === "lba-sponsor",
        listing_rank: 1,
        payment_status: form.listing_tier === "free" ? "paid" : "unpaid",
        status: "pending",
      };

      // Paid tiers → Stripe checkout
      if (form.listing_tier !== "free") {
        if (window.self !== window.top) {
          toast.error("Payment checkout must be completed from the published app.");
          setIsSubmitting(false);
          return;
        }
        const response = await base44.functions.invoke('createCheckoutSession', {
          listing_tier: form.listing_tier,
          business_data: businessData
        });
        if (response.data?.url) {
          window.location.href = response.data.url;
          return;
        }
        throw new Error("Failed to create checkout session");
      }

      // Free tier → create immediately
      // Generate slug from business name
      const rawSlug = form.business_name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      // Ensure slug uniqueness
      const existingBusinesses = await base44.entities.Business.list();
      let slug = rawSlug;
      let counter = 2;
      while (existingBusinesses.some(b => b.slug === slug)) {
        slug = `${rawSlug}-${counter++}`;
      }
      businessData.slug = slug;

      const createdBusiness = await base44.entities.Business.create(businessData);

      // Geocode address and save coordinates
      try {
        const coords = await geocodeBusinessAddress(businessData);
        if (coords) {
          await base44.entities.Business.update(createdBusiness.id, {
            latitude: coords.lat,
            longitude: coords.lng,
          });
        }
      } catch {}

      // Create any deals that were added during setup
      if (deals.length > 0) {
        await Promise.all(deals.map(d =>
          base44.entities.Deal.create({ ...d, business_id: createdBusiness.id, is_active: true })
        ));
      }

      toast.success("🎉 Business submitted successfully!");
      setTimeout(() => {
        navigate(createPageUrl("SubmissionSuccess") + `?businessName=${encodeURIComponent(form.business_name)}`);
      }, 1200);
    } catch (error) {
      console.error(error);
      toast.error("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-blue-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Add Your Business</h1>
          <p className="text-gray-600 mt-1">Fill in the details below and submit for approval</p>
        </div>

        {/* ── 1. Basic Info ── */}
        <Section number="1" title="Basic Information">
          <div className="space-y-2">
            <Label>Business Name *</Label>
            <Input value={form.business_name} onChange={e => set({ business_name: e.target.value })} placeholder="Enter your business name" />
          </div>
          
          {/* AI description helper */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <p className="text-sm font-medium text-cyan-900">Generate Description with AI (optional)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Business type *</Label>
                <Input value={form.ai_business_type} onChange={e => set({ ai_business_type: e.target.value })} placeholder="e.g., Restaurant, Phone Repair..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target audience</Label>
                <Select value={form.ai_target_audience} onValueChange={v => set({ ai_target_audience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="families">Families</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="general_community">General Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Services / Products *</Label>
              <Textarea value={form.ai_services} onChange={e => set({ ai_services: e.target.value })} placeholder="Describe what you offer" rows={2} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">What makes you unique? (optional)</Label>
              <Input value={form.ai_unique_points} onChange={e => set({ ai_unique_points: e.target.value })} placeholder="e.g., Family-owned, same-day service..." />
            </div>
            <Button onClick={handleGenerateDesc} variant="outline" size="sm" disabled={isGeneratingDesc} className="gap-2">
              {isGeneratingDesc ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate Description</>}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Short Description</Label>
            <Textarea value={form.short_description} onChange={e => set({ short_description: e.target.value })} placeholder="1–2 sentences for search results" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Full Description</Label>
            <Textarea value={form.long_description} onChange={e => set({ long_description: e.target.value })} placeholder="Detailed description for your business page" rows={5} />
          </div>
          {form.ai_medium_version && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-1">Alternative (medium) version:</p>
              <p className="text-sm text-blue-800 mb-2">{form.ai_medium_version}</p>
              <Button size="sm" variant="outline" onClick={() => set({ long_description: form.ai_medium_version })}>Use This Version</Button>
            </div>
          )}
        </Section>

        {/* ── 2. Category ── */}
        <Section number="2" title="Category & Tags">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category_id || ""} onValueChange={v => set({ category_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={`cat-${cat.id}`} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tags (comma separated)</Label>
              <Button onClick={handleGenerateTags} variant="outline" size="sm" disabled={isGeneratingTags || !form.business_name || !form.category_id} className="gap-1">
                {isGeneratingTags ? <><Loader2 className="w-3 h-3 animate-spin" />Suggesting...</> : <><Sparkles className="w-3 h-3" />AI Suggest</>}
              </Button>
            </div>
            <Textarea value={form.tags} onChange={e => set({ tags: e.target.value })} placeholder="kosher, delivery, parking, catering" rows={2} />
          </div>
        </Section>

        {/* ── 3. Address & Contact ── */}
        <Section number="3" title="Address & Contact">
          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input value={form.address_line1} onChange={e => set({ address_line1: e.target.value })} placeholder="123 Main Street" />
          </div>
          <div className="space-y-2">
            <Label>Suite / Apt</Label>
            <Input value={form.address_line2} onChange={e => set({ address_line2: e.target.value })} placeholder="Suite 200" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>City *</Label>
              <Input value={form.city} onChange={e => set({ city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={e => set({ state: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>ZIP</Label>
              <Input value={form.zip_code} onChange={e => set({ zip_code: e.target.value })} placeholder="08701" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input type="tel" value={form.phone} onChange={e => set({ phone: formatPhone(e.target.value) })} placeholder="(732) 555-0123" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input type="tel" value={form.whatsapp_number} onChange={e => set({ whatsapp_number: formatPhone(e.target.value) })} placeholder="(732) 555-0123" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set({ email: e.target.value })} placeholder="info@business.com" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input type="url" value={form.website_url} onChange={e => set({ website_url: e.target.value })} placeholder="https://business.com" />
            </div>
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input type="url" value={form.facebook_url} onChange={e => set({ facebook_url: e.target.value })} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input type="url" value={form.instagram_url} onChange={e => set({ instagram_url: e.target.value })} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input type="url" value={form.linkedin_url} onChange={e => set({ linkedin_url: e.target.value })} placeholder="https://linkedin.com/company/..." />
            </div>
            <div className="space-y-2">
              <Label>YouTube</Label>
              <Input type="url" value={form.youtube_url} onChange={e => set({ youtube_url: e.target.value })} placeholder="https://youtube.com/@..." />
            </div>
            <div className="space-y-2">
              <Label>X (Twitter)</Label>
              <Input type="url" value={form.x_url} onChange={e => set({ x_url: e.target.value })} placeholder="https://x.com/yourhandle" />
            </div>
          </div>
        </Section>

        {/* ── 4. Hours ── */}
        <Section number="4" title="Hours of Operation">
          <div className="flex items-center gap-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={hoursMode === "hours"} onChange={() => { setHoursMode("hours"); set({ by_appointment_only: false }); }} className="w-4 h-4" />
              <span className="font-medium">Set Opening Hours</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={hoursMode === "appointment"} onChange={() => { setHoursMode("appointment"); set({ by_appointment_only: true }); }} className="w-4 h-4" />
              <span className="font-medium">By Appointment Only</span>
            </label>
          </div>

          {hoursMode === "hours" && (
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3 flex-wrap">
                  <div className="w-36 font-medium text-gray-800 text-sm">{label}</div>
                  {key === "saturday" ? (
                    <span className="text-gray-500 italic text-sm">Closed (Shabbos)</span>
                  ) : (
                    <>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={form.opening_hours_json?.[key]?.closed || false}
                          onChange={e => handleHourChange(key, "closed", e.target.checked)}
                        />
                        Closed
                      </label>
                      {!form.opening_hours_json?.[key]?.closed && (
                        <>
                          <Input type="time" value={form.opening_hours_json?.[key]?.open || ""} onChange={e => handleHourChange(key, "open", e.target.value)} className="w-28" />
                          <span className="text-gray-500 text-sm">to</span>
                          <Input type="time" value={form.opening_hours_json?.[key]?.close || ""} onChange={e => handleHourChange(key, "close", e.target.value)} className="w-28" />
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {hoursMode === "appointment" && (
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-center">
              <p className="text-gray-700 font-medium">Your business will be marked as "By Appointment Only"</p>
            </div>
          )}
        </Section>

        {/* ── 5. Images ── */}
        <Section number="5" title="Images">
          {/* Cover Photo */}
          <div>
            <Label className="mb-2 block font-semibold">Cover Photo</Label>
            <CoverPhotoUpload value={form.cover_photo_url} onChange={(url) => set({ cover_photo_url: url })} />
          </div>

          {/* Logo */}
          <div>
            <Label className="mb-2 block">Business Logo</Label>
            {!form.logo_url ? (
              <div className="border-2 border-dashed border-cyan-300 rounded-lg p-6 text-center bg-cyan-50">
                <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={isUploadingLogo} />
                <label htmlFor="logo-upload" className={`cursor-pointer ${isUploadingLogo ? "opacity-50 pointer-events-none" : ""}`}>
                  <Building2 className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{isUploadingLogo ? "Uploading..." : "Upload Logo"}</p>
                </label>
              </div>
            ) : (
              <div className="relative inline-block">
                <img src={form.logo_url} alt="Logo" className="w-28 h-28 rounded-lg object-cover border-2 border-cyan-400" />
                <button onClick={() => set({ logo_url: "" })} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center" type="button">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Videos */}
          <div>
            <Label className="mb-2 block font-semibold">Videos (optional)</Label>
            <VideoManager value={form.videos || []} onChange={(videos) => set({ videos })} />
          </div>

          {/* Gallery */}
          <div>
            <Label className="mb-2 block">Additional Photos ({form.gallery_images.length})</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input type="file" id="gallery-upload" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" disabled={isUploadingGallery} />
              <label htmlFor="gallery-upload" className={`cursor-pointer ${isUploadingGallery ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{isUploadingGallery ? "Uploading..." : "Add gallery images"}</p>
              </label>
            </div>
            {form.gallery_images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {form.gallery_images.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                    <button onClick={() => set({ gallery_images: form.gallery_images.filter((_, i) => i !== idx) })} type="button"
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── 6. Deals ── */}
        <Section number="6" title="Deals & Promotions (Optional)">
          {!showDealForm && (
            <Button onClick={() => setShowDealForm(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add a Deal or Sale
            </Button>
          )}

          {showDealForm && (
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200 space-y-4">
              <h3 className="font-semibold text-gray-900">New Deal</h3>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={currentDeal.title} onChange={e => setCurrentDeal(p => ({ ...p, title: e.target.value }))} placeholder="10% off all items" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={currentDeal.description} onChange={e => setCurrentDeal(p => ({ ...p, description: e.target.value }))} placeholder="Additional details..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input value={currentDeal.badge_text} onChange={e => setCurrentDeal(p => ({ ...p, badge_text: e.target.value }))} placeholder="Sale, Limited Time, New" />
              </div>

              {/* Flyer upload */}
              <div className="space-y-2">
                <Label>Sale Flyer (optional)</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input type="file" id="deal-flyer" accept="image/*" onChange={handleDealFlyerUpload} className="hidden" disabled={isUploadingDealFlyer} />
                  <label htmlFor="deal-flyer">
                    <Button asChild variant="outline" className="cursor-pointer" disabled={isUploadingDealFlyer}>
                      <span><Upload className="w-4 h-4 mr-2" />{isUploadingDealFlyer ? "Uploading..." : "Upload Flyer"}</span>
                    </Button>
                  </label>
                  {currentDeal.flyer_url && (
                    <div className="flex items-center gap-2">
                      <img src={currentDeal.flyer_url} alt="Flyer preview" className="h-12 w-12 object-cover rounded border" />
                      <button type="button" onClick={() => setCurrentDeal(p => ({ ...p, flyer_url: "" }))} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sale link */}
              <div className="space-y-2">
                <Label>Sale Link (optional)</Label>
                <Input type="url" value={currentDeal.sale_link} onChange={e => setCurrentDeal(p => ({ ...p, sale_link: e.target.value }))} placeholder="https://example.com/sale" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="date" value={currentDeal.start_date} onChange={e => setCurrentDeal(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input type="date" value={currentDeal.end_date} onChange={e => setCurrentDeal(p => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddDeal} className="bg-cyan-600 hover:bg-cyan-700">Add Deal</Button>
                <Button variant="outline" onClick={() => setShowDealForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {deals.length > 0 && (
            <div className="space-y-3 mt-4">
              {deals.map((deal, i) => (
                <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{deal.title}</p>
                      {deal.badge_text && <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full">{deal.badge_text}</span>}
                    </div>
                    {deal.description && <p className="text-xs text-gray-600 mb-1">{deal.description}</p>}
                    <p className="text-xs text-gray-500">{deal.start_date} → {deal.end_date}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {deal.flyer_url && <img src={deal.flyer_url} alt="Flyer" className="h-8 w-8 object-cover rounded border" />}
                      {deal.sale_link && (
                        <a href={deal.sale_link} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />Sale Link
                        </a>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setDeals(prev => prev.filter((_, j) => j !== i))} variant="ghost" size="icon" className="text-red-500 hover:text-red-700 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── 7. Plan ── */}
        <Section number="7" title="Choose Your Listing Plan">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANS.map(plan => {
              const Icon = plan.icon;
              const isSelected = form.listing_tier === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => set({ listing_tier: plan.id })}
                  className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${plan.borderColor} ${isSelected ? "ring-2 ring-offset-2 ring-cyan-500 shadow-md" : "hover:shadow-sm"}`}
                >
                  {plan.badge && (
                    <Badge className={`absolute -top-3 left-4 ${plan.color} ${plan.bgColor}`}>{plan.badge}</Badge>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${plan.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${plan.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-500"><span className="text-xl font-bold text-gray-900">{plan.price}</span> /{plan.period}</p>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-cyan-600 ml-auto" />}
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                        <Check className={`w-4 h-4 ${plan.color} flex-shrink-0 mt-0.5`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center text-gray-500">All plans require admin approval before going live.</p>
        </Section>

        {/* ── Submit ── */}
        <div className="pb-10">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 gap-2 rounded-xl shadow-lg"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</>
            ) : (
              <><CheckCircle className="w-5 h-5" />Submit Business for Approval</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}