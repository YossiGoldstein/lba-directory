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
      question: "Do I need to have an account to search?",
      answer: `No. You can search freely without an account.
  By creating a free consumer account, you benefit from:
  • The ability to bookmark and follow your favorite businesses
  • Submitting reviews
  • Access to exclusive deals`
    },
    {
      id: "2",
      question: "Does the directory cover businesses outside of Lakewood?",
      answer: `Yes. We cover the greater Lakewood area, including:
  Toms River, Jackson, Brick, Howell, and Manchester.`
    },
    {
      id: "3",
      question: "If I upgrade to a premium listing package, can I downgrade back anytime?",
      answer: `Yes. Paid memberships are on a month-to-month basis.
  You can try it out, and if it's not for you, you can downgrade back to the free version at any time.`
    },
    {
      id: "4",
      question: "With the premium listing packages, what type of advertising do you offer?",
      answer: `We offer targeted advertising through WhatsApp and Instagram platforms under our TIG Solutions marketing.
  Our WhatsApp status and some of our WhatsApp groups are dedicated to ads only.
  We have thousands of Lakewood-area followers, and ads are posted on the platforms most relevant to each specific business.
  The standard advertising rate is $125 per ad.
  With a premium listing package, you receive several of these ads per year at no additional cost.`
    },
    {
      id: "5",
      question: "What's the difference between the LBA Directory and Google?",
      answer: `Great question, and that's exactly why we're here.
  Not all businesses are on Google, and many do not have complete or accurate business details listed there.
  Google is not specifically targeted to the Jewish Lakewood community and may return irrelevant results when users search without a specific business name.
  The LBA Directory is built specifically for the local Lakewood area and focuses on accurate, community-driven business information.`
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
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 text-left">
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
              ))}
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
    </div>
  );
}