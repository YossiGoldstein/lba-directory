import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Mail, Lock, Phone, Building2, Eye, EyeOff } from "lucide-react";

export default function BusinessOwnerRegister() {
  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const customerData = localStorage.getItem("lba_customer");
    if (!customerData) {
      window.location.href =
        createPageUrl("SignIn") +
        "?next=" +
        encodeURIComponent(createPageUrl("BusinessOwnerRegister"));
      return;
    }
    setAuthChecked(true);
  }, []);

  if (!authChecked) return null;

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

    setLoading(true);

    try {
      // Check if email already exists
      const existingCustomers = await base44.entities.Customer.filter({ email: formData.email });

      if (existingCustomers.length > 0) {
        toast.error("This email is already registered");
        setLoading(false);
        return;
      }

      // Hash password
      const passwordHash = btoa(formData.password);

      // Create customer account (owner_id will link to businesses)
      const newCustomer = await base44.entities.Customer.create({
        full_name: formData.businessName,
        email: formData.email,
        phone: formData.phone || "",
        password_hash: passwordHash,
        is_active: true
      });

      // Store session
      localStorage.setItem("lba_customer", JSON.stringify({
        id: newCustomer.id,
        email: newCustomer.email,
        full_name: newCustomer.full_name,
        role: "business_owner",
        is_active: true
      }));

      // Send welcome email
      try {
        await base44.integrations.Core.SendEmail({
          to: formData.email,
          subject: "Welcome to LBA Directory - Business Owner Account",
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0891b2;">Welcome to LBA Directory! 🎉</h2>
              
              <p>Thank you for creating a business owner account.</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Account Details:</h3>
                <p><strong>Business Name:</strong> ${formData.businessName}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Complete your business listing</li>
                <li>Add photos and details</li>
                <li>Wait for approval</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}${createPageUrl("AddBusiness")}" 
                   style="display: inline-block; background: #0891b2; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Complete Your Listing
                </a>
              </div>
              
              <p>Best regards,<br><strong>LBA Directory Team</strong></p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                📞 Contact: office@lbadirectory.com | 732-600-1260
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      toast.success("Account created successfully!");

      setTimeout(() => {
        window.location.href = createPageUrl("AddBusiness");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
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

        <div className="text-center mb-8">
          <Building2 className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Register Your Business
          </h1>
          <p className="text-gray-600">
            Create your business owner account
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Business Owner Account</CardTitle>
            <CardDescription className="text-center">
              Get your business listed on LBA Directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Your Business Name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

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
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Business Account"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to={createPageUrl("SignIn")}>Sign In</Link>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link 
                to={createPageUrl("UserRegister")} 
                className="text-sm text-cyan-600 hover:text-cyan-700"
              >
                Register as a customer instead →
              </Link>
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