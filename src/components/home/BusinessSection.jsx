import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Building2, Eye, TrendingUp, Megaphone, BarChart } from "lucide-react";

export default function BusinessSection({ user }) {
  const benefits = [
    {
      icon: Building2,
      text: "Showcase your business details, photos, and links"
    },
    {
      icon: Megaphone,
      text: "Highlight your best deals and promotions"
    },
    {
      icon: Eye,
      text: "Get visibility in a trusted local directory"
    },
    {
      icon: BarChart,
      text: "Track views, clicks, and customer activity"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Illustration */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <Building2 className="w-16 h-16 text-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[TrendingUp, Eye, Megaphone, BarChart].map((Icon, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center gap-2">
                      <Icon className="w-8 h-8 text-blue-600" />
                      <div className="w-full h-2 bg-blue-100 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              FOR BUSINESSES
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              I AM A BUSINESS
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              List your business and reach more local customers.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-gray-700 font-medium">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            {user?.is_business_owner ? (
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                asChild
              >
                <Link to={createPageUrl("BusinessDashboard")}>
                  Go to Business Dashboard
                </Link>
              </Button>
            ) : (
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                asChild
              >
                <Link to={createPageUrl("AddBusiness")}>
                  Add My Business
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}