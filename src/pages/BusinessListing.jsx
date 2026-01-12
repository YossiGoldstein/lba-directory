import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { 
  ChevronRight, 
  Star, 
  Heart, 
  Share2,
  AlertCircle,
  MapPin
} from "lucide-react";
import ContactCard from "../components/business/ContactCard";
import ReviewCard from "../components/business/ReviewCard";
import ReviewForm from "../components/business/ReviewForm";
import DealsSection from "../components/business/DealsSection";
import RelatedBusinesses from "../components/business/RelatedBusinesses";
import AskAboutBusiness from "../components/business/AskAboutBusiness";
import RelatedCategoriesSection from "../components/business/RelatedCategoriesSection";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "sonner";

// Fix Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function BusinessListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get("id");

  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Fetch business
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["business", businessId],
    queryFn: async () => {
      const businesses = await base44.entities.Business.list();
      return businesses.find((b) => b.id === businessId);
    },
    enabled: !!businessId,
  });

  // Fetch all categories
  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.filter((c) => c.is_active);
    },
  });

  // Fetch category
  const { data: category } = useQuery({
    queryKey: ["category", business?.category_id],
    queryFn: async () => {
      return allCategories.find((c) => c.id === business.category_id);
    },
    enabled: !!business?.category_id && allCategories.length > 0,
  });

  // Fetch deals
  const { data: deals = [] } = useQuery({
    queryKey: ["deals", businessId],
    queryFn: async () => {
      const allDeals = await base44.entities.Deal.list();
      const now = new Date();
      return allDeals.filter((deal) => {
        if (deal.business_id !== businessId || !deal.is_active) return false;
        const start = new Date(deal.start_date);
        const end = new Date(deal.end_date);
        return start <= now && end >= now;
      });
    },
    enabled: !!businessId,
  });

  // Fetch reviews
  const { 
    data: reviews = [], 
    refetch: refetchReviews 
  } = useQuery({
    queryKey: ["reviews", businessId],
    queryFn: async () => {
      const [allReviews, allUsers] = await Promise.all([
        base44.entities.Review.list(),
        base44.entities.User.list()
      ]);
      
      return allReviews
        .filter((r) => r.business_id === businessId && r.is_approved)
        .map((review) => ({
          ...review,
          user: allUsers.find(u => u.id === review.user_id)
        }))
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!businessId,
  });

  // Fetch related businesses
  const { data: relatedBusinesses = [] } = useQuery({
    queryKey: ["relatedBusinesses", business?.category_id, businessId],
    queryFn: async () => {
      const businesses = await base44.entities.Business.list();
      return businesses
        .filter((b) => 
          b.category_id === business.category_id && 
          b.id !== businessId && 
          b.status === "approved"
        )
        .slice(0, 3);
    },
    enabled: !!business?.category_id && !!businessId,
  });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.business_name,
        text: business.short_description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Loading state
  if (businessLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading business...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!business) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Business Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This business could not be found or may have been removed.
          </p>
          <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
            <Link to={createPageUrl("Home")}>Back to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section with Cover Image */}
      <div className="relative w-full h-[60vh] min-h-[400px] bg-gray-900">
        {/* Cover Image */}
        <img
          src={business.gallery_images && business.gallery_images.length > 0 
            ? business.gallery_images[0] 
            : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=800&fit=crop"}
          alt={business.business_name}
          className="w-full h-full object-cover"
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80"></div>
        
        {/* Status Badges */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Open/Closed - Top Left */}
          {business.opening_hours_json && (
            <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-sm font-bold ${
              (() => {
                const now = new Date();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const hours = business.opening_hours_json[dayNames[now.getDay()]];
                if (!hours || hours.closed) return 'bg-red-500 text-white';
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const [openHour, openMin] = hours.open.split(':').map(Number);
                const [closeHour, closeMin] = hours.close.split(':').map(Number);
                const openTime = openHour * 60 + openMin;
                const closeTime = closeHour * 60 + closeMin;
                return (currentTime >= openTime && currentTime <= closeTime) ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
              })()
            }`}>
              {(() => {
                const now = new Date();
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const hours = business.opening_hours_json[dayNames[now.getDay()]];
                if (!hours || hours.closed) return 'CLOSED';
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const [openHour, openMin] = hours.open.split(':').map(Number);
                const [closeHour, closeMin] = hours.close.split(':').map(Number);
                const openTime = openHour * 60 + openMin;
                const closeTime = closeHour * 60 + closeMin;
                return (currentTime >= openTime && currentTime <= closeTime) ? 'OPEN' : 'CLOSED';
              })()}
            </div>
          )}
          
          {/* Tier & Deal Badges - Top Right */}
          <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
            {deals.length > 0 && (
              <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                SALE
              </div>
            )}
            {business.listing_tier === 'pro' && (
              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                PRO
              </div>
            )}
            {business.listing_tier === 'premium' && (
              <div className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                PREMIUM
              </div>
            )}
          </div>
        </div>

        {/* Business Info Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 pb-8">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-4 md:gap-6">
                {/* Logo Circle */}
                {business.logo_url && (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white flex-shrink-0">
                    <img
                      src={business.logo_url}
                      alt={business.business_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Business Details */}
                <div className="flex-1 pb-2 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg break-words">
                    {business.business_name}
                  </h1>
                  {business.listing_tier === 'premium' && (
                    <svg className="w-8 h-8 text-blue-400 flex-shrink-0 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                </div>

                <div className="flex flex-col gap-2 text-white">
                  {/* Address */}
                  {(business.address_line1 || business.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 flex-shrink-0" />
                      <span className="text-lg drop-shadow">
                        {business.address_line1 && `${business.address_line1}, `}
                        {business.city}
                        {business.state && `, ${business.state}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Phone */}
                  {business.phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-lg drop-shadow">{business.phone}</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {business.is_lba_sponsor && (
                    <Badge className="bg-blue-600 text-white">LBA Sponsor</Badge>
                  )}
                  {business.is_featured && (
                    <Badge className="bg-yellow-500 text-white">Featured</Badge>
                  )}
                </div>
                </div>
                </div>

                {/* Bottom Row - Ratings and Favorite Button */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
                  {/* Ratings Row */}
                  {business.reviews_count > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm sm:text-base font-medium drop-shadow">General:</span>
                        <div className="flex gap-0.5">
                          {renderStars(business.general_rating || 0)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm sm:text-base font-medium drop-shadow">Servicing:</span>
                        <div className="flex gap-0.5">
                          {renderStars(business.servicing_rating || 0)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm sm:text-base font-medium drop-shadow">Pricing:</span>
                        <div className="flex gap-0.5">
                          {renderStars(business.pricing_rating || 0)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Favorite Button */}
                  <Button 
                  size="lg"
                  variant="outline" 
                  className="bg-white/90 hover:bg-white border-2 border-white w-full md:w-auto"
                  >
                  <Heart className="w-5 h-5 mr-2" />
                  Add to Favorites
                  </Button>
                </div>
                </div>
                </div>
                </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Right Column - Gallery & Map */}
          <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
            {/* Gallery */}
            {business.gallery_images && business.gallery_images.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Gallery</h3>
                <div className="grid grid-cols-3 gap-2">
                  {business.gallery_images.slice(1).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
                    >
                      <img
                        src={img}
                        alt={`${business.business_name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {business.latitude && business.longitude && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Location</h3>
                </div>
                <div className="h-80">
                  <MapContainer
                    center={[business.latitude, business.longitude]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[business.latitude, business.longitude]}>
                      <Popup>{business.business_name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Contact Card */}
            <ContactCard business={business} />
          </div>

          {/* Left Column - Business Details */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this business</h2>
              {business.ai_summary && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-cyan-900 mb-1">AI Summary</p>
                  <p className="text-gray-700">{business.ai_summary}</p>
                </div>
              )}
              <div className="text-gray-700 whitespace-pre-line">
                {business.long_description || business.short_description}
              </div>
            </div>

            {/* Opening Hours */}
            {business.opening_hours_text && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Opening Hours</h2>
                <p className="text-gray-700 whitespace-pre-line">{business.opening_hours_text}</p>
              </div>
            )}

            {/* Deals / Sales */}
            {deals.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <DealsSection deals={deals} />
              </div>
            )}

            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Highlights</h2>
                <div className="flex flex-wrap gap-2">
                  {business.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Categories Section */}
        <div className="mt-6">
          <RelatedCategoriesSection
            business={business}
            category={category}
            allCategories={allCategories}
          />
        </div>

        {/* Reviews Section */}
        <div className="mt-12 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

            {/* Review Form */}
            {user ? (
              <div className="mb-8">
                <ReviewForm 
                  businessId={businessId} 
                  onReviewSubmitted={refetchReviews}
                />
              </div>
            ) : (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-700 mb-4">
                  Log in or create a shopper account to write a review
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link to={createPageUrl("Login")}>Login</Link>
                  </Button>
                  <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                    <Link to={createPageUrl("Register")}>Register</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}