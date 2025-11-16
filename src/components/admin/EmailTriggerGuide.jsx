import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Zap } from "lucide-react";

export default function EmailTriggerGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Email Trigger Integration Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 mb-3">
            Use the <code className="bg-blue-100 px-2 py-1 rounded">sendBusinessEmail</code> backend function to trigger emails:
          </p>
          
          <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto">
            <pre>{`await base44.functions.invoke('sendBusinessEmail', {
  type: 'business_approved',
  businessId: business.id,
  data: {} // additional data for placeholders
});`}</pre>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Integration Points:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">✅ Business Approved</p>
              <p className="text-gray-600">Admin Dashboard → PendingApprovalsTab → After approval</p>
              <code className="text-xs">type: 'business_approved'</code>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">❌ Business Rejected</p>
              <p className="text-gray-600">Admin Dashboard → PendingApprovalsTab → After rejection</p>
              <code className="text-xs">type: 'business_rejected', data: {"{rejectionReason}"}</code>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">⭐ New Review</p>
              <p className="text-gray-600">BusinessListing → ReviewForm → After review submission</p>
              <code className="text-xs">type: 'new_review', data: {"{stars, reviewText}"}</code>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">⏰ Deal Expiring Soon</p>
              <p className="text-gray-600">Backend cron job → Check deals daily</p>
              <code className="text-xs">type: 'deal_expiring_soon', data: {"{dealTitle, endDate}"}</code>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">🎉 Deal Started</p>
              <p className="text-gray-600">DealsTab → After deal creation with start date</p>
              <code className="text-xs">type: 'deal_started', data: {"{dealTitle, startDate}"}</code>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-900 mb-2">📝 Next Steps:</p>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Integrate email triggers in admin approval flow</li>
            <li>• Add trigger to review submission</li>
            <li>• Create scheduled job for deal expiration checks</li>
            <li>• Test each email type with sample data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}