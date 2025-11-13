import React from "react";

export default function CategoryListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Category: {slug}</h1>
        <p className="text-lg text-gray-600">
          Category listing page content will be designed in the next phase.
        </p>
      </div>
    </div>
  );
}