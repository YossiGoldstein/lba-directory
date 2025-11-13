import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

import HeroSection from "../components/home/HeroSection";
import CategoryGrid from "../components/home/CategoryGrid";
import ShopperSection from "../components/home/ShopperSection";
import BusinessSection from "../components/home/BusinessSection";
import FeaturedBusinesses from "../components/home/FeaturedBusinesses";
import LatestDeals from "../components/home/LatestDeals";
import HowItWorks from "../components/home/HowItWorks";
import CTASection from "../components/home/CTASection";

export default function Home() {
  const [user, setUser] = useState(null);

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

  // Load categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ is_active: true }, "sort_order", 100),
  });

  // Load featured businesses
  const { data: featuredBusinesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['featured-businesses'],
    queryFn: async () => {
      try {
        return await base44.entities.Business.filter(
          { status: "approved", is_featured: true }, 
          "-created_date", 
          6
        );
      } catch (error) {
        return [];
      }
    },
  });

  // Load all businesses for deals reference
  const { data: allBusinesses = [] } = useQuery({
    queryKey: ['all-businesses'],
    queryFn: async () => {
      try {
        return await base44.entities.Business.filter({ status: "approved" }, "-created_date", 100);
      } catch (error) {
        return [];
      }
    },
  });

  // Load latest deals
  const { data: latestDeals = [] } = useQuery({
    queryKey: ['latest-deals'],
    queryFn: async () => {
      try {
        const deals = await base44.entities.Deal.filter({ is_active: true }, "-start_date", 6);
        const now = new Date();
        return deals.filter(deal => {
          const startDate = new Date(deal.start_date);
          const endDate = new Date(deal.end_date);
          return startDate <= now && endDate >= now;
        });
      } catch (error) {
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <HeroSection />

      {/* Category Grid */}
      {!categoriesLoading && <CategoryGrid categories={categories} />}

      {/* Shopper Section */}
      <ShopperSection user={user} />

      {/* Business Section */}
      <BusinessSection user={user} />

      {/* Featured Businesses */}
      {featuredBusinesses.length > 0 && (
        <FeaturedBusinesses 
          businesses={featuredBusinesses} 
          categories={categories}
        />
      )}

      {/* Latest Deals */}
      {latestDeals.length > 0 && (
        <LatestDeals 
          deals={latestDeals} 
          businesses={allBusinesses}
        />
      )}

      {/* How It Works */}
      <HowItWorks />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}