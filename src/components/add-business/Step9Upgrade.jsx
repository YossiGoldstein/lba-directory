import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Users, TrendingUp } from "lucide-react";

export default function Step9Upgrade({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          האם אתם מעוניינים לשדרג את התוכנית שלכם?
        </h2>
        <p className="text-gray-600">
          בחרו התוכנית המתאימה ביותר לעסק שלכם
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={`cursor-pointer transition-all ${data.listing_tier === "free" ? "ring-2 ring-cyan-600 shadow-lg" : ""}`}
          onClick={() => onChange({ ...data, listing_tier: "free" })}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>חינם</CardTitle>
              <Badge className="bg-gray-100 text-gray-800">עכשיו זה</Badge>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">₪0</p>
            <p className="text-sm text-gray-500">לחודש</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">רישום בדיקטוריון</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">הצגת 3 תמונות</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">דירוגים וביקורות</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">טופס יצירת קשר</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`cursor-pointer transition-all ${data.listing_tier === "pro" ? "ring-2 ring-cyan-600 shadow-lg" : "hover:shadow-lg"}`}
          onClick={() => onChange({ ...data, listing_tier: "pro" })}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Pro</CardTitle>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              {data.listing_tier === "pro" && <Badge className="bg-cyan-100 text-cyan-800">בחור</Badge>}
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">₪99</p>
            <p className="text-sm text-gray-500">לחודש</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-cyan-900">🎯 הטוב ביותר לעסקים קטנים</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">כל היתרונות של חינם</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">תמונות ללא הגבלה</span>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">דירוג עדיפי בחיפוש</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">יצירת עסקאות וקופונים</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">ניתוח סטטיסטיקות</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <Users className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💡 הצעה מיוחדת</h4>
            <p className="text-sm text-gray-700">
              אם תשדרגו ל-Pro, אתם תקבלו את החודש הראשון ב-₪49 בלבד! ואחרי זה רק ₪99 לחודש.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-700">
          <strong>📝 הערה:</strong> אתם תוכלו לשדרג או לשנות את התוכנית שלכם בכל עת מדוד לוח הבקרה שלכם.
        </p>
      </div>
    </div>
  );
}