import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Mail, Lock, Phone } from "lucide-react";

export default function UserRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("הסיסמאות לא תואמות");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);

    try {
      // Here you would implement your custom user creation logic
      // For example, create a User entity with the registration details
      
      toast.success("נרשמת בהצלחה! כעת אתה יכול להתחבר");
      navigate(createPageUrl("SignIn"));
    } catch (error) {
      toast.error("שגיאה בהרשמה, נסה שוב");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
            <CardTitle className="text-2xl font-bold text-center">הרשמה</CardTitle>
            <CardDescription className="text-center">
              צור חשבון חדש ב-LBA Directory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">שם מלא</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="ישראל ישראלי"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">מספר טלפון (אופציונלי)</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="050-1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                disabled={loading}
              >
                {loading ? "נרשם..." : "הרשמה"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">כבר יש לך חשבון?</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to={createPageUrl("SignIn")}>התחברות</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link 
            to={createPageUrl("Home")} 
            className="text-sm text-cyan-600 hover:text-cyan-700"
          >
            ← חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}