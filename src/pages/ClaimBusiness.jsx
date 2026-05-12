import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function ClaimBusiness() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error | no_token
  const [message, setMessage] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessId, setBusinessId] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("no_token");
      return;
    }
    handleVerify();
  }, []);

  const handleVerify = async () => {
    setStatus("loading");
    try {
      // Check if user is authenticated via custom auth (localStorage)
      const customerData = localStorage.getItem("lba_customer");
      if (!customerData) {
        // Redirect to custom SignIn page, then back here
        window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(window.location.href);
        return;
      }

      const customer = JSON.parse(customerData);

      const response = await base44.functions.invoke("verifyClaimToken", {
        token,
        userId: customer.id,
        userEmail: customer.email,
      });
      const data = response.data;

      if (data.success) {
        setStatus("success");
        setBusinessName(data.businessName || "");
        setBusinessId(data.businessId || "");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err?.response?.data?.error || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003D5C] to-[#0E8DAA] p-6 text-center">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png"
            alt="LBA Directory"
            className="h-12 w-auto mx-auto"
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your claim...</h2>
              <p className="text-gray-500">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Claimed!</h2>
              <p className="text-gray-600 mb-6">
                You are now the owner of <strong>{businessName}</strong>.
                You can manage your listing from the Business Dashboard.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild className="bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:opacity-90 text-white w-full">
                  <Link to={createPageUrl("BusinessDashboard") + (businessId ? `?id=${businessId}` : "")}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Go to Business Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to={createPageUrl("Home")}>Back to Directory</Link>
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button asChild variant="outline" className="w-full">
                <Link to={createPageUrl("Home")}>Back to Directory</Link>
              </Button>
            </>
          )}

          {status === "no_token" && (
            <>
              <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
              <p className="text-gray-600 mb-6">This claim link is invalid or missing.</p>
              <Button asChild variant="outline" className="w-full">
                <Link to={createPageUrl("Home")}>Back to Directory</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}