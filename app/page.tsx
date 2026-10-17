import Landing from "@/components/Landing";
import { BLACK_LINE } from "@/data/black-line";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "BORGES PPF & DETAILING",
  "image": "https://detailing-demos-three.vercel.app/logo/logo-full-white.jpg",
  "@id": "https://detailing-demos-three.vercel.app/#organization",
  "url": "https://detailing-demos-three.vercel.app",
  "telephone": "+5491136453982",
  "priceRange": "$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Monte de Oca 42",
    "addressLocality": "Canning",
    "addressRegion": "Buenos Aires",
    "postalCode": "B1804",
    "addressCountry": "AR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -34.877,
    "longitude": -58.504
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "85",
    "bestRating": "5",
    "worstRating": "1"
  },
  "sameAs": [
    "https://www.instagram.com/borges.ppf.detailing"
  ]
};

export default function Home() {
  return (
    <>
      <Landing biz={BLACK_LINE} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
