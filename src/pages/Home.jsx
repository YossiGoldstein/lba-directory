import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { 
  Search, MapPin, TrendingUp, Users, Shield, 
  ShoppingCart, Shirt, Briefcase, Home as HomeIcon, 
  Car, PartyPopper, GraduationCap, 
  HandHeart, ArrowRight, Heart, Menu, X, LogOut, LayoutDashboard, Mic, Gem
} from "lucide-react";
import SearchResultsPanel from "../components/home/SearchResultsPanel";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [agentResponse, setAgentResponse] = useState("");
  const [matchedBusinesses, setMatchedBusinesses] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const bizList = await base44.entities.Business.list();
        const approved = bizList.filter(b => b.status === "approved");
        console.log("✅ Loaded businesses:", approved.length);
        setAllBusinesses(approved);
      } catch (error) {
        console.error("❌ Failed to load businesses:", error);
      }
    };
    loadBusinesses();
  }, []);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    console.log("🔍 Starting search for:", searchQuery);
    setIsSearching(true);
    setSearchResults(null);
    setAgentResponse("");
    setMatchedBusinesses([]);

    let searchCompleted = false;

    try {
      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: "Home Page Search",
          description: "Search from home page",
          context: "home_page_search"
        }
      });

      console.log("✅ Conversation created:", conv.id);
      setConversation(conv);

      // Subscribe first before adding message
      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          console.log("📨 Received update from agent:", data);
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant" && lastMessage.content) {
            console.log("🤖 Assistant response:", lastMessage.content);
            searchCompleted = true;
            setAgentResponse(lastMessage.content);
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content);
            console.log("🏢 Extracted businesses:", extractedBusinesses.length);
            setMatchedBusinesses(extractedBusinesses);
            
            setSearchResults({
              response: lastMessage.content,
              businesses: extractedBusinesses
            });
            
            setIsSearching(false);
          }
        }
      );

      // Now send the message - pass the full conversation object
      await base44.agents.addMessage(conv, {
        role: "user",
        content: searchQuery
      });

      console.log("✅ Message sent to agent");

      setTimeout(() => {
        console.log("⏱️ Timeout reached, unsubscribing");
        unsubscribe();
        if (!searchCompleted) {
          console.log("⚠️ Still searching after timeout");
          setIsSearching(false);
          setAgentResponse("Search timed out. Please try again.");
        }
      }, 30000);

    } catch (error) {
      console.error("❌ Search failed:", error);
      setIsSearching(false);
      setAgentResponse("Sorry, I encountered an error while searching. Please try again.");
    }
  };

  const extractBusinessesFromResponse = (responseText) => {
    console.log("🔎 Extracting businesses from response...");
    console.log("Total businesses available:", allBusinesses.length);
    console.log("Response text:", responseText);
    
    const businesses = [];
    const responseLower = responseText.toLowerCase();

    allBusinesses.forEach(business => {
      const businessName = (business.business_name || "").toLowerCase().trim();
      // Also try without HTML entities
      const cleanName = businessName.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
      
      if (businessName && (responseLower.includes(businessName) || responseLower.includes(cleanName))) {
        businesses.push(business);
        console.log("✓ Found match:", business.business_name);
      } else {
        // Try partial match - if business name has multiple words, check if most words appear
        const words = cleanName.split(/\s+/).filter(w => w.length > 3);
        if (words.length >= 2) {
          const matchedWords = words.filter(word => responseLower.includes(word));
          if (matchedWords.length >= Math.ceil(words.length * 0.7)) {
            businesses.push(business);
            console.log("✓ Found partial match:", business.business_name);
          }
        }
      }
    });

    const result = businesses.slice(0, 6);
    console.log("✅ Final extracted businesses:", result.length);
    return result;
  };

  const handleContinueInChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  const categories = [
    { id: 1, name: "Food", slug: "food", imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/f970f0592_goods.png", whiteFilter: true },
    { id: 2, name: "Apparel", slug: "apparel", icon: Shirt },
    { id: 3, name: "Services", slug: "services", icon: Briefcase },
    { id: 4, name: "Home", slug: "home", icon: HomeIcon },
    { id: 5, name: "Auto", slug: "auto", icon: Car },
    { id: 6, name: "Judaica", slug: "judaica", imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/216b6efaa_shield.png", whiteFilter: true },
    { id: 7, name: "Beauty", slug: "beauty", imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/c53f7c7dd_makeup.png", whiteFilter: true },
    { id: 8, name: "Fun", slug: "fun", icon: PartyPopper },
    { id: 9, name: "Education", slug: "education", icon: GraduationCap },
    { id: 10, name: "Org./Gmach", slug: "org-gmach", icon: HandHeart },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Integrated Menu */}
      <section className="relative min-h-[75vh] sm:min-h-[90vh] flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/f7a399264_WhatsAppImage2026-01-07at104403AM.jpeg" 
            alt="Local businesses" 
            className="w-full h-full object-cover object-center filter brightness-[0.4] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-cyan-800/55 to-blue-900/60"></div>
        </div>

        {/* Navigation Menu on Image */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 py-4">
              <div className="w-48"></div>

              <nav className="hidden md:flex items-center gap-8">
                <Link to={createPageUrl("Home")} className="text-white hover:text-cyan-200 transition-colors font-medium">
                  Home
                </Link>
                <Link to={createPageUrl("AboutUs")} className="text-white hover:text-cyan-200 transition-colors font-medium">
                  About
                </Link>
                <Link to={createPageUrl("FAQ")} className="text-white hover:text-cyan-200 transition-colors font-medium">
                  FAQ
                </Link>
                <button 
                  onClick={() => {
                    if (user) {
                      window.location.href = createPageUrl("AddBusiness");
                    } else {
                      window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(createPageUrl("AddBusiness"));
                    }
                  }} 
                  className="text-white hover:text-cyan-200 transition-colors font-medium"
                >
                  Add Business
                </button>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white">Hello, {user.full_name}</span>
                    <Button variant="ghost" size="sm" asChild className="text-white hover:text-cyan-200 hover:bg-white/10">
                      <Link to={createPageUrl("UserDashboard")}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-cyan-200 hover:bg-white/10">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
                      <Link to={createPageUrl("SignIn")}>Sign In</Link>
                    </Button>
                    <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                      <Link to={createPageUrl("UserRegister")}>Register</Link>
                    </Button>
                  </>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:text-cyan-200"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden py-4 bg-black/30 backdrop-blur-sm rounded-lg">
                <nav className="flex flex-col gap-4 px-4">
                  <Link to={createPageUrl("Home")} className="text-white hover:text-cyan-200 font-medium">
                    Home
                  </Link>
                  <Link to={createPageUrl("AboutUs")} className="text-white hover:text-cyan-200 font-medium">
                    About
                  </Link>
                  <Link to={createPageUrl("FAQ")} className="text-white hover:text-cyan-200 font-medium">
                    FAQ
                  </Link>
                  <button 
                    onClick={() => {
                      if (user) {
                        window.location.href = createPageUrl("AddBusiness");
                      } else {
                        window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(createPageUrl("AddBusiness"));
                      }
                    }} 
                    className="text-white hover:text-cyan-200 font-medium text-left"
                  >
                    Add Business
                  </button>
                  {user ? (
                    <div className="border-t border-white/20 pt-4 mt-2 flex flex-col gap-3">
                      <button 
                        onClick={() => window.location.href = createPageUrl("UserDashboard")}
                        className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors border border-white/40"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors border border-white/40"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 border-t border-white/20 pt-4 mt-2">
                      <button 
                        onClick={() => window.location.href = createPageUrl("SignIn")}
                        className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors shadow-md"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => window.location.href = createPageUrl("UserRegister")}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors shadow-md"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Logo - With space below */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png"
            alt="LBA Directory"
            className="h-12 sm:h-16 md:h-20 w-auto drop-shadow-2xl brightness-0 invert"
          />
        </div>

        {/* Main Content - With more padding-top for logo space */}
        <div className="relative z-10 flex-1 flex items-center justify-center pt-28 sm:pt-0">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-12">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-white drop-shadow-2xl mb-6">
              Lakewood Business Alliance
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-white mb-10 font-light">
              AI powered directory for easy searching, connecting, and following
            </p>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-10 px-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-full shadow-2xl overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center sm:gap-3 sm:p-3">
                <div className="flex items-center flex-1 px-4 py-4 sm:px-0 sm:py-0">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 ml-0 sm:ml-4 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by keyword or sentence"
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm sm:text-lg px-2 py-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                    onClick={() => {
                      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        const recognition = new SpeechRecognition();
                        recognition.lang = 'en-US';
                        recognition.onresult = (event) => {
                          setSearchQuery(event.results[0][0].transcript);
                        };
                        recognition.start();
                      }
                    }}
                  >
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 sm:px-10 py-4 sm:py-6 sm:rounded-full font-semibold shadow-lg text-sm sm:text-base w-full sm:w-auto rounded-none sm:rounded-full"
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

            </form>

            {/* Category Icons - Responsive: Grid on mobile, Single row on desktop */}
            <div className="grid grid-cols-5 gap-3 sm:gap-4 justify-items-center md:flex md:justify-center md:items-center md:gap-6 lg:gap-8 px-2 md:px-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.id}
                    to={createPageUrl(`CategoryListing?slug=${category.slug}`)}
                    className="flex flex-col items-center gap-1 sm:gap-2 group"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-cyan-400/60 bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-300 transition-all duration-300 group-hover:scale-110">
                      {category.imageUrl ? (
                        <img 
                          src={category.imageUrl} 
                          alt={category.name} 
                          className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 object-contain"
                          style={{
                            ...(category.whiteFilter ? { filter: 'brightness(0) invert(1)' } : {}),
                            ...(category.scale ? { transform: `scale(${category.scale})` } : {})
                          }}
                        />
                      ) : (
                        <IconComponent className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 text-white" strokeWidth={1.5} />
                      )}
                    </div>
                    <span className="text-white text-[10px] sm:text-xs md:text-sm font-medium text-center">{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {(isSearching || searchResults) && (
        <SearchResultsPanel
          agentResponse={agentResponse}
          businesses={matchedBusinesses}
          onContinueInChat={handleContinueInChat}
          isLoading={isSearching}
        />
      )}

      {/* Blue Banner */}
      <section className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-tight">
            Bringing all Lakewood's Business Information to one place
          </h2>
        </div>
      </section>

      {/* Shopper & Business Sections - Side by Side */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10">
            Ready to save time and money?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* For Shoppers */}
            <div className="text-white p-8 bg-white/10 rounded-xl backdrop-blur-sm flex flex-col items-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center">For Consumers</h3>
              <ul className="space-y-2 mb-6 text-left w-full max-w-md">
                <li className="text-lg sm:text-xl flex items-center gap-2">
                  <span>•</span>
                  <span>Find what you're looking for</span>
                </li>
                <li className="text-lg sm:text-xl flex items-center gap-2">
                  <span>•</span>
                  <span>Follow what you need</span>
                </li>
                <li className="text-lg sm:text-xl flex items-center gap-2">
                  <span>•</span>
                  <span>Save on what you get</span>
                </li>
                <li className="text-lg sm:text-xl flex items-center gap-2">
                  <span>•</span>
                  <Link to={createPageUrl("AboutUs")} className="hover:underline">Learn More...</Link>
                </li>
              </ul>
              <Button 
                size="lg"
                className="bg-cyan-400 hover:bg-cyan-500 text-white font-bold shadow-lg text-base"
                asChild
              >
                <Link to={createPageUrl("UserRegister")}>
                  Create a free account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* For Business Owners */}
            <div className="text-white p-8 bg-white/10 rounded-xl backdrop-blur-sm flex flex-col items-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center">For Businesses</h3>
              <ul className="space-y-2 mb-6 text-left w-full max-w-md">
                <li className="text-lg sm:text-xl flex items-center gap-2">
                  <span>•</span>
                  <span>Be visible</span>
                </li>
                <li className="text-lg sm:text-xl flex items-center gap-2">
                  <span>•</span>
                  <span>Attract customers</span>
                </li>
                <li className="text-lg sm:text-xl flex items-center gap-2">
                  <span>•</span>
                  <span>Promote deals</span>
                </li>
                <li className="text-lg sm:text-xl flex items-center gap-2">
                  <span>•</span>
                  <Link to={createPageUrl("BusinessJoin")} className="hover:underline">Learn More...</Link>
                </li>
              </ul>
              <Button 
                size="lg"
                onClick={async () => {
                  const isAuth = await base44.auth.isAuthenticated();
                  if (isAuth) {
                    window.location.href = createPageUrl("AddBusiness");
                  } else {
                    window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(createPageUrl("AddBusiness"));
                  }
                }}
                className="bg-cyan-400 hover:bg-cyan-500 text-white font-bold shadow-lg text-base"
              >
                Add a business
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Community */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Trusted by your community
          </h2>
          
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10 text-base sm:text-lg text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-cyan-600 font-bold">✓</span> Free Basic Listings
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-600 font-bold">✓</span> Verified Reviews
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-600 font-bold">✓</span> Local Businesses
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-600 font-bold">✓</span> Deals you're looking for
            </div>
          </div>

          <p className="text-gray-500 text-sm sm:text-base">
            Serving Lakewood, Toms River, Jackson, Brick, Howell, Manchester
          </p>
        </div>
      </section>
    </div>
  );
}