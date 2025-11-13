import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, ChevronDown, User, Heart, Star, LogOut, 
  LayoutDashboard, Building2, Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";

export default function Header({ user, categories }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BusinessHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Home")} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            
            <Link to={createPageUrl("AboutUs")} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Categories <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.slice(0, 8).map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link to={createPageUrl(`CategoryListing?slug=${category.slug}`)}>
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Home")} className="text-blue-600 font-medium">
                    View All Categories
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to={createPageUrl("AddBusiness")} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Add Business
            </Link>

            <Link to={createPageUrl("Contact")} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Right Side - Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.full_name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("UserDashboard")} className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.is_business_owner && (
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("BusinessDashboard")} className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Business Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("UserDashboard")} className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      My Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("UserDashboard")} className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      My Reviews
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to={createPageUrl("Login")}>Login</Link>
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to={createPageUrl("Register")}>Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <Link to={createPageUrl("Home")} className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link to={createPageUrl("AboutUs")} className="text-gray-700 hover:text-blue-600 font-medium">
                About
              </Link>
              <Link to={createPageUrl("AddBusiness")} className="text-gray-700 hover:text-blue-600 font-medium">
                Add Business
              </Link>
              <Link to={createPageUrl("Contact")} className="text-gray-700 hover:text-blue-600 font-medium">
                Contact
              </Link>
              
              {user ? (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <Link to={createPageUrl("UserDashboard")} className="text-gray-700 hover:text-blue-600 font-medium block mb-3">
                      My Dashboard
                    </Link>
                    {user.is_business_owner && (
                      <Link to={createPageUrl("BusinessDashboard")} className="text-gray-700 hover:text-blue-600 font-medium block mb-3">
                        Business Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 mt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link to={createPageUrl("Login")}>Login</Link>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full" asChild>
                    <Link to={createPageUrl("Register")}>Register</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}