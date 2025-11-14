import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Step4Hours({ data, onChange }) {
  const [useStructured, setUseStructured] = useState(data.use_structured_hours !== false);

  const defaultStructuredHours = {
    sunday: { open: "09:00", close: "17:00", closed: false },
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "14:00", closed: false },
    saturday: { open: "", close: "", closed: true },
    motzei_shabbos: { open: "21:00", close: "23:00", closed: false },
  };

  const structuredHours = data.opening_hours_json || defaultStructuredHours;

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
    const updated = {
      ...structuredHours,
      [day]: {
        ...structuredHours[day],
        [field]: value,
      },
    };
    onChange({
      ...data,
      opening_hours_json: updated,
      use_structured_hours: true,
    });
  };

  const handleModeChange = (structured) => {
    setUseStructured(structured);
    onChange({
      ...data,
      use_structured_hours: structured,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours of Operation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={useStructured}
              onChange={() => handleModeChange(true)}
              className="w-4 h-4"
            />
            <span className="font-medium text-gray-900">Structured Hours</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!useStructured}
              onChange={() => handleModeChange(false)}
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
              value={data.opening_hours_text || ""}
              onChange={(e) => onChange({ ...data, opening_hours_text: e.target.value })}
              rows={8}
              placeholder="Sunday: 9:00 AM - 5:00 PM&#10;Monday: 9:00 AM - 5:00 PM&#10;..."
            />
            <p className="text-xs text-gray-500">
              Enter your opening hours in any format
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}