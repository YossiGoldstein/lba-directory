import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Search } from "lucide-react";
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
    <section className="bg-white py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Results Column */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Search Results</h2>
            </div>

            {/* Business Results */}
            {businesses && businesses.length > 0 ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {businesses.length} Business{businesses.length !== 1 ? 'es' : ''} Found
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <BusinessResultCard key={business.id} business={business} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-lg">No specific matches found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try refining your search or browse our categories
                </p>
              </div>
            )}

            {/* AI Response - Mobile (After Results) */}
            <div className="lg:hidden mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
                  <ReactMarkdown
                    className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600"
                    components={{
                      a: ({ children, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="underline">
                          {children}
                        </a>
                      ),
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    }}
                  >
                    {agentResponse}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button
                  onClick={onContinueInChat}
                  variant="outline"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Continue in chat
                </Button>
              </div>
            </div>
          </div>

          {/* AI Assistant Panel - Desktop (Side) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <ReactMarkdown
                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-600 mb-4"
                components={{
                  a: ({ children, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="underline">
                      {children}
                    </a>
                  ),
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                }}
              >
                {agentResponse}
              </ReactMarkdown>
              <Button
                onClick={onContinueInChat}
                variant="outline"
                size="sm"
                className="gap-2 w-full"
              >
                <Sparkles className="w-4 h-4" />
                Continue in chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}