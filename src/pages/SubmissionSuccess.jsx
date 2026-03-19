import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Home } from "lucide-react";

export default function SubmissionSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const businessName = urlParams.get("businessName") || "Your business";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Submission Successful!
          </h1>

          <p className="text-xl text-gray-700 mb-6">
            Thank you! <strong>{businessName}</strong> has been submitted to our directory.
          </p>

          {/* Next Steps */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-6">What Happens Next?</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Review & Approval</h3>
                  <p className="text-gray-700">Our team will review your submission within 1-2 business days</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Email Notification</h3>
                  </div>
                  <p className="text-gray-700">You'll receive an email confirmation with all your details</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">You're Live!</h3>
                  <p className="text-gray-700">Your business will be live on the directory and searchable by customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notification */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
            <p className="text-gray-700 text-lg">
              💌 <strong>Check your email</strong> - We've already sent you an initial confirmation that your submission was received!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
            >
              <Link to={createPageUrl("Home")}>
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-12 text-lg"
            >
              <Link to={createPageUrl("UserDashboard")}>
                My Dashboard
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-10 pt-10 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Want to Promote Your Business?</h3>
            <p className="text-gray-700 mb-6">
              We offer additional services like logo design, website building, promotional videos, and more. <br />
              <strong>Contact us</strong> to learn more!
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 <strong>Email:</strong> office@lbadirectory.com</p>
              <p>📱 <strong>WhatsApp:</strong> 732-600-1260</p>
              <p>☎️ <strong>Phone:</strong> 732-600-1260</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}