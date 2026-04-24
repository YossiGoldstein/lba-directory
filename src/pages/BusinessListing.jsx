import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { fixImageUrl } from "@/components/lib/imageUtils";
import BusinessImage from "@/components/lib/BusinessImage";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  Star, 
  Heart, 
  Share2,
  AlertCircle,
  MapPin,
  MessageSquare
} from "lucide-react";
import SingleBusinessMap from "@/components/maps/SingleBusinessMap";
import ContactCard from "../components/business/ContactCard";
import ReviewCard from "../components/business/ReviewCard";
import ReviewForm from "../components/business/ReviewForm";
import DealsSection from "../components/business/DealsSection";
import RelatedBusinesses from "../components/business/RelatedBusinesses";
import AskAboutBusiness from "../components/business/AskAboutBusiness";
import RelatedCategoriesSection from "../components/business/RelatedCategoriesSection";

import { toast } from "sonner";

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export default function BusinessListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get("id");

  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);

  const storedCustomerData = localStorage.getItem("lba_customer");
  const currentUserId = storedCustomerData ? JSON.parse(storedCustomerData).id : null;

  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      try {
        const customerData = localStorage.getItem("lba_customer");
        if (customerData) {
          setCustomer(JSON.parse(customerData));
        }
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const { data: favoriteRecord, isLoading: isLoadingFavorite } = useQuery({
    queryKey: ["favorite", currentUserId, businessId],
    queryFn: async () => {
      const results = await base44.entities.Favorite.filter({ user_id: currentUserId, business_id: businessId });
      return results;
    },
    enabled: !!currentUserId && !!businessId,
    staleTime: 0,
  });

  useEffect(() => {
    if (favoriteRecord !== undefined) {
      setIsFavorite(favoriteRecord.length > 0);
    }
  }, [favoriteRecord]);

  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["business", businessId],
    queryFn: async () => {
      const businesses = await base44.entities.Business.list();
      return businesses.find((b) => b.id === businessId);
    },
    enabled: !!businessId,
  });

  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      return cats.filter((c) => c.is_active);
    },
  });

  const { data: category } = useQuery({
    queryKey: ["category", business?.category_id],
    queryFn: async () => {
      return allCategories.find((c) => c.id === business.category_id);
    },
    enabled: !!business?.category_id && allCategories.length > 0,
  });

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

  const { 
    data: reviews = [], 
    refetch: refetchReviews 
  } = useQuery({
    queryKey: ["reviews", businessId],
    queryFn: async () => {
      const [allReviews, allCustomers] = await Promise.all([
        base44.entities.Review.list(),
        base44.entities.Customer.list()
      ]);
      
      return allReviews
        .filter((r) => r.business_id === businessId && r.is_approved)
        .map((review) => ({
          ...review,
          user: allCustomers.find(c => c.id === review.user_id) || { full_name: "Anonymous" }
        }))
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!businessId,
  });

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

  const getShareUrl = () => {
    const identifier = business.slug
      ? `slug=${business.slug}`
      : `id=${business.id}`;
    return `https://www.lbadirectory.com/functions/b?${identifier}`;
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl();
    if (navigator.share) {
      navigator.share({
        title: `${business.business_name} | LBA Directory`,
        text: business.short_description || `Find ${business.business_name} on LBA Directory`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied!");
    }
  };

  const handleToggleFavorite = async () => {
    if (isAddingFavorite) return;
    
    const customerData = localStorage.getItem("lba_customer");
    const hasAuth = user || customerData;
    
    if (!hasAuth) {
      window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }
    
    const userId = customerData ? JSON.parse(customerData).id : user.id;

    setIsAddingFavorite(true);
    try {
      const existing = await base44.entities.Favorite.filter({ user_id: userId, business_id: businessId });
      
      if (existing.length > 0) {
        await Promise.all(existing.map(f => base44.entities.Favorite.delete(f.id)));
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await base44.entities.Favorite.create({
          user_id: userId,
          business_id: businessId
        });
        setIsFavorite(true);
        toast.success("Added to favorites!");
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorites");
      try {
        const existing = await base44.entities.Favorite.filter({ user_id: userId, business_id: businessId });
        setIsFavorite(existing.length > 0);
      } catch (refreshError) {
        console.error("Failed to refresh favorite state:", refreshError);
      }
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSent, setClaimSent] = useState(false);

  const handleClaimBusiness = async () => {
    const customerData = localStorage.getItem("lba_customer");
    if (!customerData) {
      window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }
    setShowClaimModal(true);
  };

  const handleSendClaimEmail = async () => {
    setClaimLoading(true);
    try {
      const response = await base44.functions.invoke("sendClaimEmail", { businessId });
      if (response.data?.success) {
        setClaimSent(true);
        toast.success("Claim email sent successfully!");
      } else {
        toast.error(response.data?.error || "Failed to send claim email.");
      }
    } catch (error) {
      console.error("Claim error:", error);
      toast.error(error.message || "Failed to send claim email");
    } finally {
      setClaimLoading(false);
    }
  };

  const handleSubmitReview = () => {
    const customerData = localStorage.getItem("lba_customer");
    const hasAuth = user || customerData;
    
    if (!hasAuth) {
      window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }
    setShowReviewForm(!showReviewForm);
  };

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
      {/* Hero Section - Two zones: image + dark info bar */}
      <div className="w-full bg-gray-900">
        {/* TOP ZONE: Cover Image */}
        {(business.cover_photo_url || (business.gallery_images && business.gallery_images.length > 0) || business.logo_url) && (
          <div
            className="w-full overflow-hidden bg-gray-800"
            style={{ height: "400px", maxHeight: "45vh", minHeight: "200px" }}
          >
            <BusinessImage
              business={business}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* BOTTOM ZONE: Dark info bar */}
        <div className="bg-gray-900 px-4 sm:px-6 md:px-8 pb-6 md:pb-8">
          <div className="max-w-[1600px] mx-auto">
            {/* Logo straddling top of dark zone */}
            <div className="flex items-end gap-4 md:gap-6 -mt-8 md:-mt-14 mb-4">
              <div className="w-16 h-16 md:w-28 md:h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                {business.logo_url ? (
                  <img
                    src={fixImageUrl(business.logo_url)}
                    alt={business.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl md:text-5xl font-bold text-cyan-600">
                    {business.business_name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="pb-1 flex flex-wrap gap-2">
                {business.is_lba_sponsor && (
                  <Badge className="bg-blue-600 text-white">LBA Sponsor</Badge>
                )}
                {business.listing_tier === 'premium' && (
                  <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Premium
                  </Badge>
                )}
              </div>
            </div>

            {/* Business Name */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
              {business.business_name}
            </h1>

            {/* Address + Phone */}
            <div className="flex flex-col gap-1.5 text-gray-300 mb-5">
              {(business.address_line1 || business.city) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span className="text-sm md:text-base">
                    {business.address_line1 && `${business.address_line1}, `}
                    {business.city}{business.state && `, ${business.state}`}
                  </span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm md:text-base">{formatPhoneNumber(business.phone)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleFavorite}
                disabled={isAddingFavorite || isLoadingUser || isLoadingFavorite}
                className={`flex-1 min-w-[140px] ${
                  isFavorite
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                    : 'bg-white/90 hover:bg-white text-gray-900 border-2 border-white'
                } transition-colors text-sm`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-white' : ''}`} />
                {isLoadingUser ? 'Loading...' : isFavorite ? 'Saved' : 'Add to Favorites'}
              </Button>

              {!business.owner_id && (
                <Button
                  size="sm"
                  onClick={handleClaimBusiness}
                  className="flex-1 min-w-[140px] bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:opacity-90 text-white font-semibold text-sm"
                >
                  🏢 Claim This Business
                </Button>
              )}

              {((business.latitude && business.longitude) || business.address_line1) && (
                <Button
                  size="sm"
                  asChild
                  className="flex-1 min-w-[140px] bg-white/90 hover:bg-white text-gray-900 font-semibold border-2 border-white transition-colors text-sm"
                >
                  <a
                    href={
                      business.latitude && business.longitude
                        ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
                        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${business.address_line1}, ${business.city}, ${business.state} ${business.zip_code}`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Directions
                  </a>
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="flex-1 min-w-[120px] bg-white/90 hover:bg-white text-gray-900 border-2 border-white transition-colors text-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Bar - Below Hero */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {business.reviews_count > 0 ? (
              <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 text-sm font-medium">General:</span>
                  <div className="flex gap-0.5">
                    {renderStars(business.general_rating || 0)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 text-sm font-medium">Servicing:</span>
                  <div className="flex gap-0.5">
                    {renderStars(business.servicing_rating || 0)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 text-sm font-medium">Pricing:</span>
                  <div className="flex gap-0.5">
                    {renderStars(business.pricing_rating || 0)}
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  ({business.reviews_count} {business.reviews_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No reviews yet</div>
            )}

            <Button 
              onClick={handleSubmitReview}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Submit a Review
            </Button>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Submit Your Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ReviewForm
              businessId={businessId}
              onReviewSubmitted={() => {
                setShowReviewForm(false);
                refetchReviews();
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Right Column - Contact & Map */}
          <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
            <ContactCard business={business} />

            {business.gallery_images && business.gallery_images.length > 1 && (
              <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Gallery</h3>
                <div className="grid grid-cols-3 gap-2">
                  {business.gallery_images.slice(1).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(fixImageUrl(img))}
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
                    >
                      <img
                        src={fixImageUrl(img)}
                        alt={`${business.business_name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {((business.latitude && business.longitude) || business.address_line1 || business.city) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Location</h3>
                </div>
                <SingleBusinessMap business={business} height="320px" />
              </div>
            )}
          </div>

          {/* Left Column - Business Details */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this business</h2>
              {business.ai_summary && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-cyan-900 mb-1">AI Summary</p>
                  <p className="text-gray-700">{business.ai_summary}</p>
                </div>
              )}
              {business.short_description && (
                <p className="text-gray-600 italic mb-4">{business.short_description}</p>
              )}
              {business.long_description && (
                <div className="text-gray-700 whitespace-pre-line">{business.long_description}</div>
              )}
              {!business.short_description && !business.long_description && (
                <p className="text-gray-500">No description available.</p>
              )}
            </div>

            {business.opening_hours_text && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Opening Hours</h2>
                <p className="text-gray-700 whitespace-pre-line">{business.opening_hours_text}</p>
              </div>
            )}

            {deals.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <DealsSection deals={deals} />
              </div>
            )}

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

            {business.videos && business.videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.videos.map((video, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
                      {video.type === "upload" ? (
                        <video
                          src={video.embed_url}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <iframe
                          src={video.embed_url}
                          title={video.title || `Video ${idx + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full"
                          frameBorder="0"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {business.gallery_images && business.gallery_images.length > 1 && (
          <div className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Gallery</h3>
            <div className="grid grid-cols-3 gap-2">
              {business.gallery_images.slice(1).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(fixImageUrl(img))}
                  className="aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
                >
                  <img
                    src={fixImageUrl(img)}
                    alt={`${business.business_name} - ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <RelatedCategoriesSection
            business={business}
            category={category}
            allCategories={allCategories}
          />
        </div>
      </div>

      {/* Claim Business Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            {claimSent ? (
              <>
                <div className="text-5xl mb-4">📧</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email!</h3>
                <p className="text-gray-600 mb-6">
                  We sent a claim link to <strong>{user?.email}</strong>.<br />
                  Click the link in the email to claim <strong>{business.business_name}</strong>.
                </p>
                <p className="text-sm text-gray-400 mb-6">The link expires in 24 hours.</p>
                <Button onClick={() => { setShowClaimModal(false); setClaimSent(false); }} className="w-full">Close</Button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🏢</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Claim This Business</h3>
                <p className="text-gray-600 mb-6">
                  Are you the owner of <strong>{business.business_name}</strong>?<br />
                  We'll send a verification link to your email.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSendClaimEmail}
                    disabled={claimLoading}
                    className="bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:opacity-90 text-white w-full font-semibold"
                  >
                    {claimLoading ? "Sending..." : "Send Claim Email"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowClaimModal(false)} className="w-full">Cancel</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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