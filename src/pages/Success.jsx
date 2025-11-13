import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function Success() {
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get("message") || "Action completed successfully!";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Success!</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <Link to={createPageUrl("Home")}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}