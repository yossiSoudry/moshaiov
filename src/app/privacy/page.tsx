import { Metadata } from 'next';
import { Lock, Database, Eye, Share2, Cookie, UserCheck, Mail, Diamond } from 'lucide-react';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות',
  description: 'מדיניות הפרטיות של אתר מושיוב - תכשיטי זהב ויהלומים',
};

const sections = [
  {
    icon: Database,
    title: 'איסוף מידע',
    content: [
      'אנו אוספים מידע שאתם מספקים לנו ישירות, כגון שם, כתובת, טלפון ואימייל בעת ביצוע הזמנה.',
      'מידע על העסקאות שלכם, כולל פרטי הזמנות ותשלומים.',
      'מידע טכני כגון כתובת IP, סוג דפדפן, ומכשיר בו אתם משתמשים.',
      'מידע על הפעילות שלכם באתר, כולל דפים שביקרתם ומוצרים שצפיתם.',
      'איננו אוספים מידע רגיש כגון נתוני כרטיס אשראי - אלה מעובדים ישירות על ידי ספק התשלום המאובטח.',
    ],
  },
  {
    icon: Eye,
    title: 'שימוש במידע',
    content: [
      'עיבוד והשלמת הזמנות שביצעתם באתר.',
      'שליחת עדכונים על סטטוס ההזמנה והמשלוח.',
      'מתן שירות לקוחות ומענה לפניות.',
      'שיפור האתר והתאמתו לצרכי המשתמשים.',
      'שליחת מבצעים והצעות מיוחדות (רק אם נתתם הסכמה לכך).',
      'מניעת הונאות ושמירה על אבטחת האתר.',
    ],
  },
  {
    icon: Share2,
    title: 'שיתוף מידע',
    content: [
      'איננו מוכרים את המידע האישי שלכם לצדדים שלישיים.',
      'אנו משתפים מידע עם ספקי שירות הכרחיים: חברות שילוח, ספקי תשלום, ושירותי אחסון.',
      'כל ספקי השירות שלנו מחויבים לשמור על סודיות המידע.',
      'ייתכן ונידרש לשתף מידע בהתאם לדרישות חוק או צו בית משפט.',
      'במקרה של מיזוג או רכישה, המידע יועבר לגוף הרוכש תחת אותן התחייבויות פרטיות.',
    ],
  },
  {
    icon: Lock,
    title: 'אבטחת מידע',
    content: [
      'אנו משתמשים בטכנולוגיות הצפנה מתקדמות (SSL) להגנה על המידע שלכם.',
      'הגישה למידע אישי מוגבלת לעובדים מורשים בלבד.',
      'אנו מבצעים בדיקות אבטחה תקופתיות למערכות שלנו.',
      'פרטי התשלום מעובדים בסביבה מאובטחת בתקן PCI DSS.',
      'למרות מאמצינו, אין שיטת העברה באינטרנט שהיא מאובטחת ב-100%.',
    ],
  },
  {
    icon: Cookie,
    title: 'עוגיות (Cookies)',
    content: [
      'האתר משתמש בעוגיות לשיפור חוויית הגלישה שלכם.',
      'עוגיות הכרחיות - נדרשות לתפקוד בסיסי של האתר וסל הקניות.',
      'עוגיות אנליטיות - מסייעות לנו להבין כיצד משתמשים באתר.',
      'עוגיות שיווקיות - מאפשרות להציג לכם פרסומות רלוונטיות.',
      'תוכלו לנהל את העדפות העוגיות דרך הגדרות הדפדפן שלכם.',
    ],
  },
  {
    icon: UserCheck,
    title: 'זכויות המשתמש',
    content: [
      'הזכות לגשת למידע האישי שאנו מחזיקים עליכם.',
      'הזכות לתקן מידע שגוי או לא מעודכן.',
      'הזכות לבקש מחיקת המידע האישי שלכם ("הזכות להישכח").',
      'הזכות להתנגד לעיבוד המידע למטרות שיווק.',
      'הזכות לבטל הסכמה לקבלת דיוור שיווקי בכל עת.',
      'לממש את זכויותיכם, אנא פנו אלינו באמצעות פרטי הקשר למטה.',
    ],
  },
  {
    icon: Mail,
    title: 'דיוור ותקשורת',
    content: [
      'נשלח לכם אימיילים הקשורים להזמנות שביצעתם (אישור הזמנה, עדכוני משלוח).',
      'דיוור שיווקי יישלח רק אם נתתם הסכמה מפורשת.',
      'תוכלו להסיר את עצמכם מרשימת הדיוור בכל עת באמצעות קישור בתחתית האימייל.',
      'גם לאחר הסרה מהדיוור השיווקי, נמשיך לשלוח הודעות הכרחיות הקשורות להזמנות.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-primary text-primary-foreground overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="privacyPattern" width="15" height="15" patternUnits="userSpaceOnUse">
                <path d="M7.5 0 L15 7.5 L7.5 15 L0 7.5 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#privacyPattern)" className="text-gold-400" />
          </svg>
        </div>

        {/* Gold accent orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[80px]" />

        <div className="container mx-auto px-4 relative text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6">
            <Lock className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-400">הגנה על המידע שלכם</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span>מדיניות </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
              פרטיות
            </span>
          </h1>

          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            פרטיותכם חשובה לנו. כאן תוכלו לקרוא כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/50" />
            <Diamond className="w-4 h-4 text-gold-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
          </div>

          <p className="text-sm text-primary-foreground/50 mt-6">
            עדכון אחרון: פברואר 2024
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-black/5 border border-gray-100">
              <p className="text-gray-600 leading-relaxed text-lg">
                מדיניות פרטיות זו מתארת כיצד מושיוב ("אנחנו", "שלנו") אוספת, משתמשת ומגנה על המידע האישי
                שלכם בעת שימוש באתר שלנו. אנו מחויבים להגנה על פרטיותכם ופועלים בהתאם לחוק הגנת הפרטיות,
                התשמ"א-1981 ותקנות הגנת הפרטיות.
              </p>
            </div>

            {sections.map((section, index) => (
              <div
                key={section.title}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-black/5 border border-gray-100 hover:border-gold-200 transition-colors"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-gold-600 font-medium">סעיף {index + 1}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                </div>

                <ul className="space-y-4">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact section */}
            <div className="bg-gradient-to-br from-gold-50 to-amber-50 rounded-2xl p-8 border border-gold-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">יצירת קשר בנושא פרטיות</h2>
              <p className="text-gray-600 mb-4">
                אם יש לכם שאלות לגבי מדיניות הפרטיות שלנו, או אם ברצונכם לממש את זכויותיכם בנוגע למידע האישי שלכם,
                אנא פנו אלינו:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>טלפון: 03-1234567</p>
                <p>אימייל: privacy@moshayov.co.il</p>
                <p>כתובת: רבי עקיבא 113, בני ברק</p>
              </div>
            </div>

            {/* Last update notice */}
            <div className="text-center text-gray-500 text-sm">
              <p>מדיניות זו עודכנה לאחרונה בפברואר 2024.</p>
              <p>אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באתר.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
