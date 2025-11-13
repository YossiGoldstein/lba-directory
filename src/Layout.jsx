import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const noHeaderFooterPages = ["Login", "Register", "ForgotPassword"];
  const showHeaderFooter = !noHeaderFooterPages.includes(currentPageName);

  if (!showHeaderFooter) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LBA Directory</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl("Home")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                Home
              </Link>
              <Link to={createPageUrl("AboutUs")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                About
              </Link>
              <Link to={createPageUrl("AddBusiness")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                Add Business
              </Link>
              <Link to={createPageUrl("Contact")} className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                Contact
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">Hello, {user.full_name}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={createPageUrl("UserDashboard")}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to={createPageUrl("Login")}>Login</Link>
                  </Button>
                  <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
                    <Link to={createPageUrl("Register")}>Register</Link>
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
                <Link to={createPageUrl("AddBusiness")} className="text-gray-700 hover:text-cyan-600 font-medium">
                  Add Business
                </Link>
                <Link to={createPageUrl("Contact")} className="text-gray-700 hover:text-cyan-600 font-medium">
                  Contact
                </Link>
                {user ? (
                  <div className="border-t border-gray-200 pt-4 mt-2 flex flex-col gap-3">
                    <Button variant="outline" asChild className="w-full">
                      <Link to={createPageUrl("UserDashboard")}>Dashboard</Link>
                    </Button>
                    <Button variant="outline" onClick={() => base44.auth.logout()} className="w-full">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 mt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link to={createPageUrl("Login")}>Login</Link>
                    </Button>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 w-full" asChild>
                      <Link to={createPageUrl("Register")}>Register</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link to={createPageUrl("Home")} className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">LBA Directory</span>
              </Link>
              <p className="text-sm text-gray-400">
                Your trusted business directory connecting customers with local businesses in Lakewood.
              </p>
            </div>

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
                  <Link to={createPageUrl("AddBusiness")} className="text-sm hover:text-cyan-400 transition-colors">
                    Add Business
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Contact")} className="text-sm hover:text-cyan-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={createPageUrl("PrivacyPolicy")} className="text-sm hover:text-cyan-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("TermsOfUse")} className="text-sm hover:text-cyan-400 transition-colors">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} LBA Directory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}