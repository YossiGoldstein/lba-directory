import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Home } from "lucide-react";

export default function SubmissionSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const businessName = urlParams.get("businessName") || "העסק שלכם";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🎉 רישום בוצע בהצלחה!
          </h1>

          <p className="text-xl text-gray-700 mb-6">
            תודה רבה! <strong>{businessName}</strong> נרשמה בדיקטוריון שלנו.
          </p>

          {/* Next Steps */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-8 text-right">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📋 מה קורה עכשיו?</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-lg font-semibold text-gray-900">בדיקה וקבלת אישור</h3>
                  <p className="text-gray-700">הצוות שלנו יבדוק את הרישום תוך 1-2 ימי עסקים</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">קבלת אימייל</h3>
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-gray-700">אתם תקבלו אימייל עם אישור וכל הפרטים שלכם</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-lg font-semibold text-gray-900">אתם בחיים! 🚀</h3>
                  <p className="text-gray-700">העסק שלכם יהיה חיי בדיקטוריון וגלוי לחיפוש</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notification */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8 text-right">
            <p className="text-gray-700 text-lg">
              💌 <strong>בדקו את דוא"ל שלכם</strong> - אנחנו כבר שלחנו הודעה ראשונית שדוא"ל הרישום התקבל!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
            >
              <Link to={createPageUrl("Home")}>
                <Home className="w-5 h-5 mr-2" />
                חזור לעמוד הבית
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-12 text-lg"
            >
              <Link to={createPageUrl("UserDashboard")}>
                לוח הבקרה שלי
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-10 pt-10 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 רוצים לקדם את העסק שלכם?</h3>
            <p className="text-gray-700 mb-6">
              אנחנו מציעים שירותים נוספים כמו בניית לוגו, אתר, סרטון תדמית ועוד. <br />
              <strong>צרו איתנו קשר</strong> כדי לשמוע עוד פרטים!
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 <strong>דוא"ל:</strong> office@lbadirectory.com</p>
              <p>📱 <strong>וואטסאפ:</strong> 732-600-1260</p>
              <p>☎️ <strong>טלפון:</strong> 732-600-1260</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}