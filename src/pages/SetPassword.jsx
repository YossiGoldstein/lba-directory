import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function SetPassword() {
  const [email, setEmail] = useState("");
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadAccountInfo = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const bid = urlParams.get("bid");
      // Legacy support: email param
      const emailParam = urlParams.get("email");

      try {
        // --- Token-based flow ---
        if (token && bid) {
          let decoded;
          try {
            decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
          } catch {
            toast.error("Invalid or malformed claim link.");
            setLoading(false);
            return;
          }

          const parts = decoded.split(':');
          if (parts.length < 3) {
            toast.error("Invalid claim link.");
            setLoading(false);
            return;
          }

          const tokenExpiry = parseInt(parts[2], 10);
          if (Date.now() > tokenExpiry) {
            toast.error("This claim link has expired. Please request a new one from admin.");
            setLoading(false);
            return;
          }

          const tokenBusinessId = parts[0];
          const tokenEmail = parts[1];

          if (tokenBusinessId !== bid) {
            toast.error("Invalid claim link.");
            setLoading(false);
            return;
          }

          setEmail(tokenEmail);

          const businesses = await base44.entities.Business.filter({ id: bid });
          const business = businesses[0];

          if (!business) {
            toast.error("Business not found.");
            setLoading(false);
            return;
          }

          setAccountInfo({
            name: business.business_name,
            email: business.email,
            hasPassword: !!business.password_hash,
            type: "business",
            businessId: business.id
          });
          setLoading(false);
          return;
        }

        // --- Legacy email-only flow ---
        if (emailParam) {
          const normalizedParam = emailParam.toLowerCase().trim();
          setEmail(normalizedParam);
          const businesses = await base44.entities.Business.filter({ email: normalizedParam });
          const business = businesses[0];
          if (business) {
            setAccountInfo({ name: business.business_name, email: business.email, hasPassword: !!business.password_hash, type: "business", businessId: business.id });
            setLoading(false);
            return;
          }
          const customerResults = await base44.entities.Customer.filter({ email: normalizedParam });
          const customer = customerResults[0];
          if (customer) {
            setAccountInfo({ name: customer.full_name, email: customer.email, hasPassword: !!customer.password_hash, type: "customer" });
            setLoading(false);
            return;
          }
          toast.error("Account not found");
          setLoading(false);
          return;
        }

        toast.error("Invalid link");
        setLoading(false);
      } catch (error) {
        console.error("Failed to load account info:", error);
        toast.error("Failed to load account details");
        setLoading(false);
      }
    };

    loadAccountInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const response = await base44.functions.invoke('updatePassword', {
        email: email,
        password: formData.password
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success(accountInfo.hasPassword ? "Password reset successfully!" : "Password set successfully!");

        setTimeout(() => {
          window.location.href = createPageUrl("SignIn");
        }, 2000);
      } else {
        toast.error(response.data.error || "Failed to update password");
        setSaving(false);
      }
    } catch (error) {
      console.error("Failed to set password:", error);
      toast.error("Failed to set password. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accountInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Account not found or invalid link</p>
            <Button asChild>
              <Link to={createPageUrl("Home")}>Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {accountInfo?.hasPassword ? "Password Reset Successfully!" : "Password Set Successfully!"}
            </h2>
            <p className="text-gray-600 mb-4">You can now sign in with your email and new password</p>
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
              <Link to={createPageUrl("SignIn")}>Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-bold text-center">
              {accountInfo.hasPassword ? "Reset Your Password" : "Set Your Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {accountInfo.hasPassword 
                ? `Create a new password for ${accountInfo.name}` 
                : `Create a password for ${accountInfo.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Account:</strong> {accountInfo.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> {accountInfo.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                disabled={saving}
              >
                {saving 
                  ? (accountInfo.hasPassword ? "Resetting Password..." : "Setting Password...") 
                  : (accountInfo.hasPassword ? "Reset Password" : "Set Password")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}