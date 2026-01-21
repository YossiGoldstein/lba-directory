import React, { useEffect } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function SignIn() {
  useEffect(() => {
    const nextUrl = new URLSearchParams(window.location.search).get("next");
    base44.auth.redirectToLogin(nextUrl || createPageUrl("Home"));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}