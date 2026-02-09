import { Metadata } from 'next';
import { FileText, Shield, CreditCard, Truck, RefreshCw, Scale, Diamond } from 'lucide-react';

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  description: 'תנאי השימוש באתר מושיוב - תכשיטי זהב ויהלומים',
};

const sections = [
  {
    icon: FileText,
    title: 'כללי',
    content: [
      'ברוכים הבאים לאתר מושיוב. השימוש באתר זה כפוף לתנאי השימוש המפורטים להלן.',
      'גלישה באתר ו/או רכישת מוצרים באמצעותו מהווה הסכמה לתנאים אלה.',
      'החברה שומרת לעצמה את הזכות לעדכן תנאים אלה מעת לעת, ללא הודעה מוקדמת.',
      'תנאי השימוש מנוסחים בלשון זכר מטעמי נוחות בלבד, אך מיועדים לכל המינים.',
    ],
  },
  {
    icon: Shield,
    title: 'אחריות על המוצרים',
    content: [
      'כל התכשיטים באתר עוברים בדיקת איכות קפדנית לפני המשלוח.',
      'אנו מתחייבים לאותנטיות של כל המוצרים - זהב 14K/18K ויהלומים מוסמכים.',
      'כל תכשיט מגיע עם תעודת אחריות ואותנטיות.',
      'האחריות על התכשיטים הינה לתקופה של 12 חודשים מיום הרכישה.',
      'האחריות אינה מכסה נזקים שנגרמו כתוצאה משימוש לא נכון או רשלנות.',
    ],
  },
  {
    icon: CreditCard,
    title: 'תשלום ומחירים',
    content: [
      'המחירים באתר כוללים מע"מ כחוק, אלא אם צוין אחרת.',
      'התשלום מתבצע באמצעות כרטיס אשראי או PayPal.',
      'החברה שומרת לעצמה את הזכות לשנות מחירים ללא הודעה מוקדמת.',
      'מחיר המוצר שנרכש יהיה המחיר שהיה בתוקף בעת ביצוע ההזמנה.',
      'במקרה של טעות במחיר, החברה רשאית לבטל את ההזמנה ולהחזיר את התשלום.',
    ],
  },
  {
    icon: Truck,
    title: 'משלוחים',
    content: [
      'המשלוחים מתבצעים באמצעות שליח עד הבית או לנקודות איסוף.',
      'זמן האספקה הינו עד 5 ימי עסקים מרגע אישור ההזמנה.',
      'משלוח חינם בהזמנות מעל 500 ש"ח.',
      'החברה אינה אחראית לעיכובים שנגרמים על ידי חברת השילוח.',
      'באחריות הלקוח לוודא שהכתובת למשלוח נכונה ומלאה.',
    ],
  },
  {
    icon: RefreshCw,
    title: 'החזרות וביטולים',
    content: [
      'ניתן להחזיר מוצר תוך 14 יום מיום קבלתו, בהתאם לחוק הגנת הצרכן.',
      'המוצר חייב להיות במצב חדש, ללא שימוש, באריזתו המקורית.',
      'תכשיטים מותאמים אישית אינם ניתנים להחזרה.',
      'ההחזר הכספי יבוצע באותה דרך התשלום תוך 14 ימי עסקים.',
      'עלות המשלוח של ההחזרה תנוכה מסכום ההחזר, אלא אם מדובר בפגם במוצר.',
    ],
  },
  {
    icon: Scale,
    title: 'קניין רוחני',
    content: [
      'כל התכנים באתר, לרבות תמונות, עיצובים וטקסטים, הם קניינה הבלעדי של החברה.',
      'אין להעתיק, לשכפל או להפיץ תכנים מהאתר ללא אישור בכתב.',
      'השימוש באתר הוא לצרכים אישיים בלבד ולא למטרות מסחריות.',
      'הפרת זכויות הקניין הרוחני עלולה לגרור הליכים משפטיים.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-primary text-primary-foreground overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="termsPattern" width="15" height="15" patternUnits="userSpaceOnUse">
                <path d="M7.5 0 L15 7.5 L7.5 15 L0 7.5 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#termsPattern)" className="text-gold-400" />
          </svg>
        </div>

        {/* Gold accent orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[80px]" />

        <div className="container mx-auto px-4 relative text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full mb-6">
            <FileText className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-400">מסמך משפטי</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span>תנאי </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
              שימוש
            </span>
          </h1>

          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            אנא קראו בעיון את תנאי השימוש לפני השימוש באתר
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">יש לכם שאלות?</h2>
              <p className="text-gray-600 mb-4">
                אם יש לכם שאלות לגבי תנאי השימוש, אתם מוזמנים ליצור איתנו קשר:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>טלפון: 03-1234567</p>
                <p>אימייל: info@moshayov.co.il</p>
                <p>כתובת: רבי עקיבא 113, בני ברק</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
