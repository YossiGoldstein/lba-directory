import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tag, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import BusinessResultCard from "../chat/BusinessResultCard";
import ReactMarkdown from "react-markdown";

export default function RelatedCategoriesSection({ business, category, allCategories }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [suggestedBusinesses, setSuggestedBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);

  // Lazy-load businesses only when needed (on first category click)
  const ensureBusinessesLoaded = async () => {
    if (allBusinesses.length > 0) return allBusinesses;
    try {
      const bizList = await base44.entities.Business.filter({ status: "approved" });
      setAllBusinesses(bizList);
      return bizList;
    } catch (error) {
      console.error("Failed to load businesses:", error);
      return [];
    }
  };

  // Map of category slugs to related category slugs
  const relatedCategoriesMap = {
    food: ["dairy", "bakery", "catering", "coffee"],
    dairy: ["food", "bakery", "coffee", "catering"],
    bakery: ["food", "dairy", "coffee", "catering"],
    apparel: ["shoes", "kids-clothing", "accessories", "alterations"],
    services: ["handyman", "cleaning", "moving", "professional"],
    home: ["furniture", "appliances", "hardware", "cleaning"],
    auto: ["mechanic", "body-shop", "tires", "detailing"],
    judaica: ["books", "gifts", "religious-items", "silver"],
    beauty: ["salon", "spa", "makeup", "nails"],
    fun: ["entertainment", "activities", "parks", "events"],
    education: ["tutoring", "schools", "learning", "camps"],
    "org-gmach": ["charity", "community", "organizations", "support"],
    repair: ["handyman", "plumber", "electrician", "appliance-repair"],
    handyman: ["repair", "plumber", "electrician", "contractor"],
    plumber: ["repair", "handyman", "electrician", "contractor"],
    electrician: ["repair", "handyman", "plumber", "contractor"],
    restaurant: ["food", "dairy", "catering", "takeout"],
    grocery: ["food", "bakery", "kosher", "specialty"],
    shopping: ["apparel", "gifts", "judaica", "home"],
    professional: ["services", "consulting", "accounting", "legal"],
    health: ["medical", "therapy", "wellness", "fitness"],
    kids: ["education", "camps", "activities", "tutoring"],
  };

  // Get related category slugs
  const relatedSlugs = relatedCategoriesMap[category?.slug] || [];

  // Find actual category objects
  const relatedCategories = relatedSlugs
    .map(slug => allCategories.find(c => c.slug === slug))
    .filter(cat => {
      if (!cat) return false;
      const hasBusinesses = allBusinesses.some(b => 
        b.category_id === cat.id || 
        (b.subcategory_ids && b.subcategory_ids.includes(cat.id))
      );
      return hasBusinesses;
    })
    .slice(0, 4); // Limit to 4

  const extractBusinessesFromResponse = (responseText, bizList) => {
    const businesses = [];
    const responseLines = responseText.toLowerCase();

    (bizList || allBusinesses).forEach(biz => {
      if (biz.id === business.id) return; // Don't include current business
      const businessName = (biz.business_name || "").toLowerCase();
      if (businessName && responseLines.includes(businessName)) {
        businesses.push(biz);
      }
    });

    return businesses.slice(0, 6);
  };

  const handleCategoryClick = async (clickedCategory) => {
    setIsLoading(true);
    setSelectedCategory(clickedCategory);
    setAiResponse("");
    setSuggestedBusinesses([]);
    const loadedBusinesses = await ensureBusinessesLoaded();

    try {
      const conv = await base44.agents.createConversation({
        agent_name: "DirectoryAssistant",
        metadata: {
          name: `Related: ${clickedCategory.name}`,
          description: "Related category from business page",
          context: "business_page_related_category",
          original_business: business.business_name,
          clicked_category: clickedCategory.name
        }
      });

      await base44.agents.addMessage(conv, {
        role: "user",
        content: `The user is viewing the business "${business.business_name}" (${category?.name || 'Unknown category'}) and clicked a related category: ${clickedCategory.name}.

Show businesses in this category that may be relevant, based on the user's interest in this business.`
      });

      const unsubscribe = base44.agents.subscribeToConversation(
        conv.id,
        (data) => {
          const messages = data.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === "assistant") {
            setAiResponse(lastMessage.content);
            const extractedBusinesses = extractBusinessesFromResponse(lastMessage.content, loadedBusinesses);
            setSuggestedBusinesses(extractedBusinesses);
            setIsLoading(false);
          }
        }
      );

      setTimeout(() => {
        unsubscribe();
      }, 30000);

    } catch (error) {
      console.error("Related category failed:", error);
      setIsLoading(false);
      setAiResponse("Sorry, I encountered an error. Please try again.");
    }
  };

  if (relatedCategories.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Related Categories</h2>
            <p className="text-sm text-gray-600">Explore similar businesses in these categories</p>
          </div>
        </div>
      </div>

      {/* Category Buttons */}
      <div className="p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          {relatedCategories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              variant="outline"
              className={`transition-all ${
                selectedCategory?.id === cat.id
                  ? "bg-purple-100 border-purple-400 text-purple-700"
                  : "hover:bg-purple-50 hover:border-purple-300"
              }`}
              disabled={isLoading}
            >
              {cat.name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Finding related businesses...</p>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && !isLoading && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Recommendations:</h3>
                  <ReactMarkdown
                    className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-purple-600 prose-strong:text-gray-900"
                    components={{
                      a: ({ children, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="underline">
                          {children}
                        </a>
                      ),
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    }}
                  >
                    {aiResponse}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Suggested Businesses */}
            {suggestedBusinesses.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {suggestedBusinesses.length} Business{suggestedBusinesses.length !== 1 ? 'es' : ''} Found:
                </h3>
                <div className="space-y-3">
                  {suggestedBusinesses.map((biz) => (
                    <BusinessResultCard key={biz.id} business={biz} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}