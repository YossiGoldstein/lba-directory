import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Heart, Building2, ArrowRight } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  const [nextUrl, setNextUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    let isLoggedIn = false;
    try {
      const customer = JSON.parse(localStorage.getItem("lba_customer"));
      isLoggedIn = !!(customer && customer.id);
    } catch (e) {
      isLoggedIn = false;
    }
    if (isLoggedIn) {
      // If already logged in, redirect to next URL or home
      const urlParams = new URLSearchParams(window.location.search);
      const next = urlParams.get("next") || createPageUrl("Home");
      navigate(next);
    }

    // Get next URL and set message
    const urlParams = new URLSearchParams(window.location.search);
    const next = urlParams.get("next") || "";
    setNextUrl(next);
    
    if (next.includes("AddBusiness")) {
      setMessage("You must be logged in to add a business.");
    } else if (next) {
      setMessage("You must be logged in to continue.");
    }
  }, [navigate]);

  const handleSignIn = () => {
    const target = createPageUrl("SignIn");
    navigate(nextUrl ? target + "?next=" + encodeURIComponent(nextUrl) : target);
  };

  const handleSignUp = () => {
    const target = createPageUrl("UserRegister");
    navigate(nextUrl ? target + "?next=" + encodeURIComponent(nextUrl) : target);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center p-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png"
              alt="LBA Directory"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the
          </h1>
          <h2 className="text-4xl font-extrabold text-cyan-600 mb-3">
            LBA Directory
          </h2>
          <p className="text-gray-600 text-base">
            AI powered directory for easy searching, connecting, and following
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm text-center font-medium">
            {message}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="space-y-4 mb-8">
          <Button
            onClick={handleSignIn}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6 shadow-lg"
          >
            Sign In
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={handleSignUp}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg py-6 shadow-lg"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Value Sections */}
        <div className="space-y-6">
          {/* For Shoppers */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-pink-500" />
              <h3 className="text-lg font-bold text-gray-900">For Shoppers</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1 font-bold">•</span>
                <span>Save businesses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1 font-bold">•</span>
                <span>Follow deals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1 font-bold">•</span>
                <span>Search faster</span>
              </li>
            </ul>
          </div>

          {/* For Business Owners */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-cyan-600" />
              <h3 className="text-lg font-bold text-gray-900">For Business Owners</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1 font-bold">•</span>
                <span>Add your business</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1 font-bold">•</span>
                <span>Promote deals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1 font-bold">•</span>
                <span>Reach local customers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Powered by LBA Leagues & TIG Solutions
        </p>
      </div>
    </div>
  );
}