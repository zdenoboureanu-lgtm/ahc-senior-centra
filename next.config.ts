import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "*.convex.cloud" },
    ],
  },
  // 301 přesměrování ze starých (Webmium) cest na nové — zachování SEO pozic.
  // Tyto cesty sdílela většina původních *.ahc.cz webů. Per-pobočkové
  // speciality doplníme z klientových sitemap (NOVÝ sloupec v tabulce).
  async redirects() {
    const map: Record<string, string> = {
      "/domu": "/",
      "/uvod": "/",
      "/poskytovane-cinnosti": "/sluzby",
      "/poskytovane-sluzby": "/sluzby",
      "/nase-sluzby": "/sluzby",
      "/sluzby-a-cinnosti": "/sluzby",
      "/informace-pro-zajemce": "/sluzby",
      "/verejny-zavazek": "/o-nas",
      "/o-zarizeni": "/o-nas",
      "/o-spolecnosti": "/o-nas",
      "/fotogalerie": "/o-nas",
      "/galerie": "/o-nas",
      "/dokumenty-ke-stazeni": "/dokumenty",
      "/ke-stazeni": "/dokumenty",
      "/informace-o-platbach": "/dokumenty",
      "/vyberova-rizeni": "/kariera",
      "/volna-mista": "/kariera",
      "/aktuality": "/novinky",
      "/kontakty": "/kontakt",
      "/napiste-nam": "/kontakt",
    };
    return Object.entries(map).map(([source, destination]) => ({
      source,
      destination,
      statusCode: 301,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Allow Google Maps + Mapy.cz iframes in our pages
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
