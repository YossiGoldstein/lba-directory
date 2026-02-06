import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    console.log("🔐 Starting login for:", formData.email);

    try {
      // Check if user is a business owner
      const businesses = await base44.entities.Business.list();
      const businessOwner = businesses.find(b => b.email === formData.email);

      if (businessOwner) {
        // Business owner login
        const passwordHash = btoa(formData.password);
        
        if (!businessOwner.password_hash) {
          toast.error("Please complete your registration first");
          setLoading(false);
          return;
        }
        
        if (businessOwner.password_hash !== passwordHash) {
          toast.error("Email or password is incorrect");
          setLoading(false);
          return;
        }

        // Store business owner session
        localStorage.setItem("lba_customer", JSON.stringify({
          id: businessOwner.id,
          email: businessOwner.email,
          full_name: businessOwner.business_name,
          role: "business_owner",
          is_active: true
        }));

        toast.success("Welcome back!");
        
        const nextUrl = new URLSearchParams(window.location.search).get("next") || createPageUrl("BusinessDashboard");
        setTimeout(() => {
          window.location.href = nextUrl;
        }, 1000);
        return;
      }

      // Regular customer login
      const customers = await base44.entities.Customer.list();
      const customer = customers.find(c => c.email === formData.email);

      if (!customer) {
        toast.error("Email or password is incorrect");
        setLoading(false);
        return;
      }

      const passwordHash = btoa(formData.password);
      
      if (customer.password_hash !== passwordHash) {
        toast.error("Email or password is incorrect");
        setLoading(false);
        return;
      }

      if (!customer.is_active) {
        toast.error("Account is not active");
        setLoading(false);
        return;
      }

      // Store customer session
      localStorage.setItem("lba_customer", JSON.stringify({
        ...customer,
        role: "user"
      }));

      toast.success("Signed in successfully!");
      
      const nextUrl = new URLSearchParams(window.location.search).get("next") || createPageUrl("Home");
      setTimeout(() => {
        window.location.href = nextUrl;
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
              </div>

              <div className="flex items-center justify-end text-sm">
                <Link to={createPageUrl("ForgotPassword")} className="text-cyan-600 hover:text-cyan-700">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to={createPageUrl("UserRegister")}>Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link 
            to={createPageUrl("Home")} 
            className="text-sm text-cyan-600 hover:text-cyan-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}