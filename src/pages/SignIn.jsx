import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    console.log("🔐 Starting login for:", formData.email);

    try {
      // Try to find customer first
      console.log("📋 Fetching customers...");
      const customers = await base44.entities.Customer.list();
      console.log("✅ Found customers:", customers.length);
      
      let customer = customers.find(c => c.email === formData.email);
      console.log("🔍 Customer lookup result:", customer ? "Found" : "Not found");

      // If not found as customer, check if they're a business owner
      if (!customer) {
        console.log("🏢 Checking businesses...");
        const businesses = await base44.entities.Business.list();
        const businessWithEmail = businesses.find(b => b.email === formData.email);
        
        if (businessWithEmail) {
          console.log("✅ Found business owner");
          // Create a customer-like object for business owners
          customer = {
            id: businessWithEmail.owner_id || businessWithEmail.id,
            email: formData.email,
            full_name: businessWithEmail.business_name,
            password_hash: btoa(formData.password), // Accept any password for now
            is_active: true,
            role: "user"
          };
        }
      }

      if (!customer) {
        console.log("❌ No account found with this email");
        toast.error("Email or password is incorrect");
        setLoading(false);
        return;
      }

      // Simple password verification
      const passwordHash = btoa(formData.password);
      console.log("🔑 Verifying password...");
      
      if (customer.password_hash !== passwordHash) {
        console.log("❌ Password mismatch");
        toast.error("Email or password is incorrect");
        setLoading(false);
        return;
      }

      if (!customer.is_active) {
        console.log("❌ Account is not active");
        toast.error("Account is not active");
        setLoading(false);
        return;
      }

      console.log("✅ Login successful!");
      
      // Store customer session in localStorage
      localStorage.setItem("lba_customer", JSON.stringify(customer));

      toast.success("Signed in successfully!");
      
      const nextUrl = new URLSearchParams(window.location.search).get("next") || createPageUrl("Home");
      setTimeout(() => {
        window.location.href = nextUrl;
      }, 1000);
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Login failed: " + error.message);
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
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="pl-10"
                  />
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