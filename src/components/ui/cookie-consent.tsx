"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-2xl shadow-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 mb-1">
              🍪 אנחנו משתמשים בעוגיות
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              האתר משתמש בעוגיות כדי לשפר את חווית הגלישה שלך, לנתח תעבורה ולהציג תוכן מותאם אישית.
              בהמשך הגלישה באתר את/ה מסכימ/ה לשימוש בעוגיות.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={declineCookies}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              דחייה
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
            >
              אישור
            </button>
          </div>
          <button
            onClick={declineCookies}
            className="absolute top-3 left-3 p-1 text-neutral-400 hover:text-neutral-600 transition-colors sm:hidden"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
