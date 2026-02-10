import { Metadata } from 'next';
import { AboutContent } from './about-content';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moshayov.co.il';

export const metadata: Metadata = {
  title: 'אודות מושיוב - הסיפור שלנו',
  description: 'מושיוב - למעלה מ-40 שנות מסורת של יצירת תכשיטי זהב ויהלומים יוקרתיים בבני ברק. הכירו את הסיפור שלנו, הערכים והמסורת המשפחתית.',
  keywords: ['אודות מושיוב', 'תכשיטים בבני ברק', 'היסטוריה', 'מסורת', 'זהב', 'יהלומים', 'חנות תכשיטים'],
  openGraph: {
    title: 'אודות מושיוב - הסיפור שלנו | מושיוב',
    description: 'למעלה מ-40 שנות מסורת של יצירת תכשיטי זהב ויהלומים יוקרתיים',
    url: `${baseUrl}/about`,
    siteName: 'מושיוב - תכשיטי זהב ויהלומים',
    locale: 'he_IL',
    type: 'website',
  },
  alternates: {
    canonical: `${baseUrl}/about`,
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
