import { Metadata } from 'next';
import { Phone, Mail, MapPin, Calendar, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'הצהרת נגישות | מושיוב תכשיטים',
  description:
    'הצהרת הנגישות של אתר מושיוב - חנות תכשיטי זהב ויהלומים. האתר נבנה לפי תקן ישראלי 5568 ברמת AA.',
};

export default function AccessibilityPage() {
  const currentDate = new Date().toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          הצהרת נגישות
        </h1>
        <p className="text-lg text-muted-foreground">
          מושיוב - תכשיטי זהב ויהלומים מחויבת להנגשת האתר לכלל הציבור
        </p>
      </div>

      {/* Main content */}
      <div className="space-y-8 text-foreground">
        {/* Introduction */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-gold-500" />
            מבוא
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            אתר מושיוב מחויב להנגשת האתר לאנשים עם מוגבלויות, ומשקיע משאבים רבים
            על מנת להבטיח שהשירותים והתכנים יהיו נגישים לכל אדם. אנו פועלים
            בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ״ח-1998, ולתקנות שוויון
            זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013.
          </p>
        </section>

        {/* Accessibility level */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">רמת הנגישות</h2>
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              האתר עומד בדרישות{' '}
              <strong className="text-foreground">תקנות שוויון זכויות לאנשים עם מוגבלות</strong>{' '}
              (התאמות נגישות לשירות), התשע״ג-2013 ועומד בהנחיות{' '}
              <strong className="text-foreground">WCAG 2.0</strong> ברמת{' '}
              <strong className="text-foreground">AA</strong> בהתאם ל
              <strong className="text-foreground">תקן ישראלי 5568</strong>.
            </p>
            <p className="leading-relaxed">
              האתר תוכנן ופותח כך שיהיה נגיש ושמיש לאנשים עם מוגבלויות, לרבות
              משתמשים הזקוקים לטכנולוגיות מסייעות כגון תוכנות הקראת מסך, תוכנות
              הגדלה, ניווט באמצעות מקלדת בלבד ועוד.
            </p>
          </div>
        </section>

        {/* Accessibility features */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">אמצעי נגישות באתר</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              האתר כולל תפריט נגישות ייעודי המאפשר התאמות מתקדמות:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>התאמת גודל טקסט (רגיל, גדול, גדול מאוד)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>ניגודיות גבוהה</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>מצב גווני אפור</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>הדגשת קישורים</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>גופן קריא</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>עצירת אנימציות</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>סמן עכבר מוגדל</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>הדגשת מיקוד משופרת</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>ריווח שורות מוגדל</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>ריווח אותיות מוגדל</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-6">
              בנוסף, האתר כולל:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>תמיכה בתוכנות הקראת מסך (NVDA, JAWS, VoiceOver)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>ניווט מלא באמצעות מקלדת בלבד</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>מבנה HTML סמנטי נכון</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>תמונות עם טקסט חלופי (Alt Text)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>ניגודיות צבעים גבוהה</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>שפה עברית תקנית וברורה</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Last update */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-gold-500" />
            תאריך עדכון אחרון
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            הצהרת נגישות זו עודכנה לאחרונה ב-<strong className="text-foreground">{currentDate}</strong>.
            אנו ממשיכים לעבוד על שיפור הנגישות באופן שוטף.
          </p>
        </section>

        {/* Known issues */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">בעיות נגישות ידועות</h2>
          <p className="text-muted-foreground leading-relaxed">
            אנו שואפים לנגישות מלאה ועובדים באופן שוטף לפתור כל בעיה שמתגלה. אם
            נתקלת בבעיה או קושי בשימוש באתר, נשמח לשמוע ממך כדי שנוכל לתקן
            ולשפר.
          </p>
        </section>

        {/* Contact information */}
        <section className="bg-gradient-to-br from-gold-50 to-gold-100 border border-gold-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            פרטי יצירת קשר בנושא נגישות
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            אם נתקלת בבעיית נגישות באתר, נתת לנו הערה או שיש לך שאלה בנושא
            הנגישות, ניתן ליצור קשר:
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-foreground">
              <Phone className="h-5 w-5 text-gold-500" />
              <a
                href="tel:054-345-3739"
                className="hover:text-gold-500 transition-colors"
              >
                054-345-3739
              </a>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Mail className="h-5 w-5 text-gold-500" />
              <a
                href="mailto:info@moshayov.co.il"
                className="hover:text-gold-500 transition-colors"
              >
                info@moshayov.co.il
              </a>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <MapPin className="h-5 w-5 text-gold-500" />
              <span>רבי עקיבא 113, בני ברק</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            נשתדל לחזור אליך בהקדם האפשרי, ובדרך כלל תוך 3 ימי עסקים.
          </p>
        </section>

        {/* Accessibility coordinator */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">רכז נגישות</h2>
          <div className="text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">שם:</strong> רכז נגישות מושיוב
            </p>
            <p>
              <strong className="text-foreground">טלפון:</strong>{' '}
              <a
                href="tel:054-345-3739"
                className="text-gold-500 hover:underline"
              >
                054-345-3739
              </a>
            </p>
            <p>
              <strong className="text-foreground">דוא״ל:</strong>{' '}
              <a
                href="mailto:info@moshayov.co.il"
                className="text-gold-500 hover:underline"
              >
                info@moshayov.co.il
              </a>
            </p>
          </div>
        </section>

        {/* Feedback */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">משוב והצעות לשיפור</h2>
          <p className="text-muted-foreground leading-relaxed">
            אנו מזמינים אותך לשתף אותנו במשוב, הערות או הצעות לשיפור הנגישות
            באתר. המשוב שלך חשוב לנו ומסייע לנו להמשיך לשפר את הנגישות עבור כלל
            המשתמשים. ניתן ליצור קשר דרך פרטי הקשר לעיל.
          </p>
        </section>
      </div>
    </div>
  );
}
