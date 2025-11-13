import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error() {
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get("message") || "Something went wrong. Please try again.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-8">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link to={createPageUrl("Home")}>Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}