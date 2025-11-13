import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
          Join the Lakewood Business Alliance Directory today and connect with your community.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl"
            asChild
          >
            <Link to={createPageUrl("CategoryListing?slug=all")}>
              Browse Businesses <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>

          <Button 
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-6 text-lg font-semibold"
            asChild
          >
            <Link to={createPageUrl("AddBusiness")}>
              <Plus className="w-5 h-5 mr-2" />
              Add Your Business
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-blue-700">
          <p className="text-blue-200 mb-4">Trusted by the Lakewood community</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-300">
            <div>✓ Free Basic Listings</div>
            <div>✓ Verified Reviews</div>
            <div>✓ Local Community</div>
            <div>✓ Easy to Use</div>
          </div>
        </div>
      </div>
    </section>
  );
}