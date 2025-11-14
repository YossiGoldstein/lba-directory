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
  AlertCircle
} from "lucide-react";
import ContactCard from "../components/business/ContactCard";
import ReviewCard from "../components/business/ReviewCard";
import ReviewForm from "../components/business/ReviewForm";
import DealsSection from "../components/business/DealsSection";
import RelatedBusinesses from "../components/business/RelatedBusinesses";
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

  // Fetch category
  const { data: category } = useQuery({
    queryKey: ["category", business?.category_id],
    queryFn: async () => {
      const categories = await base44.entities.Category.list();
      return categories.find((c) => c.id === business.category_id);
    },
    enabled: !!business?.category_id,
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
      const allReviews = await base44.entities.Review.list();
      return allReviews
        .filter((r) => r.business_id === businessId && r.is_approved)
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
          className={`w-5 h-5 ${
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to={createPageUrl("Home")} className="hover:text-cyan-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          {category && (
            <>
              <Link
                to={createPageUrl(`CategoryListing?slug=${category.slug}`)}
                className="hover:text-cyan-600 transition-colors"
              >
                {category.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="font-medium text-gray-900">{business.business_name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {/* Logo & Title */}
              <div className="flex items-start gap-4 mb-4">
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={business.business_name}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {business.business_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {category && (
                      <Link
                        to={createPageUrl(`CategoryListing?slug=${category.slug}`)}
                        className="text-cyan-600 hover:text-cyan-700 font-medium"
                      >
                        {category.name}
                      </Link>
                    )}
                    {(business.city || business.state) && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          {business.city}
                          {business.city && business.state && ", "}
                          {business.state}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {business.is_lba_sponsor && (
                      <Badge className="bg-blue-600 text-white">LBA Sponsor</Badge>
                    )}
                    {business.is_featured && (
                      <Badge className="bg-yellow-500 text-white">Featured</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                {business.average_rating > 0 ? (
                  <>
                    <div className="flex gap-1">
                      {renderStars(business.average_rating)}
                    </div>
                    <span className="text-gray-600">
                      {business.average_rating.toFixed(1)} ({business.reviews_count || 0} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">No reviews yet - be the first to review</span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            {business.gallery_images && business.gallery_images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {business.gallery_images.map((img, idx) => (
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

            {/* Deals */}
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

            {/* Map */}
            {business.latitude && business.longitude && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-64">
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
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <ContactCard business={business} />
          </div>
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

        {/* Related Businesses */}
        {relatedBusinesses.length > 0 && (
          <div className="mt-12">
            <RelatedBusinesses 
              businesses={relatedBusinesses} 
              categoryName={category?.name || ""}
            />
          </div>
        )}
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