import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { ChevronRight, MessageCircle, Search, Building2, Shield, Sparkles } from "lucide-react";

export default function FAQ() {
  const handleOpenChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  const faqs = [
    {
      id: "1",
      icon: Building2,
      question: "What is LBA Directory?",
      answer: `LBA Directory is a smart, AI-powered business directory created for the Lakewood community. It helps you find local shops, services, restaurants, and professionals across Lakewood, Toms River, Jackson, Brick, Howell, and surrounding areas.

Instead of scrolling through weekly papers or searching multiple places, you can simply ask in natural language — and our assistant finds what you need.`
    },
    {
      id: "2",
      icon: Search,
      question: "How do I search for a business?",
      answer: `Just type what you're looking for into the search bar on the Home Page or start chatting with our Directory Assistant.

Examples:
• "Dairy restaurant open now in Lakewood"
• "Phone repair near me"
• "Kids clothing store with good reviews"
• "Plumber available tonight"

No filters are needed — the AI understands your request and delivers the most relevant options.`
    },
    {
      id: "3",
      icon: Sparkles,
      question: "What makes the AI different from regular search?",
      answer: `Our AI doesn't rely on strict filters.
It understands intent, context, and the unique needs of the Lakewood community.

It can:
• Interpret free-text questions
• Suggest related categories
• Find similar businesses
• Provide hours, deals, and directions
• Recommend kosher-appropriate options
• Avoid irrelevant or non-kosher results

It's like having a personal assistant who knows the entire local shopping scene.`
    },
    {
      id: "4",
      icon: Shield,
      question: "Is everything on the site kosher-appropriate?",
      answer: `Yes.
Results and recommendations are tailored to the standards of the Lakewood Haredi community.

The system avoids:
• Non-kosher restaurants
• Inappropriate categories
• Suggestions that don't fit the community

All content and results are reviewed with this in mind.`
    },
    {
      id: "5",
      question: "Do I need an account to use the site?",
      answer: `No — you can search freely without an account.

But creating a free shopper account gives you:
• The ability to bookmark favorites
• Write reviews
• Access exclusive monthly deals
• Eligibility for giveaways and special promotions`
    },
    {
      id: "6",
      question: "How do I add my business to the directory?",
      answer: `You can add a business through our Add Business Wizard.

It guides you step-by-step through:
• Business details
• Category
• Tags
• Hours
• Gallery
• Deals
• AI-assisted optimization

Once submitted, your business enters approval review before going live.`
    },
    {
      id: "7",
      question: "How does the AI help business owners?",
      answer: `Inside the Business Owner Dashboard, there is a dedicated AI Assistant.

It can:
• Improve your business description
• Suggest better tags
• Recommend deals
• Rewrite content professionally
• Help optimize hours
• Explain what customers are searching for

This gives every owner a powerful marketing assistant.`
    },
    {
      id: "8",
      question: "Are my searches or data shared with anyone?",
      answer: `Absolutely not.

Your data is:
• Private
• Not sold
• Not shared with businesses
• Used only to improve your personal experience (e.g., recent searches, AI suggestions)

We take privacy seriously and follow community expectations for discretion and tznius.`
    },
    {
      id: "9",
      question: "Does the site work on Shabbos?",
      answer: `The site is accessible, but:

• We do not encourage live interaction or commercial activity on Shabbos
• Business hours shown may indicate "Closed for Shabbos"
• No Shabbos-specific actions (e.g., "Open now") will be suggested during Shabbos times`
    },
    {
      id: "10",
      question: "How often is business information updated?",
      answer: `Business owners can update their information anytime from their dashboard.

We also use:
• AI moderation
• Community feedback
• Review updates

to help ensure hours, deals, and details stay accurate.`
    },
    {
      id: "11",
      question: "What areas does the directory cover?",
      answer: `Primarily Lakewood and its natural extensions:

• Lakewood
• Toms River
• Jackson
• Brick
• Howell
• Manchester
• Surrounding neighborhoods

More areas may be added as the community grows.`
    },
    {
      id: "12",
      question: "What should I do if I find incorrect information?",
      answer: `Use the "Report an Issue" button on any business page.

You can report:
• Incorrect hours
• Wrong category
• Duplicate listing
• Inappropriate content
• Non-kosher relevance

Our team will review it promptly.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-cyan-100 mb-6">
            <Link
              to={createPageUrl("Home")}
              className="hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">FAQ</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-cyan-50">
            Everything you need to know about LBA Directory
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => {
            const IconComponent = faq.icon;
            return (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 text-left">
                  <div className="flex items-start gap-3 pr-4">
                    {IconComponent && (
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <IconComponent className="w-5 h-5 text-cyan-600" />
                      </div>
                    )}
                    <span className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="pl-11 text-gray-700 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Still Have Questions */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-700 mb-6">
              Our AI-powered Directory Assistant is here to help you find answers instantly.
            </p>
            <Button
              onClick={handleOpenChat}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Ask Us Anything
            </Button>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to={createPageUrl("AboutUs")}
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-200 transition-colors">
              <Building2 className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About Us</h3>
            <p className="text-gray-600 text-sm">
              Learn more about LBA Directory and our mission
            </p>
          </Link>

          <Link
            to={createPageUrl("AddBusiness")}
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your Business</h3>
            <p className="text-gray-600 text-sm">
              Get started with our step-by-step business wizard
            </p>
          </Link>

          <Link
            to={createPageUrl("Contact")}
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
            <p className="text-gray-600 text-sm">
              Reach out to our team for additional support
            </p>
          </Link>
        </div>
      </section>

      {/* Floating Ask Button */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
        aria-label="Ask us anything"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}