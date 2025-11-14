import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { 
  Search, MapPin, TrendingUp, Users, Star, 
  UtensilsCrossed, Shirt, Briefcase, Home as HomeIcon, 
  Car, Book, Sparkles, PartyPopper, GraduationCap, 
  HandHeart, ArrowRight, Heart
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

  useEffect(() => {
    // Load businesses for matching
    const loadBusinesses = async () => {
      try {
        const bizList = await base44.entities.Business.list();
        setAllBusinesses(bizList.filter(b => b.status === "approved"));
      } catch (error) {
        console.error("Failed to load businesses:", error);
      }
    };
    loadBusinesses();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults(null);
    setAgentResponse("");
    setMatchedBusinesses([]);

    try {
      // Create a temporary conversation with the agent
      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: "Home Page Search",
          description: "Search from home page",
          context: "home_page_search"
        }
      });

      setConversation(conv);

      // Send the search query to the agent
      await base44.agents.addMessage(conv, {
        role: "user",
        content: `Context: This is a search from the Home Page.\n\nUser search: ${searchQuery}`
      });

      // Subscribe to conversation updates
      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant") {
            // Extract the response
            setAgentResponse(lastMessage.content);
            
            // Try to extract business references from the response
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content);
            setMatchedBusinesses(extractedBusinesses);
            
            setSearchResults({
              response: lastMessage.content,
              businesses: extractedBusinesses
            });
            
            setIsSearching(false);
          }
        }
      );

      // Cleanup subscription after 30 seconds
      setTimeout(() => {
        unsubscribe();
      }, 30000);

    } catch (error) {
      console.error("Search failed:", error);
      setIsSearching(false);
      setAgentResponse("Sorry, I encountered an error while searching. Please try again.");
    }
  };

  const extractBusinessesFromResponse = (responseText) => {
    // Try to extract business names or IDs from the agent's response
    const businesses = [];
    const responseLines = responseText.toLowerCase();

    allBusinesses.forEach(business => {
      const businessName = (business.business_name || "").toLowerCase();
      if (businessName && responseLines.includes(businessName)) {
        businesses.push(business);
      }
    });

    // Limit to top 6 results
    return businesses.slice(0, 6);
  };

  const handleContinueInChat = () => {
    // Trigger the chat button to open with current conversation
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const categories = [
    { id: 1, name: "Food", slug: "food", icon: UtensilsCrossed },
    { id: 2, name: "Apparel", slug: "apparel", icon: Shirt },
    { id: 3, name: "Services", slug: "services", icon: Briefcase },
    { id: 4, name: "Home", slug: "home", icon: HomeIcon },
    { id: 5, name: "Auto", slug: "auto", icon: Car },
    { id: 6, name: "Judaica", slug: "judaica", icon: Book },
    { id: 7, name: "Beauty", slug: "beauty", icon: Sparkles },
    { id: 8, name: "Fun", slug: "fun", icon: PartyPopper },
    { id: 9, name: "Education", slug: "education", icon: GraduationCap },
    { id: 10, name: "Org./Gmach", slug: "org-gmach", icon: HandHeart },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=1920&h=1080&fit=crop" 
            alt="Local businesses" 
            className="w-full h-full object-cover filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-cyan-800/60 to-blue-900/70"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-2xl">
            Comprehensive business directory
          </h1>
          <p className="text-2xl md:text-3xl text-white mb-12 font-light">
            Your search starts (and ends) here
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-16">
            <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-2xl p-3 flex items-center gap-3">
              <Search className="w-6 h-6 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="Ask anything: 'kosher restaurant in Lakewood', 'plumber near me', etc."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-lg px-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                size="lg" 
                className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-10 py-6 rounded-full font-semibold shadow-lg"
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-white/80 text-sm mt-4">
              🤖 Powered by AI - Ask in English or Hebrew, and get smart results!
            </p>
          </form>

          {/* Category Icons */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={createPageUrl(`CategoryListing?slug=${category.slug}`)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-20 h-20 rounded-full border-3 border-white/80 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                    <IconComponent className="w-9 h-9 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-white text-sm font-medium">{category.name}</span>
                </Link>
              );
            })}
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

      {/* About LBA Directory Teaser */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            About LBA Directory
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8">
            <p className="mb-4">
              Lakewood is growing fast — and with thousands of businesses, finding what you need can be overwhelming. LBA Directory is your AI-powered shopping assistant, built for the Lakewood community.
            </p>
            <p className="mb-4">
              Just ask in your own words — <span className="italic text-cyan-700">"dairy restaurant open now,"</span> <span className="italic text-cyan-700">"phone repair,"</span> <span className="italic text-cyan-700">"sheitel stylist,"</span> <span className="italic text-cyan-700">"deals today"</span> — and our assistant instantly finds the best match.
            </p>
            <p className="mb-4">
              Create a free account to bookmark favorites, leave reviews, get exclusive deals, and enjoy member giveaways.
            </p>
            <p className="text-xl font-semibold text-gray-900">
              LBA Directory — local shopping made simple.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700 px-8 py-6 text-lg"
          >
            <Link to={createPageUrl("AboutUs")}>
              Learn More About Us
            </Link>
          </Button>
        </div>
      </section>

      {/* Blue Banner */}
      <section className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Bringing all Lakewood's Business Information to one place
          </h2>
        </div>
      </section>

      {/* Shopper Benefits */}
      <section className="py-20 bg-gradient-to-br from-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                For Shoppers
              </h2>
              <p className="text-xl text-cyan-50 mb-8">
                Discover the best local businesses, save your favorites, and never miss a deal
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Save Your Favorites</h3>
                    <p className="text-cyan-50">Keep track of businesses you love</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Post Reviews</h3>
                    <p className="text-cyan-50">Share your experiences with the community</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Get Exclusive Deals</h3>
                    <p className="text-cyan-50">Access special promotions and discounts</p>
                  </div>
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link to={createPageUrl("Register")}>
                  Create Shopper Account
                </Link>
              </Button>
            </div>
            <div className="hidden lg:block">
              <div className="bg-cyan-500 bg-opacity-30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Search className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Easy Search</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Local Focus</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Save Favorites</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Star className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Read Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Benefits */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="hidden lg:block">
              <div className="bg-blue-600 bg-opacity-30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Grow Sales</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Reach Customers</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Feature Deals</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
                    <Star className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Build Trust</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                For Business Owners
              </h2>
              <p className="text-xl text-blue-50 mb-8">
                Grow your business and reach more customers in the Lakewood community
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Increase Visibility</h3>
                    <p className="text-blue-50">Get discovered by thousands of local shoppers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Connect with Customers</h3>
                    <p className="text-blue-50">Build relationships and grow your customer base</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Promote Your Deals</h3>
                    <p className="text-blue-50">Feature special offers and promotions</p>
                  </div>
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link to={createPageUrl("AddBusiness")}>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Add Your Business
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with LBA Directory is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-lg">
                <Search className="w-12 h-12" />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                Step 1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Search the Directory
              </h3>
              <p className="text-gray-600">
                Find local businesses by category, keyword, or location.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-12 h-12" />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                Step 2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Discover Deals
              </h3>
              <p className="text-gray-600">
                See the latest sales and promotions from local shops.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-lg">
                <Heart className="w-12 h-12" />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                Step 3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Save & Review
              </h3>
              <p className="text-gray-600">
                Create an account to save favorites and leave reviews.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-12 h-12" />
              </div>
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                Step 4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Grow Your Business
              </h3>
              <p className="text-gray-600">
                Business owners can list and promote their services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl text-cyan-50 mb-12 max-w-3xl mx-auto">
            Join the Lakewood Business Alliance Directory today
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-900 hover:bg-cyan-50 px-8 py-6 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link to={createPageUrl("AddBusiness")}>
                <ArrowRight className="w-5 h-5 mr-2" />
                Add Your Business
              </Link>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-6 text-lg font-semibold"
              asChild
            >
              <Link to={createPageUrl("Register")}>
                Create Account
              </Link>
            </Button>
          </div>

          <div className="mt-16 pt-8 border-t border-cyan-500">
            <p className="text-cyan-100 mb-4">Trusted by the Lakewood community</p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-cyan-200">
              <div>✓ Free Basic Listings</div>
              <div>✓ Verified Reviews</div>
              <div>✓ Local Community</div>
              <div>✓ Easy to Use</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}