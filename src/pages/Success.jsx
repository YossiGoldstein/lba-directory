import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";

// Real verification against Stripe via verifyCheckoutSession (replaces the old
// fake 2-second spinner that showed "Payment Received!" unconditionally).
export default function Success() {
  // 'verifying' | 'paid' | 'upgraded' | 'processing' | 'unknown'
  const [state, setState] = useState("verifying");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      // Direct navigation with no checkout session — don't claim payment happened
      setState("unknown");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("verifyCheckoutSession", { session_id: sessionId });
        if (cancelled) return;
        if (res.data?.success && res.data.paid) {
          setState(res.data.mode === "upgrade" ? "upgraded" : "paid");
        } else if (res.data?.success && res.data.checkout_status === "complete") {
          // Completed checkout, payment still settling (rare for cards)
          setState("processing");
        } else {
          setState("unknown");
        }
      } catch {
        if (!cancelled) setState("unknown");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (state === "verifying") {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  const isPaid = state === "paid" || state === "upgraded";

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className={`w-20 h-20 ${isPaid ? "bg-green-100" : "bg-amber-100"} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {isPaid
            ? <CheckCircle className="w-12 h-12 text-green-600" />
            : <AlertTriangle className="w-12 h-12 text-amber-500" />}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {state === "paid" && "Payment Received!"}
          {state === "upgraded" && "Plan Upgraded!"}
          {state === "processing" && "Payment Processing"}
          {state === "unknown" && "Checkout Status Unclear"}
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          {state === "paid" && "Thank you for your payment. Your business listing has been submitted and is now pending admin approval."}
          {state === "upgraded" && "Thank you for your payment. Your listing's new plan is now active."}
          {state === "processing" && "Your checkout completed and the payment is being processed. You'll receive a confirmation email shortly."}
          {state === "unknown" && "We couldn't confirm this payment. If you completed checkout, you'll receive a confirmation email. Otherwise, please contact us."}
        </p>

        {state === "paid" && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-cyan-900">
              <strong>What's Next?</strong><br />
              Our team will review your listing within 24-48 hours. You'll receive an email once your business is approved and live on the site.
            </p>
          </div>
        )}

        {state === "unknown" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-900">
              Questions? Email <a className="underline" href="mailto:office@lbadirectory.com">office@lbadirectory.com</a> or call <a className="underline" href="tel:732-600-1260">732-600-1260</a>.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700">
            <Link to={createPageUrl("UserDashboard")}>
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to={createPageUrl("Home")}>
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
