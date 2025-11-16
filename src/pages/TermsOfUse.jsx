import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, Home } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to={createPageUrl("Home")} className="text-gray-600 hover:text-cyan-600 flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Terms of Use</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use – LBA Directory</h1>
        <p className="text-gray-500 mb-8">Last Updated: January 2025</p>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            Welcome to LBA Directory, operated by LBA Leagues and TIG Solutions ("we", "our", or "us").
            By accessing or using this website, you agree to the following Terms of Use.
            If you do not agree, please do not use the site.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Purpose of the Directory</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            LBA Directory is a community-focused business directory serving the Lakewood, Toms River, Jackson, Brick, Howell, and surrounding areas.
            The platform allows users to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Search for local businesses</li>
            <li>View business information</li>
            <li>Contact businesses</li>
            <li>Leave reviews</li>
            <li>Access deals and promotions</li>
            <li>Interact with an AI-powered assistant to assist with search and navigation</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            The platform is designed for the Lakewood Haredi community, and we strive to ensure that listings and categories remain appropriate.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. No Guarantees or Endorsements</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            LBA Directory provides information as-is. We do not guarantee:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>The accuracy of business information</li>
            <li>That businesses are open, available, or reliable</li>
            <li>The kashrut, supervision, or compliance of any establishment</li>
            <li>The quality of products or services</li>
            <li>That AI-generated responses are always accurate</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            We do not endorse any specific business. Each business is responsible for the accuracy of its own listing.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. AI Responses</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our platform includes an AI assistant that helps users search for businesses. By using the AI features, you acknowledge:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>AI responses are generated automatically</li>
            <li>AI may occasionally provide inaccurate or incomplete information</li>
            <li>AI recommendations are suggestions only</li>
            <li>Users must verify important information directly with the business</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            You agree not to rely solely on AI output for decisions that require accuracy (e.g., hours, directions, kashrut status, pricing).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. User Accounts</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            To create a business listing or leave reviews, users may need to create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Provide accurate information</li>
            <li>Keep your login credentials secure</li>
            <li>Not impersonate others</li>
            <li>Not misuse or disrupt the platform</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            We may suspend or delete accounts that violate these rules.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Reviews</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Users may post reviews, subject to the following:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Reviews must be courteous, truthful, and respectful</li>
            <li>No lashon hara, offensive content, harassment, or defamation</li>
            <li>We may remove reviews at our discretion</li>
            <li>Businesses may respond to reviews professionally</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            We reserve the right to moderate or delete content.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Business Listings</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Businesses are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>The accuracy of their information</li>
            <li>Photos, descriptions, deals, hours, and contact details</li>
            <li>Ensuring their listing is appropriate for the community</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may reject or remove listings that:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Are inappropriate</li>
            <li>Do not fit community standards</li>
            <li>Contain misleading or offensive content</li>
            <li>Violate laws or guidelines</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Prohibited Use</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Users may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Upload harmful, illegal, or inappropriate content</li>
            <li>Attempt to exploit the platform</li>
            <li>Use the platform for non-community-appropriate purposes</li>
            <li>Reverse-engineer, scrape, or copy site data</li>
            <li>Misuse the AI features</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Disclaimers</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We are not liable for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Damages caused by reliance on business information</li>
            <li>Errors in AI responses</li>
            <li>Business interactions or transactions</li>
            <li>Third-party conduct</li>
            <li>Service interruptions or outages</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            Your use of the site is at your own risk.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Changes to the Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We may update these Terms at any time. Your continued use of the site indicates acceptance of updated terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            For questions about these Terms:
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>Email:</strong> <a href="mailto:office@lbadirectory.com" className="text-cyan-600 hover:text-cyan-700">office@lbadirectory.com</a>
          </p>
          <p className="text-gray-700 leading-relaxed mb-8">
            <strong>Phone:</strong> <a href="tel:732-600-1260" className="text-cyan-600 hover:text-cyan-700">732-600-1260</a>
          </p>
        </div>
      </div>
    </div>
  );
}