import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, Home } from "lucide-react";

export default function PrivacyPolicy() {
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
            <span className="text-gray-900 font-medium">Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy – LBA Directory</h1>
        <p className="text-gray-500 mb-8">Last Updated: January 2025</p>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            This Privacy Policy describes how LBA Directory, operated by LBA Leagues and TIG Solutions ("we", "our", or "us"), collects, uses, and protects your information.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            By using this site, you agree to the terms of this Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may collect the following types of information:
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.1 Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Business information (for business owners)</li>
            <li>Reviews you submit</li>
            <li>Messages sent via contact forms</li>
            <li>AI-generated submissions or prompts</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>IP address</li>
            <li>Device information</li>
            <li>Browser type</li>
            <li>Pages viewed</li>
            <li>Search queries</li>
            <li>Interaction with the AI assistant</li>
            <li>Session data (for improving service)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.3 Business Listings</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Business owners may submit:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Business name and description</li>
            <li>Photos</li>
            <li>Hours</li>
            <li>Deals</li>
            <li>Address</li>
            <li>Category and tags</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            This information is publicly visible unless removed or hidden.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use your information for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Displaying business listings</li>
            <li>Operating user accounts</li>
            <li>Providing customer support</li>
            <li>Running the AI-powered search assistant</li>
            <li>Sending notifications (e.g., approvals, reviews, deals)</li>
            <li>Improving the platform</li>
            <li>Ensuring community-appropriate content</li>
            <li>Detecting and preventing misuse</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            We do not sell your personal information.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. AI Usage</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The platform uses AI to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Improve search results</li>
            <li>Suggest businesses</li>
            <li>Help business owners write descriptions</li>
            <li>Assist users with questions</li>
            <li>Provide category recommendations</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            When interacting with the AI:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Your queries may be processed by AI systems</li>
            <li>AI responses may not always be accurate</li>
            <li>You should verify important details directly with businesses</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            We do not allow the AI to generate or store inappropriate content.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Cookies and Tracking</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may use:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>Session cookies</li>
            <li>Analytics cookies</li>
            <li>Essential technical cookies</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            These help us:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Improve site performance</li>
            <li>Track usage trends</li>
            <li>Maintain login sessions</li>
            <li>Enhance search relevance</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            You may disable cookies, but some features may not work properly.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. How We Protect Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use reasonable security measures to protect your information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Encrypted connections (HTTPS)</li>
            <li>Restricted access to admin areas</li>
            <li>Internal monitoring</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            However, no system is 100% secure. You use the platform at your own risk.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Who We Share Information With</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may share limited data with:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Service providers who help operate the site</li>
            <li>Email notification services</li>
            <li>Technical infrastructure providers</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            We do not sell, trade, or rent personal information to third parties. We do not share information with advertisers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            The platform is not intended for children under 13. If we learn a child has provided information, we will remove it.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Links to Third-Party Sites</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Some business pages include external links. We are not responsible for the content or privacy practices of those websites.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Your Choices</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Update your business listing</li>
            <li>Edit your user profile</li>
            <li>Request correction of inaccurate information</li>
            <li>Delete your account</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-6">
            To request assistance: <a href="mailto:office@lbadirectory.com" className="text-cyan-600 hover:text-cyan-700">office@lbadirectory.com</a>
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We may update this policy from time to time. The "Last Updated" date at the top will reflect any changes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">11. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            For privacy-related questions:
          </p>
          <p className="text-gray-700 leading-relaxed mb-1">
            <strong>LBA Directory – Privacy Department</strong>
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