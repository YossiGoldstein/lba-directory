import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search } from "lucide-react";
import BusinessResultCard from "../chat/BusinessResultCard";
import ReactMarkdown from "react-markdown";

export default function SearchResultsPanel({ 
  agentResponse, 
  businesses, 
  onContinueInChat,
  isLoading 
}) {
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Searching for the best matches...</p>
            <p className="text-sm text-gray-500 mt-2">Our AI assistant is analyzing your request</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agentResponse) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Search Results</h2>
          </div>
          <p className="text-cyan-100 text-sm">
            Results powered by AI Directory Assistant
          </p>
        </div>

        {/* Agent Response */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <ReactMarkdown
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600 prose-strong:text-gray-900"
            components={{
              a: ({ children, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-700">
                  {children}
                </a>
              ),
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-6 mb-3 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-6 mb-3 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
            }}
          >
            {agentResponse}
          </ReactMarkdown>
        </div>

        {/* Business Cards */}
        {businesses && businesses.length > 0 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {businesses.length} Business{businesses.length !== 1 ? 'es' : ''} Found
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <BusinessResultCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {(!businesses || businesses.length === 0) && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">
              No specific businesses matched your search
            </p>
            <p className="text-sm text-gray-500">
              Try refining your search or ask in the chat for more help
            </p>
          </div>
        )}

        {/* Continue in Chat Button */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <Button
            onClick={onContinueInChat}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Continue this search in chat
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Get more personalized help and refine your search with our AI assistant
          </p>
        </div>
      </div>
    </div>
  );
}