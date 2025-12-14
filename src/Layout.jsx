import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, Mail, Phone } from "lucide-react";
import ChatButton from "./components/chat/ChatButton";


export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
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
    base44.auth.logout("/");
  };

  if (!showHeaderFooter) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
        <ChatButton pageContext={getPageContext()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/3a0b2e08d_LBA-directory-logo-color.png"
                  alt="LBA Directory"
                  className="h-12 w-auto"
                />
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link to={createPageUrl("Home")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                  Home
                </Link>
                <Link to={createPageUrl("AboutUs")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                  About
                </Link>
                <Link to={createPageUrl("FAQ")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                  FAQ
                </Link>
                <button 
                  onClick={async () => {
                    const isAuth = await base44.auth.isAuthenticated();
                    if (isAuth) {
                      window.location.href = createPageUrl("AddBusiness");
                    } else {
                      base44.auth.redirectToLogin(createPageUrl("AddBusiness"));
                    }
                  }} 
                  className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
                >
                  Add Business
                </button>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">שלום, {user.full_name}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={createPageUrl("UserDashboard")}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      יציאה
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
                      <Link to={createPageUrl("SignIn")}>התחברות</Link>
                    </Button>
                    <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                      <Link to={createPageUrl("SignUp")}>הרשמה</Link>
                    </Button>
                  </>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200">
                <nav className="flex flex-col gap-4">
                  <Link to={createPageUrl("Home")} className="text-gray-700 hover:text-cyan-600 font-medium">
                    Home
                  </Link>
                  <Link to={createPageUrl("AboutUs")} className="text-gray-700 hover:text-cyan-600 font-medium">
                    About
                  </Link>
                  <Link to={createPageUrl("FAQ")} className="text-gray-700 hover:text-cyan-600 font-medium">
                    FAQ
                  </Link>
                  <button 
                    onClick={async () => {
                      const isAuth = await base44.auth.isAuthenticated();
                      if (isAuth) {
                        window.location.href = createPageUrl("AddBusiness");
                      } else {
                        base44.auth.redirectToLogin(createPageUrl("AddBusiness"));
                      }
                    }} 
                    className="text-gray-700 hover:text-cyan-600 font-medium text-left"
                  >
                    Add Business
                  </button>
                  {user ? (
                    <div className="border-t border-gray-200 pt-4 mt-2 flex flex-col gap-3">
                      <Button variant="outline" asChild className="w-full">
                        <Link to={createPageUrl("UserDashboard")}>Dashboard</Link>
                      </Button>
                      <Button variant="outline" onClick={handleLogout} className="w-full">
                        יציאה
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 mt-2">
                      <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <Link to={createPageUrl("SignIn")}>התחברות</Link>
                      </Button>
                      <Button asChild className="bg-cyan-600 hover:bg-cyan-700 w-full">
                        <Link to={createPageUrl("SignUp")}>הרשמה</Link>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  <Link to={createPageUrl("AddBusiness")} className="text-sm hover:text-cyan-400 transition-colors">
                    Add Business – Free
                  </Link>
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