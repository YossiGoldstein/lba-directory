import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = () => {
      const customerData = localStorage.getItem("lba_customer");
      if (customerData) {
        const customer = JSON.parse(customerData);
        const dashboardUrl = customer.role === "admin" ? "AdminDashboard" :
                            customer.role === "business_owner" ? "BusinessDashboard" :
                            "UserDashboard";
        window.location.href = createPageUrl(dashboardUrl);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    if (loading) return; // Prevent double submission

    setLoading(true);
    console.log("🔐 Starting login for:", formData.email);

    try {
      // Check if user is admin (Base44 User entity)
      try {
        const users = await base44.entities.User.list();
        const adminUser = users.find(u => u.email === formData.email && u.role === 'admin');
        
        if (adminUser) {
          // Admin login via Base44 authentication
          localStorage.setItem("lba_customer", JSON.stringify({
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            role: "admin",
            is_active: true
          }));

          toast.success("Welcome Admin!");
          
          const nextUrl = new URLSearchParams(window.location.search).get("next") || createPageUrl("AdminDashboard");
          setTimeout(() => {
            window.location.href = nextUrl;
          }, 1000);
          return;
        }
      } catch (adminError) {
        console.log("Not an admin user, checking business/customer");
      }

      // Check Customer entity first
      const customers = await base44.entities.Customer.list();
      const customer = customers.find(c => c.email === formData.email);

      if (customer) {
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

        localStorage.setItem("lba_customer", JSON.stringify({
          ...customer,
          role: "user"
        }));

        toast.success("Welcome back!");
        const nextUrl = new URLSearchParams(window.location.search).get("next") || createPageUrl("UserDashboard");
        setTimeout(() => { window.location.href = nextUrl; }, 1000);
        return;
      }

      // Legacy fallback: business owner registered via old flow (Business entity as login)
      const businesses = await base44.entities.Business.list();
      const legacyOwner = businesses.find(b => b.email === formData.email && b.password_hash);

      if (legacyOwner) {
        const passwordHash = btoa(formData.password);
        
        if (legacyOwner.password_hash !== passwordHash) {
          toast.error("Email or password is incorrect");
          setLoading(false);
          return;
        }

        localStorage.setItem("lba_customer", JSON.stringify({
          id: legacyOwner.id,
          email: legacyOwner.email,
          full_name: legacyOwner.business_name,
          role: "business_owner",
          is_active: true
        }));

        toast.success("Welcome back!");
        const nextUrl = new URLSearchParams(window.location.search).get("next") || createPageUrl("UserDashboard");
        setTimeout(() => { window.location.href = nextUrl; }, 1000);
        return;
      }

      toast.error("Email or password is incorrect");
      setLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <Toaster />
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