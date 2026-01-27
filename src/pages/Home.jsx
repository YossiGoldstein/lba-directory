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
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bizList, catList] = await Promise.all([
          base44.entities.Business.list(),
          base44.entities.Category.list()
        ]);
        const approved = bizList.filter(b => b.status === "approved");
        console.log("✅ Loaded businesses:", approved.length);
        setAllBusinesses(approved);
        setCategories(catList.filter(c => c.is_active));
      } catch (error) {
        console.error("❌ Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for customer session first
        const customerData = localStorage.getItem("lba_customer");
        if (customerData) {
          const customer = JSON.parse(customerData);
          setUser({
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            role: "user"
          });
          return;
        }

        // Fallback to base44 auth
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

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(w => w.length > 2);

    // Detect if this is a natural language query that needs AI assistance
    const needsAI = 
      query.includes("looking for") ||
      query.includes("where can i") ||
      query.includes("open now") ||
      query.includes("available now") ||
      query.includes("best") ||
      query.includes("recommend") ||
      query.includes("suggest") ||
      query.includes("need") ||
      query.includes("want") ||
      query.includes("find me") ||
      query.includes("show me") ||
      query.startsWith("where") ||
      query.startsWith("when") ||
      query.startsWith("how") ||
      query.startsWith("why") ||
      query.startsWith("what") ||
      queryWords.length > 5; // Long queries are usually natural language

    // If it's a natural language query, go directly to AI
    if (needsAI) {
      console.log("🤖 Natural language query detected - using AI assistant");
      // Skip direct search, go to AI
    } else {
      // Step 1: Smart direct search for specific businesses/categories
      const directMatches = allBusinesses.filter(business => {
      const name = (business.business_name || "").toLowerCase();
      const slug = (business.slug || "").toLowerCase();
      const shortDesc = (business.short_description || "").toLowerCase();
      const longDesc = (business.long_description || "").toLowerCase();
      const tags = business.tags ? business.tags.map(t => t.toLowerCase()).join(" ") : "";

      // Get category name for this business
      const category = categories.find(c => c.id === business.category_id);
      const categoryName = category ? category.name.toLowerCase() : "";

      // All content combined
      const allContent = `${name} ${slug} ${shortDesc} ${longDesc} ${tags} ${categoryName}`;

      // Exact match in name - highest priority
      if (name === query || slug === query) return true;

      // Strong match: query is a complete word in the name
      const nameWords = name.split(/\s+/);
      if (nameWords.some(word => word === query)) return true;

      // Contains match in name or description
      if (query.length >= 3 && (name.includes(query) || shortDesc.includes(query) || longDesc.includes(query))) {
        return true;
      }

      // Tag exact match
      if (tags.includes(query)) return true;

      // Category match
      if (categoryName.includes(query)) return true;

      // Smart word matching - skip common words
      if (queryWords.length > 0) {
        const meaningfulWords = queryWords.filter(word => 
          !['looking', 'for', 'find', 'search', 'need', 'want', 'show', 'me', 'the', 'a', 'an'].includes(word)
        );
        
        if (meaningfulWords.length > 0) {
          const hasMatchingWords = meaningfulWords.some(word => allContent.includes(word));
          if (hasMatchingWords) return true;
        }
      }

        return false;
      });

      // If single exact match, navigate directly
      if (directMatches.length === 1) {
        const business = directMatches[0];
        console.log("✅ Single exact match found, navigating to:", business.business_name);
        window.location.href = createPageUrl(`BusinessListing?id=${business.id}`);
        return;
      }

      // If we have direct matches, show them
      if (directMatches.length > 0) {
        console.log("✅ Found", directMatches.length, "direct matches");
        setMatchedBusinesses(directMatches);
        setAgentResponse(`Found ${directMatches.length} business${directMatches.length !== 1 ? 'es' : ''} matching "${searchQuery}"`);
        setSearchResults({
          response: `Found ${directMatches.length} business${directMatches.length !== 1 ? 'es' : ''} matching "${searchQuery}"`,
          businesses: directMatches
        });
        setIsSearching(false);
        return;
      }
    }

    // Step 2: No direct matches OR natural language query - AI Assistant helps
    console.log(needsAI ? "🤖 Natural language query - using AI assistant" : "⚠️ No direct matches - activating AI assistant");
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

      // Send simple, direct query to agent
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
          setAgentResponse("The search took longer than expected. Please try rephrasing your search or browse our categories.");
          setSearchResults({
            response: "The search took longer than expected. Please try rephrasing your search or browse our categories.",
            businesses: []
          });
        }
      }, 30000);

    } catch (error) {
      console.error("❌ Search failed:", error);
      setIsSearching(false);
      setAgentResponse("I'm having trouble processing your search. Please try again or browse our categories below.");
      setSearchResults({
        response: "I'm having trouble processing your search. Please try again or browse our categories below.",
        businesses: []
      });
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
    localStorage.removeItem("lba_customer");
    window.location.href = createPageUrl("Home");
  };

  const categoryIcons = [
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
    <div className="min-h-screen bg-blue-50">
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
        <div className="relative z-[200] w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 py-4">
              <div className="w-48"></div>

              <nav className="hidden md:flex items-center gap-8">
                <Link to={createPageUrl("Home")} className="text-white hover:text-cyan-400 transition-colors font-medium text-lg">
                  Home
                </Link>
                <Link to={createPageUrl("AboutUs")} className="text-white hover:text-cyan-400 transition-colors font-medium text-lg">
                  About
                </Link>
                <Link to={createPageUrl("FAQ")} className="text-white hover:text-cyan-400 transition-colors font-medium text-lg">
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
                  className="text-white hover:text-cyan-400 transition-colors font-medium text-lg"
                >
                  Add Business
                </button>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-white">Hello, {user.full_name}</span>
                    <Button variant="ghost" size="sm" asChild className="text-white hover:text-cyan-200 hover:bg-white/10 text-lg">
                      <Link to={createPageUrl(user.role === "admin" ? "AdminDashboard" : "UserDashboard")}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-cyan-200 hover:bg-white/10 text-lg">
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
                className="md:hidden p-2 text-white hover:text-cyan-200 z-50 relative"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              </div>

              {mobileMenuOpen && (
              <div className="md:hidden py-4 bg-[#003D5C] backdrop-blur-md rounded-lg fixed left-4 right-4 top-20 z-[100] shadow-2xl max-w-md mx-auto">
                <nav className="flex flex-col gap-4 px-4">
                  <Link to={createPageUrl("Home")} className="text-white hover:text-green-400 font-medium">
                    Home
                  </Link>
                  <Link to={createPageUrl("AboutUs")} className="text-white hover:text-green-400 font-medium">
                    About
                  </Link>
                  <Link to={createPageUrl("FAQ")} className="text-white hover:text-green-400 font-medium">
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
                    className="text-white hover:text-green-400 font-medium text-left"
                  >
                    Add Business
                  </button>
                  {user ? (
                    <div className="border-t border-[#005580] pt-4 mt-2 flex flex-col gap-3">
                      <button 
                        onClick={() => window.location.href = createPageUrl(user.role === "admin" ? "AdminDashboard" : "UserDashboard")}
                        className="w-full bg-[#005580] hover:bg-[#004466] text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors border border-[#006699]"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full bg-[#005580] hover:bg-[#004466] text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors border border-[#006699]"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 border-t border-[#005580] pt-4 mt-2">
                      <button 
                        onClick={() => window.location.href = createPageUrl("SignIn")}
                        className="w-full bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:from-[#1FAF5A] hover:to-[#27C666] text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors shadow-lg"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => window.location.href = createPageUrl("UserRegister")}
                        className="w-full bg-gradient-to-r from-[#0E8DAA] to-[#0C7B95] hover:from-[#0C7B95] hover:to-[#0E8DAA] text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors shadow-lg"
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

        {/* Logo - Fixed positioning */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:left-6 z-10">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69160f6f331f1b03b4ecdf77/a009f9c3e_image0.png"
            alt="LBA Directory"
            className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto drop-shadow-2xl brightness-0 invert"
          />
        </div>

        {/* Main Content - Adjusted padding */}
        <div className="relative z-10 flex-1 flex items-center justify-center pt-16 sm:pt-20 md:pt-4 lg:pt-0">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 md:pb-10 lg:pb-12 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-extrabold text-white drop-shadow-2xl mb-3 sm:mb-4 md:mb-5 lg:mb-6 mt-2 sm:mt-0 text-center leading-tight">
              Lakewood Business Alliance
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mb-6 sm:mb-8 md:mb-10 font-light text-center">
              AI powered directory for easy searching, connecting, and following
            </p>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 px-2 w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-full shadow-2xl overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center sm:gap-2 md:gap-3 sm:p-2 md:p-3">
                <div className="flex items-center flex-1 px-4 py-3 sm:px-0 sm:py-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 ml-0 sm:ml-3 md:ml-4 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by keyword or sentence"
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm sm:text-base md:text-lg px-2 py-0"
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
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:from-[#1FAF5A] hover:to-[#27C666] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-6 sm:rounded-full font-semibold shadow-lg text-sm sm:text-base w-full sm:w-auto rounded-none sm:rounded-full"
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

            </form>

            {/* Category Icons - Responsive: Grid on mobile, Single row on desktop */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 justify-items-center lg:flex lg:justify-center lg:items-center lg:gap-6 xl:gap-8 px-2 sm:px-4">
              {categoryIcons.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.id}
                    to={createPageUrl(`CategoryListing?slug=${category.slug}`)}
                    className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 group"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-2 border-cyan-400/60 bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all duration-300 group-hover:scale-110">
                      {category.imageUrl ? (
                        <img 
                          src={category.imageUrl} 
                          alt={category.name} 
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 object-contain"
                          style={{
                            ...(category.whiteFilter ? { filter: 'brightness(0) invert(1)' } : {}),
                            ...(category.scale ? { transform: `scale(${category.scale})` } : {})
                          }}
                        />
                      ) : (
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 text-white" strokeWidth={1.5} />
                      )}
                    </div>
                    <span className="text-white text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-medium text-center leading-tight">{category.name}</span>
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
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-600 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight">
            Bringing all Lakewood's Business Information to one place
          </h2>
        </div>
      </section>

      {/* Shopper & Business Sections - Side by Side */}
      <section className="bg-gradient-to-r from-[#003D5C] to-[#002D45] py-8 sm:py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-6 sm:mb-8 md:mb-10">
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
                className="bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:from-[#1FAF5A] hover:to-[#27C666] text-white font-bold shadow-lg text-base"
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
                  const customerData = localStorage.getItem("lba_customer");
                  const isAuth = customerData || await base44.auth.isAuthenticated();
                  if (isAuth) {
                    window.location.href = createPageUrl("AddBusiness");
                  } else {
                    window.location.href = createPageUrl("SignIn") + "?next=" + encodeURIComponent(createPageUrl("AddBusiness"));
                  }
                }}
                className="bg-gradient-to-r from-[#27C666] to-[#1FAF5A] hover:from-[#1FAF5A] hover:to-[#27C666] text-white font-bold shadow-lg text-base"
              >
                Add a business
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Community */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
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