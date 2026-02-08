import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, Mail, Phone, MessageSquare } from "lucide-react";
import ChatButton from "./components/chat/ChatButton";


export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for customer/business session in localStorage
        const customerData = localStorage.getItem("lba_customer");
        if (customerData) {
          const customer = JSON.parse(customerData);
          setUser({
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            role: customer.role || "user"
          });
          return;
        }

        // No session found
        setUser(null);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const noHeaderFooterPages = ["Login", "Register", "ForgotPassword"];
  const noHeaderPages = ["Home"];
  const showHeaderFooter = !noHeaderFooterPages.includes(currentPageName);
  const showHeader = !noHeaderPages.includes(currentPageName);

  // Prepare page context for chat
  const getPageContext = () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      page: currentPageName,
      categorySlug: urlParams.get("slug"),
      categoryName: urlParams.get("categoryName"),
      businessId: urlParams.get("id"),
      businessName: urlParams.get("businessName"),
    };
  };



  const handleLogout = () => {
    // Clear customer session
    localStorage.removeItem("lba_customer");
    // Reload to home page
    window.location.href = createPageUrl("Home");
  };

  if (!showHeaderFooter) {
    return (
      <div className="min-h-screen bg-blue-50">
        {children}
        <ChatButton pageContext={getPageContext()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 relative">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png"
                  alt="LBA Directory"
                  className="h-12 w-auto"
                />
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link to={createPageUrl("Home")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium text-lg">
                  Home
                </Link>
                <Link to={createPageUrl("AboutUs")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium text-lg">
                  About
                </Link>
                <Link to={createPageUrl("FAQ")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium text-lg">
                  FAQ
                </Link>
                <button 
                  onClick={() => {
                    const customerData = localStorage.getItem("lba_customer");
                    if (customerData) {
                      window.location.href = createPageUrl("AddBusiness");
                    } else {
                      window.location.href = createPageUrl("BusinessOwnerRegister");
                    }
                  }} 
                  className="text-gray-700 hover:text-cyan-600 transition-colors font-medium text-lg"
                >
                  Add Business
                </button>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">Hello, {user.full_name}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={createPageUrl(
                        user.role === "admin" ? "AdminDashboard" : 
                        user.role === "business_owner" ? "BusinessDashboard" : 
                        "UserDashboard"
                      )}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button asChild className="bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:from-[#1FAF5A] hover:to-[#27C666] text-white shadow-lg">
                      <Link to={createPageUrl("SignIn")}>Sign In</Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-[#0E8DAA] to-[#0C7B95] hover:from-[#0C7B95] hover:to-[#0E8DAA] text-white shadow-lg">
                      <Link to={createPageUrl("UserRegister")}>Register</Link>
                    </Button>
                  </>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 z-50 relative"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              </div>

              {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-[#005580] bg-[#003D5C] absolute left-0 right-0 top-16 z-40 shadow-lg">
                <nav className="flex flex-col gap-4 px-4">
                  <Link to={createPageUrl("Home")} className="text-white hover:text-green-400 font-medium text-lg">
                    Home
                  </Link>
                  <Link to={createPageUrl("AboutUs")} className="text-white hover:text-green-400 font-medium text-lg">
                    About
                  </Link>
                  <Link to={createPageUrl("FAQ")} className="text-white hover:text-green-400 font-medium text-lg">
                    FAQ
                  </Link>
                  <button 
                    onClick={async () => {
                      const customerData = localStorage.getItem("lba_customer");
                      const isAuth = customerData || await base44.auth.isAuthenticated();
                      if (isAuth) {
                        window.location.href = createPageUrl("AddBusiness");
                      } else {
                        window.location.href = createPageUrl("BusinessOwnerRegister");
                      }
                    }} 
                    className="text-white hover:text-green-400 font-medium text-lg text-left"
                  >
                    Add Business
                  </button>
                  {user ? (
                    <div className="border-t border-[#005580] pt-4 mt-2 flex flex-col gap-3">
                      <Button variant="outline" asChild className="w-full bg-[#005580] text-white border-[#006699] hover:bg-[#004466]">
                        <Link to={createPageUrl(
                          user.role === "admin" ? "AdminDashboard" : 
                          user.role === "business_owner" ? "BusinessDashboard" : 
                          "UserDashboard"
                        )}>Dashboard</Link>
                      </Button>
                      <Button variant="outline" onClick={handleLogout} className="w-full bg-[#005580] text-white border-[#006699] hover:bg-[#004466]">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 border-t border-[#005580] pt-4 mt-2">
                      <Button asChild className="w-full bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:from-[#1FAF5A] hover:to-[#27C666] text-white font-medium shadow-lg">
                        <Link to={createPageUrl("SignIn")} className="text-white">Sign In</Link>
                      </Button>
                      <Button asChild className="w-full bg-gradient-to-r from-[#0E8DAA] to-[#0C7B95] hover:from-[#0C7B95] hover:to-[#0E8DAA] text-white font-medium shadow-lg">
                        <Link to={createPageUrl("UserRegister")} className="text-white">Register</Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </div>
              )}
          </div>
        </header>
      )}

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Column 1 - Branding */}
            <div>
              <Link to={createPageUrl("Home")} className="flex items-center gap-2 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png"
                  alt="LBA Directory"
                  className="h-10 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-sm text-gray-400 mb-2">
                Powered by LBA Leagues & TIG Solutions
              </p>
              <p className="text-sm text-gray-400">
                Serving Lakewood, Toms River, Jackson, Brick, Howell, Manchester
              </p>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={createPageUrl("Home")} className="text-sm hover:text-cyan-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("AboutUs")} className="text-sm hover:text-cyan-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Contact")} className="text-sm hover:text-cyan-400 transition-colors">
                    Contact Us
                  </Link>
                  </li>
                  <li>
                  <button 
                    onClick={() => {
                      const customerData = localStorage.getItem("lba_customer");
                      if (customerData) {
                        window.location.href = createPageUrl("AddBusiness");
                      } else {
                        window.location.href = createPageUrl("BusinessOwnerRegister");
                      }
                    }}
                    className="text-sm hover:text-cyan-400 transition-colors text-left"
                  >
                    Add a Business
                  </button>
                  </li>
                  <li>
                  <Link to={createPageUrl("BusinessJoin")} className="text-sm hover:text-cyan-400 transition-colors">
                    For Business Owners
                  </Link>
                  </li>
                  <li>
                  <Link to={createPageUrl("TermsOfUse")} className="text-sm hover:text-cyan-400 transition-colors">
                    Terms of Use
                  </Link>
                  </li>
                  <li>
                  <Link to={createPageUrl("PrivacyPolicy")} className="text-sm hover:text-cyan-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:office@lbadirectory.com" 
                    className="text-sm hover:text-cyan-400 transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    office@lbadirectory.com
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:732-600-1260" 
                    className="text-sm hover:text-cyan-400 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    732-600-1260
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/17326001260" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-cyan-400 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    732-600-1260
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-sm text-gray-400 mb-2">
              © {new Date().getFullYear()} LBA Directory. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Designed for the Lakewood community.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Assistant with Page Context */}
      <ChatButton pageContext={getPageContext()} />
    </div>
  );
}