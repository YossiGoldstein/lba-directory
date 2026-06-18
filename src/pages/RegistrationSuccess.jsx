import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";

export default function RegistrationSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email") || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to={createPageUrl("Home")}>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png"
              alt="LBA Directory"
              className="h-16 w-auto"
            />
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Registration Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Welcome to <strong className="text-cyan-600">LBA Directory</strong>!
              </p>
              <p className="text-gray-700">
                Your account has been successfully created.
              </p>
              
              {email && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-cyan-900">Your account is ready</p>
                    <p className="text-sm text-cyan-700">
                      You can now sign in with <strong>{email}</strong> and the password you chose to access your dashboard.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Sign in to access your dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Explore local businesses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Save favorites and write reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Add your own business (if applicable)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                asChild
              >
                <Link to={createPageUrl("SignIn")}>
                  Sign In Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                asChild
              >
                <Link to={createPageUrl("Home")}>
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}