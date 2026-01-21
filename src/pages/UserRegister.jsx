import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UserRegister() {
  useEffect(() => {
    // Get the next URL parameter if it exists
    const nextUrl = new URLSearchParams(window.location.search).get("next");
    
    // Redirect to Base44's built-in authentication system for registration
    base44.auth.redirectToLogin(nextUrl || createPageUrl("Home"));
  }, []);

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
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">מעביר אותך להרשמה...</CardTitle>
            <CardDescription className="text-center">
              אנא המתן
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">מעביר אותך למערכת ההרשמה...</p>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link 
            to={createPageUrl("Home")} 
            className="text-sm text-cyan-600 hover:text-cyan-700"
          >
            ← חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}