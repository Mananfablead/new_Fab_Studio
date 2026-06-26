/**
 * SEOHead — Ek baar App.tsx mein lagao, sab pages pe auto kaam karega!
 *
 * Ye component current URL dekh ke seoConfig.ts se sahi meta data
 * uthata hai aur <head> mein inject karta hai.
 *
 * Kuch change karna ho? Bas seoConfig.ts kholo aur wahan update karo!
 */

import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { routeSEOMap, defaultSEO, type SEOMeta } from "@/config/seoConfig";

/** Current pathname ko routeSEOMap se match karo (dynamic segments bhi handle karta hai) */
function resolveSEO(pathname: string | undefined): SEOMeta {
  // Safety check - agar pathname undefined/empty hai to default return karo
  if (!pathname || pathname.trim() === "") return defaultSEO;

  // 1. Exact match
  if (routeSEOMap[pathname]) return routeSEOMap[pathname];

  // 2. Dynamic route matching — e.g. /gallery/abc123  →  /gallery
  //    /group-settings/xyz  →  /group-settings
  //    /portfolio/userId  →  /portfolio
  //    /join/token  →  /join
  //    /reset-password/uid/tok  →  /reset-password
  const segments = pathname.split("/").filter(Boolean); // ['gallery', 'abc123']

  // Try progressively shorter prefixes
  for (let i = segments.length; i >= 1; i--) {
    const prefix = "/" + segments.slice(0, i).join("/");
    if (routeSEOMap[prefix]) return routeSEOMap[prefix];
  }

  return defaultSEO;
}

const SITE_URL = "https://fabphotopic.fableadtech.com"; // apna domain yahan daal do

export default function SEOHead() {
  const location = useLocation();

  // Safe pathname extraction with fallback
  const pathname = location?.pathname || "/";
  const seo = resolveSEO(pathname);

  const fullTitle = seo.title;
  const canonicalUrl = `${SITE_URL}${pathname}`;

  return (
    <Helmet>
      {/* ── Primary Meta ─────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="author" content="Fablead Studio" />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Robots ───────────────────────────────────── */}
      {seo.noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* ── Open Graph ───────────────────────────────── */}
      <meta property="og:title" content={seo.ogTitle ?? seo.title} />
      <meta
        property="og:description"
        content={seo.ogDescription ?? seo.description}
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
      <meta property="og:site_name" content="FabPhotoPic" />

      {/* ── Twitter Card ─────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@fableadstudio" />
      <meta
        name="twitter:title"
        content={seo.twitterTitle ?? seo.ogTitle ?? seo.title}
      />
      <meta
        name="twitter:description"
        content={seo.twitterDescription ?? seo.ogDescription ?? seo.description}
      />
      {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}
    </Helmet>
  );
}
