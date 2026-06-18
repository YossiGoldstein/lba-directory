import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { toast } from "sonner";

export default function OpeningHoursTab({ business, onUpdate }) {
  const [useStructured, setUseStructured] = useState(
    !business.opening_hours_text || business.opening_hours_json
  );
  const [freeText, setFreeText] = useState(business.opening_hours_text || "");
  const [structuredHours, setStructuredHours] = useState(
    business.opening_hours_json || {
      sunday: { open: "09:00", close: "17:00", closed: false },
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "14:00", closed: false },
      saturday: { open: "", close: "", closed: true },
      motzei_shabbos: { open: "21:00", close: "23:00", closed: false },
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  const days = [
    { key: "sunday", label: "Sunday" },
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday (Shabbos)" },
    { key: "motzei_shabbos", label: "Motzei Shabbos" },
  ];

  const handleStructuredChange = (day, field, value) => {
    setStructuredHours({
      ...structuredHours,
      [day]: {
        ...structuredHours[day],
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updateData = useStructured
        ? {
            opening_hours_json: structuredHours,
            opening_hours_text: generateTextFromStructured(structuredHours),
          }
        : {
            opening_hours_text: freeText,
            opening_hours_json: null,
          };

      await base44.entities.Business.update(business.id, updateData);

      toast.success("Opening hours updated successfully!");
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update hours:", error);
      toast.error("Failed to update opening hours");
    } finally {
      setIsSaving(false);
    }
  };

  const generateTextFromStructured = (hours) => {
    return Object.entries(hours)
      .map(([day, times]) => {
        const dayName = day.replace("_", " ");
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        
        if (times.closed) {
          return `${capitalizedDay}: Closed`;
        }
        return `${capitalizedDay}: ${times.open} - ${times.close}`;
      })
      .join("\n");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Opening Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Mode */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useStructured}
                onChange={() => setUseStructured(true)}
                className="w-4 h-4"
              />
              <span className="font-medium text-gray-900">Structured Hours</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useStructured}
                onChange={() => setUseStructured(false)}
                className="w-4 h-4"
              />
              <span className="font-medium text-gray-900">Free Text</span>
            </label>
          </div>

          {/* Structured Hours */}
          {useStructured && (
            <div className="space-y-3">
              {days.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-40 font-medium text-gray-900">{label}</div>
                  {key === "saturday" ? (
                    <div className="flex-1 text-gray-600 italic">Closed (Shabbos)</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={structuredHours[key]?.closed || false}
                          onChange={(e) =>
                            handleStructuredChange(key, "closed", e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600">Closed</span>
                      </div>
                      {!structuredHours[key]?.closed && (
                        <>
                          <Input
                            type="time"
                            value={structuredHours[key]?.open || ""}
                            onChange={(e) =>
                              handleStructuredChange(key, "open", e.target.value)
                            }
                            className="w-32"
                          />
                          <span className="text-gray-600">to</span>
                          <Input
                            type="time"
                            value={structuredHours[key]?.close || ""}
                            onChange={(e) =>
                              handleStructuredChange(key, "close", e.target.value)
                            }
                            className="w-32"
                          />
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Free Text */}
          {!useStructured && (
            <div className="space-y-2">
              <Label htmlFor="hours_text">Opening Hours (Free Text)</Label>
              <Textarea
                id="hours_text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                rows={8}
                placeholder="Sunday: 9:00 AM - 5:00 PM&#10;Monday: 9:00 AM - 5:00 PM&#10;..."
              />
              <p className="text-xs text-gray-500">
                Enter your opening hours in any format
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              className="bg-cyan-600 hover:bg-cyan-700"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Hours"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}