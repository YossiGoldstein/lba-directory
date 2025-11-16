import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Mail, Save, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const EMAIL_TEMPLATES = {
  business_approved: {
    name: "Business Approved",
    subject: "Your Business Has Been Approved",
    body: `Hi [Name],

Great news! Your business "[BusinessName]" has been reviewed and approved.

It is now live on LBA Directory and visible to thousands of local shoppers in the Lakewood area.

You can update your profile, add deals, upload photos, or improve your description anytime through your Business Dashboard.

Welcome to the LBA community!

LBA Directory Team`
  },
  business_rejected: {
    name: "Business Rejected",
    subject: "Your Business Submission Needs Updates",
    body: `Hi [Name],

Your business "[BusinessName]" was reviewed, but we were unable to approve it at this time.

Reason:
[RejectionReason]

Please update your listing and resubmit it for review.
If you need assistance, the AI Assistant in your dashboard can help improve your description, category, or tag selection.

Thank you,
LBA Directory Team`
  },
  new_review: {
    name: "New Review Received",
    subject: "You Received a New Review",
    body: `Hi [Name],

Your business "[BusinessName]" has received a new review.

Rating: [Stars]
Review: "[ReviewText]"

You can view and respond to the review inside your Business Dashboard.

LBA Directory Team`
  },
  deal_expiring_soon: {
    name: "Deal Expiring Soon",
    subject: "Your Deal Is About to Expire",
    body: `Hi [Name],

This is a reminder that your deal for "[BusinessName]" is expiring soon:

Deal: [DealTitle]
Ends On: [EndDate]

If you would like to extend or update it, please visit your Business Dashboard.

LBA Directory Team`
  },
  deal_started: {
    name: "Deal Started",
    subject: "Your Deal Is Now Active",
    body: `Hi [Name],

Your deal for "[BusinessName]" is now active:

Deal: [DealTitle]
Start Date: [StartDate]

It is now visible to all users searching for relevant categories and services.

LBA Directory Team`
  },
  business_info_updated: {
    name: "Business Info Updated",
    subject: "Your Business Information Has Been Updated",
    body: `Hi [Name],

Your business "[BusinessName]" has been successfully updated.

If you did not make this change, please contact support immediately.

LBA Directory Team`
  },
  weekly_insights: {
    name: "Weekly Insights",
    subject: "Weekly Insights for Your Business",
    body: `Hi [Name],

Here are your weekly insights for "[BusinessName]":

• Times your business was recommended by the AI: [X]
• Popular searches in your category: [TopSearches]
• Deals with the highest engagement: [DealInfo]
• Suggested improvements: [AISuggestions]

You can apply suggestions with one click in your Business Dashboard.

LBA Directory Team`
  },
  issue_reported: {
    name: "Issue Reported",
    subject: "A User Reported an Issue With Your Business Listing",
    body: `Hi [Name],

A user has reported an issue with your business listing:

Type: [ReportType]
Message: "[ReportMessage]"

Please review and update your listing as needed.
You can manage this inside your Business Dashboard.

LBA Directory Team`
  }
};

export default function AdminEmailSettings() {
  const [selectedType, setSelectedType] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["email-settings"],
    queryFn: async () => {
      return await base44.entities.EmailSettings.list();
    }
  });

  const createSettingMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.EmailSettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["email-settings"]);
      toast.success("Setting created successfully");
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.EmailSettings.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["email-settings"]);
      toast.success("Setting updated successfully");
    }
  });

  const initializeDefaults = async () => {
    for (const [type, template] of Object.entries(EMAIL_TEMPLATES)) {
      const existing = settings.find(s => s.notification_type === type);
      if (!existing) {
        await createSettingMutation.mutateAsync({
          notification_type: type,
          is_enabled: true,
          from_email: "office@lbadirectory.com",
          subject_template: template.subject,
          body_template: template.body
        });
      }
    }
    toast.success("Default templates initialized");
  };

  const toggleEnabled = async (settingId, currentValue) => {
    await updateSettingMutation.mutateAsync({
      id: settingId,
      data: { is_enabled: !currentValue }
    });
  };

  const updateTemplate = async (settingId, subject, body) => {
    await updateSettingMutation.mutateAsync({
      id: settingId,
      data: {
        subject_template: subject,
        body_template: body
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Notification Settings</h1>
          <p className="text-gray-600">Manage email notifications sent to business owners</p>
        </div>

        {settings.length === 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 mb-2">No email templates found</p>
                  <p className="text-sm text-yellow-800 mb-4">
                    Initialize default email templates to start sending notifications to business owners.
                  </p>
                  <Button 
                    onClick={initializeDefaults}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Initialize Default Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Types</CardTitle>
                <CardDescription>Enable or disable email notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(EMAIL_TEMPLATES).map(([type, template]) => {
                    const setting = settings.find(s => s.notification_type === type);
                    return (
                      <div
                        key={type}
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedType === type
                            ? "border-cyan-600 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedType(type)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{template.name}</span>
                          {setting && (
                            <Switch
                              checked={setting.is_enabled}
                              onCheckedChange={() => toggleEnabled(setting.id, setting.is_enabled)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {setting ? (setting.is_enabled ? "Enabled" : "Disabled") : "Not initialized"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedType ? (
              <EmailTemplateEditor
                type={selectedType}
                template={EMAIL_TEMPLATES[selectedType]}
                setting={settings.find(s => s.notification_type === selectedType)}
                onSave={updateTemplate}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a notification type to edit its template</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailTemplateEditor({ type, template, setting, onSave }) {
  const [subject, setSubject] = useState(setting?.subject_template || template.subject);
  const [body, setBody] = useState(setting?.body_template || template.body);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!setting) {
      toast.error("Please initialize templates first");
      return;
    }
    setIsSaving(true);
    await onSave(setting.id, subject, body);
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {template.name}
        </CardTitle>
        <CardDescription>
          Edit the email template. Use placeholders like [Name], [BusinessName], etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line"
          />
        </div>

        <div>
          <Label htmlFor="body">Email Body</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Email body content"
            rows={15}
            className="font-mono text-sm"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Available Placeholders:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
            <code>[Name]</code>
            <code>[BusinessName]</code>
            <code>[RejectionReason]</code>
            <code>[Stars]</code>
            <code>[ReviewText]</code>
            <code>[DealTitle]</code>
            <code>[StartDate]</code>
            <code>[EndDate]</code>
            <code>[ReportType]</code>
            <code>[ReportMessage]</code>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-cyan-600 hover:bg-cyan-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </CardContent>
    </Card>
  );
}